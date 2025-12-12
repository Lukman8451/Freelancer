import WalletService from "../service/concrete/WalletService.js";
import WithdrawalRequestService from "../service/concrete/WithdrawalRequestService.js";
import { sequelize } from "../model/index.js";

class WalletController {
    // Get user's wallet
    getMyWallet = async (req, res) => {
        try {
            const wallet = await WalletService.getWalletByUserId(req.user.id);
            
            // Get recent transactions
            const transactions = await WalletService.getUserWalletTransactions(req.user.id);
            
            return res.status(200).json({
                wallet: {
                    id: wallet.id,
                    balance: wallet.balance,
                    totalEarned: wallet.totalEarned,
                    totalWithdrawn: wallet.totalWithdrawn,
                    userId: wallet.userId
                },
                recentTransactions: transactions.slice(0, 10) // Last 10 transactions
            });
        } catch (error) {
            console.error("Get wallet error:", error);
            return res.status(500).json({
                error: "Failed to fetch wallet",
                details: error.message
            });
        }
    };

    // Get wallet transactions
    getWalletTransactions = async (req, res) => {
        try {
            const { offset = 0, limit = 50 } = req.query;
            const wallet = await WalletService.getWalletByUserId(req.user.id);
            const transactions = await WalletService.getWalletTransactions(wallet.id, parseInt(offset), parseInt(limit));
            
            return res.status(200).json({
                transactions,
                wallet: {
                    id: wallet.id,
                    balance: wallet.balance
                }
            });
        } catch (error) {
            console.error("Get wallet transactions error:", error);
            return res.status(500).json({
                error: "Failed to fetch wallet transactions",
                details: error.message
            });
        }
    };

    // Create withdrawal request
    createWithdrawalRequest = async (req, res) => {
        const transaction = await sequelize.transaction();
        
        try {
            const { amount, bankAccountNumber, bankIfscCode, bankAccountHolderName } = req.body;

            if (!amount || amount <= 0) {
                await transaction.rollback();
                return res.status(400).json({ error: "Valid withdrawal amount is required" });
            }

            if (!bankAccountNumber || !bankIfscCode || !bankAccountHolderName) {
                await transaction.rollback();
                return res.status(400).json({ error: "Bank account details are required" });
            }

            const withdrawalRequest = await WithdrawalRequestService.createWithdrawalRequest({
                userId: req.user.id,
                amount: parseFloat(amount),
                bankAccountNumber,
                bankIfscCode,
                bankAccountHolderName
            });

            await transaction.commit();

            return res.status(201).json({
                message: "Withdrawal request created successfully",
                withdrawalRequest
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Create withdrawal request error:", error);
            return res.status(500).json({
                error: error.message || "Failed to create withdrawal request",
                details: error.message
            });
        }
    };

    // Get my withdrawal requests
    getMyWithdrawalRequests = async (req, res) => {
        try {
            const requests = await WithdrawalRequestService.getWithdrawalRequestsByUserId(req.user.id);
            
            return res.status(200).json({
                withdrawalRequests: requests
            });
        } catch (error) {
            console.error("Get withdrawal requests error:", error);
            return res.status(500).json({
                error: "Failed to fetch withdrawal requests",
                details: error.message
            });
        }
    };

    // Get all withdrawal requests (admin only)
    getAllWithdrawalRequests = async (req, res) => {
        try {
            if (req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. Admin access required" });
            }

            const { offset = 0, limit = 50, status } = req.query;
            const filters = {};
            if (status) filters.status = status;

            const result = await WithdrawalRequestService.getAllWithdrawalRequests(
                parseInt(offset),
                parseInt(limit),
                filters
            );

            return res.status(200).json({
                withdrawalRequests: result.rows,
                total: result.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } catch (error) {
            console.error("Get all withdrawal requests error:", error);
            return res.status(500).json({
                error: "Failed to fetch withdrawal requests",
                details: error.message
            });
        }
    };

    // Process withdrawal request (admin only)
    processWithdrawalRequest = async (req, res) => {
        const transaction = await sequelize.transaction();
        
        try {
            if (req.user.role !== "admin") {
                await transaction.rollback();
                return res.status(403).json({ error: "Forbidden. Admin access required" });
            }

            const { id } = req.params;
            const { status, transactionId, rejectionReason } = req.body;

            if (!status) {
                await transaction.rollback();
                return res.status(400).json({ error: "Status is required" });
            }

            const validStatuses = ["processing", "completed", "rejected", "failed"];
            if (!validStatuses.includes(status)) {
                await transaction.rollback();
                return res.status(400).json({ error: "Invalid status" });
            }

            const withdrawalRequest = await WithdrawalRequestService.processWithdrawal(
                id,
                status,
                req.user.id,
                transactionId,
                rejectionReason
            );

            await transaction.commit();

            return res.status(200).json({
                message: `Withdrawal request ${status} successfully`,
                withdrawalRequest
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Process withdrawal request error:", error);
            return res.status(500).json({
                error: error.message || "Failed to process withdrawal request",
                details: error.message
            });
        }
    };
}

export default new WalletController();

