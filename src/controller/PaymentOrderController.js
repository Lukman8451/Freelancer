import PaymentOrderService from "../service/concrete/PaymentOrderService.js";
import MilestoneService from "../service/concrete/MilestoneService.js";
import ContractService from "../service/concrete/ContractService.js";
import { sequelize } from "../model/index.js";
import { env } from "../config/config.js";
import Razorpay from "razorpay";

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

            // Create Razorpay order
            const razorpay = new Razorpay({
                key_id: env.RAZORPAY_KEY_ID,
                key_secret: env.RAZORPAY_KEY_SECRET
            });

            const razorpayOrder = await razorpay.orders.create({
                amount: Math.round(milestone.amount * 100), // Convert to paise
                currency: "INR",
                receipt: `milestone_${milestoneId}`,
                notes: {
                    milestoneId: milestoneId,
                    userId: req.user.id
                }
            });

            // Create payment order in database
            const paymentOrder = await PaymentOrderService.create({
                milestoneId,
                userId: userId || req.user.id,
                razorpayOrderId: razorpayOrder.id,
                amount: milestone.amount,
                currency: "INR",
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
                }
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

            // If payment is successful, update milestone status to funded
            if (status === "paid" && paymentOrder.milestoneId) {
                await MilestoneService.updateMilestoneStatus(paymentOrder.milestoneId, "funded");
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

