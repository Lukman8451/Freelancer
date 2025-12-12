import { WalletTransaction } from "../../model/index.js";
import { Op } from "sequelize";

class WalletTransactionRepository {
    create = async (transactionData) => {
        return await WalletTransaction.create(transactionData);
    };

    findById = async (id) => {
        return await WalletTransaction.findByPk(id, {
            include: [
                { association: 'wallet' },
                { association: 'milestone' },
                { association: 'paymentOrder' }
            ]
        });
    };

    findByWalletId = async (walletId) => {
        return await WalletTransaction.findAll({
            where: { walletId: walletId },
            include: [
                { association: 'milestone' },
                { association: 'paymentOrder' }
            ],
            order: [['createdAt', 'DESC']]
        });
    };

    findByUserId = async (userId) => {
        // Get wallet first, then transactions
        const { Wallet } = await import("../../model/index.js");
        const wallet = await Wallet.findOne({ where: { userId: userId } });
        if (!wallet) return [];
        
        return await this.findByWalletId(wallet.id);
    };

    findByMilestoneId = async (milestoneId) => {
        return await WalletTransaction.findAll({
            where: { milestoneId: milestoneId },
            include: [
                { association: 'wallet' },
                { association: 'paymentOrder' }
            ],
            order: [['createdAt', 'DESC']]
        });
    };

    findByPaymentOrderId = async (paymentOrderId) => {
        return await WalletTransaction.findAll({
            where: { paymentOrderId: paymentOrderId },
            include: [
                { association: 'wallet' },
                { association: 'milestone' }
            ],
            order: [['createdAt', 'DESC']]
        });
    };

    findAll = async (offset = 0, limit = 50, filters = {}) => {
        const whereConditions = {};
        
        if (filters.type) {
            whereConditions.type = filters.type;
        }
        if (filters.status) {
            whereConditions.status = filters.status;
        }
        if (filters.walletId) {
            whereConditions.walletId = filters.walletId;
        }

        return await WalletTransaction.findAndCountAll({
            where: whereConditions,
            include: [
                { association: 'wallet' },
                { association: 'milestone' },
                { association: 'paymentOrder' }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            distinct: true
        });
    };
}

export default new WalletTransactionRepository();

