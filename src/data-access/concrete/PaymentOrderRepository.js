import { Op, where, cast, col, fn } from "sequelize";
import { PaymentOrder, Milestone, User } from "../../model/index.js";

class PaymentOrderRepository {
    create = async (paymentData) => {
        return await PaymentOrder.create(paymentData);
    };

    findById = async (id) => {
        return await PaymentOrder.findByPk(id, {
            include: [
                { association: 'milestone' },
                { association: 'user', attributes: ['id', 'name', 'email'] }
            ]
        });
    };

    findAll = async (offset, limit, keyword = "", orderBy = "createdAt", sortBy = "DESC", filters) => {
        let whereConditions = {};

        if (keyword && keyword.trim() !== '') {
            whereConditions = {
                [Op.or]: [
                    where(cast(col("razorpayOrderId"), "TEXT"), { [Op.iLike]: `%${keyword}%` })
                ]
            };
        }

        if (filters && Array.isArray(filters)) {
            for (const filter of filters) {
                const { column, operator, value } = filter;
                if (!column || value === undefined) continue;

                whereConditions[column] = (operator === 'equals')
                    ? { [Op.eq]: String(value) }
                    : where(cast(col(column), 'TEXT'), { [Op.iLike]: `%${value}%` });
            }
        }

        return await PaymentOrder.findAndCountAll({
            where: whereConditions,
            limit,
            offset,
            include: [
                { association: 'milestone' },
                { association: 'user', attributes: ['id', 'name', 'email'] }
            ],
            order: [[orderBy, sortBy]],
            distinct: true
        });
    };

    findByUserId = async (userId) => {
        return await PaymentOrder.findAll({
            where: { userId: userId },
            include: [
                { association: 'milestone' }
            ],
            order: [['createdAt', 'DESC']]
        });
    };

    findByMilestoneId = async (milestoneId) => {
        return await PaymentOrder.findOne({
            where: { milestoneId: milestoneId },
            include: [
                { association: 'user', attributes: ['id', 'name', 'email'] }
            ]
        });
    };

    findByStatus = async (status) => {
        return await PaymentOrder.findAll({
            where: { status: status },
            include: [
                { association: 'milestone' },
                { association: 'user', attributes: ['id', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    };

    findByRazorpayOrderId = async (razorpayOrderId) => {
        return await PaymentOrder.findOne({
            where: { razorpayOrderId: razorpayOrderId }
        });
    };

    update = async (id, updateData) => {
        return await PaymentOrder.update(updateData, { where: { id: id } });
    };

    updateStatus = async (id, status) => {
        return await PaymentOrder.update({ status: status }, { where: { id: id } });
    };

    delete = async (id) => {
        return await PaymentOrder.destroy({ where: { id: id } });
    };
}

export default new PaymentOrderRepository();

