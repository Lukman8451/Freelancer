import PaymentOrderService from "../service/concrete/PaymentOrderService.js";
import MilestoneService from "../service/concrete/MilestoneService.js";
import ContractService from "../service/concrete/ContractService.js";
import ProfileService from "../service/concrete/ProfileService.js";
import MilestoneController from "./MilestoneController.js";
import { sequelize } from "../model/index.js";
import { env } from "../config/config.js";
import Razorpay from "razorpay";
import crypto from "crypto";

class PaymentOrderController {
    // Create payment order (initiate payment)
    createPaymentOrder = async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { milestoneId, userId } = req.body;

            if (!milestoneId) {
                await transaction.rollback();
                return res.status(400).json({ error: "Milestone ID is required" });
            }

            // Check if milestone exists
            const milestone = await MilestoneService.getMilestoneById(milestoneId);
            if (!milestone) {
                await transaction.rollback();
                return res.status(404).json({ error: "Milestone not found" });
            }

            // Check if milestone is pending
            if (milestone.status !== "pending") {
                await transaction.rollback();
                return res.status(400).json({ error: "Milestone is already funded or released" });
            }

            // Get contract to verify ownership
            const contract = await ContractService.getContractById(milestone.contractId);
            if (contract.clientId !== req.user.id && req.user.role !== "admin") {
                await transaction.rollback();
                return res.status(403).json({ error: "Forbidden. Only client can fund milestones" });
            }

            // Milestone amounts are stored in USD
            // For Razorpay, we'll convert to INR for payment (Razorpay works best with INR)
            // Amounts are stored in USD but payment happens in INR
            let currency = "INR"; // Use INR for Razorpay (Indian payment gateway)
            let paymentAmount = milestone.amount; // Start with USD amount
            
            // Convert USD to INR for Razorpay payment
            // Exchange rate: 1 USD = 83 INR (update with real-time rates in production)
            const USD_TO_INR_RATE = 83.0;
            paymentAmount = milestone.amount * USD_TO_INR_RATE;
            
            // Note: User's currency preference can be used for display, but payment in INR
            // This ensures compatibility with Razorpay's Indian payment gateway
            
            // Convert amount to smallest currency unit
            // USD uses cents (100 cents = 1 dollar), INR uses paise (100 paise = 1 rupee)
            // All supported currencies use 100 subunits = 1 unit
            let amountInSmallestUnit = Math.round(paymentAmount * 100);
            
            // Create Razorpay order
            const razorpay = new Razorpay({
                key_id: env.RAZORPAY_KEY_ID,
                key_secret: env.RAZORPAY_KEY_SECRET
            });

            // Generate receipt (max 40 characters for Razorpay)
            // Use first 8 chars of milestoneId to keep it short
            const receiptShort = milestoneId.substring(0, 8).replace(/-/g, '');
            const receipt = `ms_${receiptShort}`;
            
            const razorpayOrder = await razorpay.orders.create({
                amount: amountInSmallestUnit,
                currency: currency,
                receipt: receipt,
                notes: {
                    milestoneId: milestoneId,
                    userId: req.user.id,
                    originalCurrency: "USD", // Original amount is in USD
                    originalAmount: milestone.amount // Store original USD amount
                }
            });

            // Create payment order in database
            // Store original USD amount, payment happens in INR
            const paymentOrder = await PaymentOrderService.create({
                milestoneId,
                userId: userId || req.user.id,
                razorpayOrderId: razorpayOrder.id,
                amount: milestone.amount, // Store original USD amount
                currency: "INR", // Payment currency (always INR for Razorpay)
                status: "created"
            });

            await transaction.commit();

            return res.status(201).json({
                message: "Payment order created successfully",
                paymentOrder,
                razorpayOrder: {
                    id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency
                },
                razorpayKeyId: env.RAZORPAY_KEY_ID // Send key ID to frontend for checkout
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Create payment order error:", error);
            return res.status(500).json({
                error: "Failed to create payment order",
                details: error.message
            });
        }
    };

    // Get payment order by ID
    getPaymentOrderById = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "Payment Order ID is required" });
            }

            const paymentOrder = await PaymentOrderService.getPaymentOrderById(id);
            if (!paymentOrder) {
                return res.status(404).json({ error: "Payment order not found" });
            }

            return res.status(200).json({ paymentOrder });
        } catch (error) {
            console.error("Get payment order error:", error);
            return res.status(500).json({
                error: "Failed to fetch payment order",
                details: error.message
            });
        }
    };

    // Get all payment orders
    getAllPaymentOrders = async (req, res) => {
        try {
            const {
                keyword = "",
                limit = 50,
                offset = 0,
                orderBy = "createdAt",
                sortBy = "DESC",
                filters
            } = req.query;

            let parsedFilters = [];
            if (filters) {
                try {
                    parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
                } catch (e) {
                    parsedFilters = [];
                }
            }

            const result = await PaymentOrderService.getAllPaymentOrders(
                parseInt(offset),
                parseInt(limit),
                keyword,
                orderBy,
                sortBy,
                parsedFilters
            );

            return res.status(200).json({
                paymentOrders: result.rows,
                total: result.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } catch (error) {
            console.error("Get all payment orders error:", error);
            return res.status(500).json({
                error: "Failed to fetch payment orders",
                details: error.message
            });
        }
    };

    // Get payment orders by user ID
    getPaymentOrdersByUserId = async (req, res) => {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({ error: "User ID is required" });
            }

            const paymentOrders = await PaymentOrderService.getPaymentOrdersByUserId(userId);

            return res.status(200).json({ paymentOrders });
        } catch (error) {
            console.error("Get user payment orders error:", error);
            return res.status(500).json({
                error: "Failed to fetch payment orders",
                details: error.message
            });
        }
    };

    // Verify payment (called after Razorpay payment)
    verifyPayment = async (req, res) => {
        const transaction = await sequelize.transaction();
        
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                await transaction.rollback();
                return res.status(400).json({ error: "Payment verification data is required" });
            }

            // Initialize Razorpay
            const razorpay = new Razorpay({
                key_id: env.RAZORPAY_KEY_ID,
                key_secret: env.RAZORPAY_KEY_SECRET
            });

            // Verify payment signature
            const text = `${razorpay_order_id}|${razorpay_payment_id}`;
            const generatedSignature = crypto
                .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
                .update(text)
                .digest('hex');

            if (generatedSignature !== razorpay_signature) {
                await transaction.rollback();
                return res.status(400).json({ error: "Invalid payment signature" });
            }

            // Find payment order
            const paymentOrder = await PaymentOrderService.getPaymentOrderByRazorpayId(razorpay_order_id);
            if (!paymentOrder) {
                await transaction.rollback();
                return res.status(404).json({ error: "Payment order not found" });
            }

            // Check if already paid
            if (paymentOrder.status === "paid") {
                await transaction.rollback();
                return res.status(200).json({ 
                    message: "Payment already verified",
                    paymentOrder 
                });
            }

            // Update payment status to paid
            await PaymentOrderService.updatePaymentOrderStatus(paymentOrder.id, "paid");

            // Update milestone status to funded, then automatically release it
            if (paymentOrder.milestoneId) {
                // First update to funded
                await MilestoneService.updateMilestoneStatus(paymentOrder.milestoneId, "funded");
                
                // Get milestone and contract to auto-release
                const milestone = await MilestoneService.getMilestoneById(paymentOrder.milestoneId);
                if (milestone) {
                    const contract = await ContractService.getContractById(milestone.contractId);
                    if (contract) {
                        // Auto-release: credit wallet and update status to released
                        try {
                            await MilestoneController.creditWalletForMilestone(milestone, contract);
                            // Update milestone status to released after wallet is credited
                            await MilestoneService.updateMilestoneStatus(paymentOrder.milestoneId, "released");
                            console.log("✅ Milestone automatically released after successful payment");
                        } catch (walletError) {
                            console.error("Error auto-releasing milestone after payment:", walletError);
                            // Don't fail the payment verification if wallet credit fails
                            // The milestone is still marked as funded and can be manually released later
                        }
                    }
                }
            }

            await transaction.commit();

            return res.status(200).json({
                message: "Payment verified successfully",
                paymentOrder: await PaymentOrderService.getPaymentOrderById(paymentOrder.id)
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Verify payment error:", error);
            return res.status(500).json({
                error: "Failed to verify payment",
                details: error.message
            });
        }
    };

    // Update payment order status (webhook handler)
    updatePaymentOrderStatus = async (req, res) => {
        try {
            const { razorpayOrderId, status } = req.body;

            if (!razorpayOrderId) {
                return res.status(400).json({ error: "Razorpay Order ID is required" });
            }

            if (!status) {
                return res.status(400).json({ error: "Status is required" });
            }

            const validStatuses = ["created", "paid", "failed"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }

            // Find payment order
            const paymentOrder = await PaymentOrderService.getPaymentOrderByRazorpayId(razorpayOrderId);
            if (!paymentOrder) {
                return res.status(404).json({ error: "Payment order not found" });
            }

            // Update payment status
            const result = await PaymentOrderService.updatePaymentOrderStatus(paymentOrder.id, status);
            if (!result || result[0] === 0) {
                return res.status(404).json({ error: "Payment order not found" });
            }

            // If payment is successful, update milestone status to funded, then auto-release
            if (status === "paid" && paymentOrder.milestoneId) {
                // First update to funded
                await MilestoneService.updateMilestoneStatus(paymentOrder.milestoneId, "funded");
                
                // Get milestone and contract to auto-release
                const milestone = await MilestoneService.getMilestoneById(paymentOrder.milestoneId);
                if (milestone) {
                    const contract = await ContractService.getContractById(milestone.contractId);
                    if (contract) {
                        // Auto-release: credit wallet and update status to released
                        try {
                            await MilestoneController.creditWalletForMilestone(milestone, contract);
                            // Update milestone status to released after wallet is credited
                            await MilestoneService.updateMilestoneStatus(paymentOrder.milestoneId, "released");
                            console.log("✅ Milestone automatically released after successful payment (webhook)");
                        } catch (walletError) {
                            console.error("Error auto-releasing milestone after payment (webhook):", walletError);
                            // Don't fail the status update if wallet credit fails
                        }
                    }
                }
            }

            return res.status(200).json({ message: "Payment order status updated successfully" });
        } catch (error) {
            console.error("Update payment order status error:", error);
            return res.status(500).json({
                error: "Failed to update payment order status",
                details: error.message
            });
        }
    };

    // Delete payment order
    deletePaymentOrder = async (req, res) => {
        try {
            const { id } = req.params;

            // Only admins can delete payment orders
            if (req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. Only admins can delete payment orders" });
            }

            const result = await PaymentOrderService.deletePaymentOrder(id);
            if (!result) {
                return res.status(404).json({ error: "Payment order not found" });
            }

            return res.status(200).json({ message: "Payment order deleted successfully" });
        } catch (error) {
            console.error("Delete payment order error:", error);
            return res.status(500).json({
                error: "Failed to delete payment order",
                details: error.message
            });
        }
    };
}

export default new PaymentOrderController();

