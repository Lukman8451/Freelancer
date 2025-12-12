import { Op, where, cast, col, fn } from "sequelize";
import { Contract, Project, User, Milestone } from "../../model/index.js";

class ContractRepository {
    create = async (contractData) => {
        return await Contract.create(contractData);
    };

    findById = async (id) => {
        return await Contract.findByPk(id, {
            include: [
                { association: 'project', attributes: ['id', 'title', 'description', 'status'] },
                { association: 'client', attributes: ['id', 'name', 'email'] },
                { association: 'freelancer', attributes: ['id', 'name', 'email'] },
                { association: 'milestones' }
            ]
        });
    };

    findAll = async (offset, limit, keyword = "", orderBy = "createdAt", sortBy = "DESC", filters) => {
        let whereConditions = {};

        if (filters && Array.isArray(filters)) {
            for (const filter of filters) {
                const { column, operator, value } = filter;
                if (!column || value === undefined) continue;

                whereConditions[column] = (operator === 'equals')
                    ? { [Op.eq]: String(value) }
                    : where(cast(col(column), 'TEXT'), { [Op.iLike]: `%${value}%` });
            }
        }

        return await Contract.findAndCountAll({
            where: whereConditions,
            limit,
            offset,
            include: [
                { association: 'project', attributes: ['id', 'title'] }
            ],
            order: [[orderBy, sortBy]],
            distinct: true
        });
    };

    findByProjectId = async (projectId) => {
        return await Contract.findOne({
            where: { projectId: projectId },
            include: [
                { association: 'project' },
                { association: 'milestones' }
            ]
        });
    };

    findByClientId = async (clientId) => {
        return await Contract.findAll({
            where: { clientId: clientId },
            include: [
                { 
                    association: 'project', 
                    attributes: ['id', 'title', 'description', 'status'] 
                },
                {
                    association: 'freelancer',
                    attributes: ['id', 'name', 'email']
                },
                { association: 'milestones' }
            ],
            order: [['createdAt', 'DESC']]
        });
    };

    findByFreelancerId = async (freelancerId) => {
        return await Contract.findAll({
            where: { freelancerId: freelancerId },
            include: [
                { 
                    association: 'project', 
                    attributes: ['id', 'title', 'description', 'status'] 
                },
                {
                    association: 'client',
                    attributes: ['id', 'name', 'email']
                },
                { association: 'milestones' }
            ],
            order: [['createdAt', 'DESC']]
        });
    };

    findByStatus = async (status) => {
        return await Contract.findAll({
            where: { status: status },
            include: [
                { association: 'project' }
            ],
            order: [['createdAt', 'DESC']]
        });
    };

    update = async (id, updateData) => {
        return await Contract.update(updateData, { where: { id: id } });
    };

    updateStatus = async (id, status) => {
        return await Contract.update({ status: status }, { where: { id: id } });
    };

    delete = async (id) => {
        return await Contract.destroy({ where: { id: id } });
    };
}

export default new ContractRepository();

