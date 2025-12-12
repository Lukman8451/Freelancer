import WithdrawalRequestRepository from "../../data-access/concrete/WithdrawalRequestRepository.js";
import WalletService from "./WalletService.js";
import { sequelize } from "../../model/index.js";

export class WithdrawalRequestService {
    constructor() {
        this.WithdrawalRequestRepository = WithdrawalRequestRepository;
        this.WalletService = WalletService;
    }

    // Create withdrawal request
    createWithdrawalRequest = async (requestData) => {
        const transaction = await sequelize.transaction();
        
        try {
            const { userId, amount, bankAccountNumber, bankIfscCode, bankAccountHolderName } = requestData;

            // Get or create wallet
            const wallet = await this.WalletService.getWalletByUserId(userId);
            
            // Check if sufficient balance
            if (parseFloat(wallet.balance) < parseFloat(amount)) {
                throw new Error("Insufficient wallet balance");
            }

            // Check minimum withdrawal amount (optional)
            const MIN_WITHDRAWAL = 10.0; // Minimum $10
            if (parseFloat(amount) < MIN_WITHDRAWAL) {
                throw new Error(`Minimum withdrawal amount is $${MIN_WITHDRAWAL}`);
            }

            // Create withdrawal request
            const withdrawalRequest = await this.WithdrawalRequestRepository.create({
                walletId: wallet.id,
                userId: userId,
                amount: parseFloat(amount),
                bankAccountNumber: bankAccountNumber,
                bankIfscCode: bankIfscCode,
                bankAccountHolderName: bankAccountHolderName,
                status: 'pending'
            });

            // Debit wallet immediately (hold the amount)
            await this.WalletService.debitWallet(
                wallet.id,
                amount,
                `Withdrawal request: $${amount.toFixed(2)}`
            );

            await transaction.commit();
            return withdrawalRequest;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    };

    // Get withdrawal request by ID
    getWithdrawalRequestById = async (id) => {
        return await this.WithdrawalRequestRepository.findById(id);
    };

    // Get withdrawal requests by user
    getWithdrawalRequestsByUserId = async (userId) => {
        return await this.WithdrawalRequestRepository.findByUserId(userId);
    };

    // Get withdrawal requests by status
    getWithdrawalRequestsByStatus = async (status) => {
        return await this.WithdrawalRequestRepository.findByStatus(status);
    };

    // Get all withdrawal requests
    getAllWithdrawalRequests = async (offset = 0, limit = 50, filters = {}) => {
        return await this.WithdrawalRequestRepository.findAll(offset, limit, filters);
    };

    // Process withdrawal (admin action)
    processWithdrawal = async (requestId, status, processedBy, transactionId = null, rejectionReason = null) => {
        const transaction = await sequelize.transaction();
        
        try {
            const withdrawalRequest = await this.WithdrawalRequestRepository.findById(requestId);
            if (!withdrawalRequest) {
                throw new Error("Withdrawal request not found");
            }

            if (withdrawalRequest.status !== 'pending' && withdrawalRequest.status !== 'processing') {
                throw new Error("Withdrawal request cannot be processed in current status");
            }

            // Update status
            await this.WithdrawalRequestRepository.updateStatus(
                requestId,
                status,
                processedBy,
                transactionId
            );

            // If rejected or failed, refund to wallet
            if (status === 'rejected' || status === 'failed') {
                const wallet = await this.WalletService.getWalletById(withdrawalRequest.walletId);
                await this.WalletService.creditWallet(
                    wallet.id,
                    withdrawalRequest.amount,
                    `Withdrawal refund: ${rejectionReason || 'Withdrawal rejected/failed'}`,
                    null,
                    null
                );
            }

            // If rejected, add rejection reason
            if (status === 'rejected' && rejectionReason) {
                await this.WithdrawalRequestRepository.update(requestId, {
                    rejectionReason: rejectionReason
                });
            }

            await transaction.commit();
            return await this.WithdrawalRequestRepository.findById(requestId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    };
}

export default new WithdrawalRequestService();

