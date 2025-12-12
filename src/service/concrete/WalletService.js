import WalletRepository from "../../data-access/concrete/WalletRepository.js";
import WalletTransactionRepository from "../../data-access/concrete/WalletTransactionRepository.js";
import { sequelize } from "../../model/index.js";

export class WalletService {
    constructor() {
        this.WalletRepository = WalletRepository;
        this.WalletTransactionRepository = WalletTransactionRepository;
    }

    // Create wallet for user (if doesn't exist)
    createWallet = async (userId) => {
        // Check if wallet already exists
        const existingWallet = await this.WalletRepository.findByUserId(userId);
        if (existingWallet) {
            return existingWallet;
        }
        
        return await this.WalletRepository.create({
            userId: userId,
            balance: 0.0,
            totalEarned: 0.0,
            totalWithdrawn: 0.0
        });
    };

    // Get wallet by user ID
    getWalletByUserId = async (userId) => {
        let wallet = await this.WalletRepository.findByUserId(userId);
        
        // Create wallet if doesn't exist
        if (!wallet) {
            wallet = await this.createWallet(userId);
        }
        
        return wallet;
    };

    // Get wallet by ID
    getWalletById = async (id) => {
        return await this.WalletRepository.findById(id);
    };

    // Credit wallet (add money)
    creditWallet = async (walletId, amount, description, milestoneId = null, paymentOrderId = null) => {
        const dbTransaction = await sequelize.transaction();
        
        try {
            const wallet = await this.WalletRepository.findById(walletId);
            if (!wallet) {
                throw new Error("Wallet not found");
            }

            const balanceBefore = parseFloat(wallet.balance);
            const creditAmount = parseFloat(amount);
            const balanceAfter = balanceBefore + creditAmount;

            // Update wallet balance
            await this.WalletRepository.incrementBalance(walletId, creditAmount);

            // Create transaction record
            const walletTransaction = await this.WalletTransactionRepository.create({
                walletId: walletId,
                milestoneId: milestoneId,
                paymentOrderId: paymentOrderId,
                type: 'credit',
                amount: creditAmount,
                balanceBefore: balanceBefore,
                balanceAfter: balanceAfter,
                description: description || `Wallet credited with $${creditAmount.toFixed(2)}`,
                status: 'completed'
            });

            await dbTransaction.commit();
            return walletTransaction;
        } catch (error) {
            await dbTransaction.rollback();
            throw error;
        }
    };

    // Debit wallet (deduct money)
    debitWallet = async (walletId, amount, description) => {
        const dbTransaction = await sequelize.transaction();
        
        try {
            const wallet = await this.WalletRepository.findById(walletId);
            if (!wallet) {
                throw new Error("Wallet not found");
            }

            const balanceBefore = parseFloat(wallet.balance);
            const debitAmount = parseFloat(amount);
            const balanceAfter = balanceBefore - debitAmount;

            if (balanceAfter < 0) {
                throw new Error("Insufficient wallet balance");
            }

            // Update wallet balance
            await this.WalletRepository.decrementBalance(walletId, debitAmount);

            // Create transaction record
            const walletTransaction = await this.WalletTransactionRepository.create({
                walletId: walletId,
                type: 'debit',
                amount: debitAmount,
                balanceBefore: balanceBefore,
                balanceAfter: balanceAfter,
                description: description || `Wallet debited $${debitAmount.toFixed(2)}`,
                status: 'completed'
            });

            await dbTransaction.commit();
            return walletTransaction;
        } catch (error) {
            await dbTransaction.rollback();
            throw error;
        }
    };

    // Get wallet transactions
    getWalletTransactions = async (walletId, offset = 0, limit = 50) => {
        return await this.WalletTransactionRepository.findByWalletId(walletId);
    };

    // Get user wallet transactions
    getUserWalletTransactions = async (userId) => {
        return await this.WalletTransactionRepository.findByUserId(userId);
    };
}

export default new WalletService();

