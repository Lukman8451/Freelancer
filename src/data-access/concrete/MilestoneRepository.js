import { Op, where, cast, col, fn } from "sequelize";
import { Milestone, Contract, PaymentOrder } from "../../model/index.js";

class MilestoneRepository {
    create = async (milestoneData) => {
        return await Milestone.create(milestoneData);
    };

    findById = async (id) => {
        return await Milestone.findByPk(id, {
            include: [
                { association: 'contract' },
                { association: 'paymentOrder' }
            ]
        });
    };

    findAll = async (offset, limit, keyword = "", orderBy = "createdAt", sortBy = "DESC", filters) => {
        let whereConditions = {};

        if (keyword && keyword.trim() !== '') {
            whereConditions = {
                [Op.or]: [
                    where(cast(col("Milestone.title"), "TEXT"), { [Op.iLike]: `%${keyword}%` })
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

        return await Milestone.findAndCountAll({
            where: whereConditions,
            limit,
            offset,
            include: [
                { association: 'contract' }
            ],
            order: [[orderBy, sortBy]],
            distinct: true
        });
    };

    findByContractId = async (contractId) => {
        return await Milestone.findAll({
            where: { contractId: contractId },
            include: [
                { association: 'paymentOrder' }
            ],
            order: [['createdAt', 'ASC']]
        });
    };

    findByStatus = async (status) => {
        return await Milestone.findAll({
            where: { status: status },
            include: [
                { association: 'contract' }
            ],
            order: [['dueDate', 'ASC']]
        });
    };

    update = async (id, updateData) => {
        return await Milestone.update(updateData, { where: { id: id } });
    };

    updateStatus = async (id, status) => {
        return await Milestone.update({ status: status }, { where: { id: id } });
    };

    delete = async (id) => {
        return await Milestone.destroy({ where: { id: id } });
    };
}

export default new MilestoneRepository();

