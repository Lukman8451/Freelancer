import { WithdrawalRequest } from "../../model/index.js";
import { Op } from "sequelize";

class WithdrawalRequestRepository {
    create = async (requestData) => {
        return await WithdrawalRequest.create(requestData);
    };

    findById = async (id) => {
        return await WithdrawalRequest.findByPk(id, {
            include: [
                { association: 'wallet' },
                { association: 'user', attributes: ['id', 'name', 'email'] }
            ]
        });
    };

    findByUserId = async (userId) => {
        return await WithdrawalRequest.findAll({
            where: { userId: userId },
            include: [
                { association: 'wallet' }
            ],
            order: [['createdAt', 'DESC']]
        });
    };

    findByWalletId = async (walletId) => {
        return await WithdrawalRequest.findAll({
            where: { walletId: walletId },
            include: [
                { association: 'user', attributes: ['id', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    };

    findByStatus = async (status) => {
        return await WithdrawalRequest.findAll({
            where: { status: status },
            include: [
                { association: 'wallet' },
                { association: 'user', attributes: ['id', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    };

    findAll = async (offset = 0, limit = 50, filters = {}) => {
        const whereConditions = {};
        
        if (filters.status) {
            whereConditions.status = filters.status;
        }
        if (filters.userId) {
            whereConditions.userId = filters.userId;
        }

        return await WithdrawalRequest.findAndCountAll({
            where: whereConditions,
            include: [
                { association: 'wallet' },
                { association: 'user', attributes: ['id', 'name', 'email'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            distinct: true
        });
    };

    update = async (id, updateData) => {
        const [updatedRowsCount] = await WithdrawalRequest.update(updateData, {
            where: { id: id }
        });
        if (updatedRowsCount === 0) {
            return null;
        }
        return await this.findById(id);
    };

    updateStatus = async (id, status, processedBy = null, transactionId = null) => {
        const updateData = {
            status: status,
            processedAt: status === 'completed' || status === 'rejected' ? new Date() : null
        };
        
        if (processedBy) {
            updateData.processedBy = processedBy;
        }
        if (transactionId) {
            updateData.transactionId = transactionId;
        }
        
        return await this.update(id, updateData);
    };
}

export default new WithdrawalRequestRepository();

