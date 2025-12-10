import { Op, where, cast, col, fn } from "sequelize";
import { Proposal, User, Project } from "../../model/index.js";

class ProposalRepository {
    create = async (proposalData) => {
        return await Proposal.create(proposalData);
    };

    findById = async (id) => {
        return await Proposal.findByPk(id, {
            include: [
                { association: 'project', attributes: ['id', 'title', 'status'] },
                { association: 'freelancer', attributes: ['id', 'name', 'email'] }
            ]
        });
    };

    findAll = async (offset, limit, keyword = "", orderBy = "createdAt", sortBy = "DESC", filters) => {
        let whereConditions = {};

        if (keyword && keyword.trim() !== '') {
            whereConditions = {
                ...whereConditions,
                [Op.or]: [
                    where(cast(col("Proposal.coverLetter"), "TEXT"), { [Op.iLike]: `%${keyword}%` })
                ]
            };
        }

        if (filters && Array.isArray(filters)) {
            for (const filter of filters) {
                const { column, operator, value } = filter;
                if (!column || value === undefined) continue;

                const stringValue = String(value);
                let filterCondition = (operator === 'equals')
                    ? { [Op.eq]: stringValue }
                    : where(cast(col(column), 'TEXT'), { [Op.iLike]: `%${stringValue}%` });

                if (filterCondition) {
                    whereConditions[column] = filterCondition;
                }
            }
        }

        return await Proposal.findAndCountAll({
            where: whereConditions,
            limit,
            offset,
            include: [
                { association: 'project', attributes: ['id', 'title'] },
                { association: 'freelancer', attributes: ['id', 'name', 'email'] }
            ],
            order: [[orderBy, sortBy]],
            distinct: true
        });
    };

    findByProjectId = async (projectId) => {
        return await Proposal.findAll({
            where: { projectId: projectId },
            include: [
                { association: 'freelancer', attributes: ['id', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    };

    findByFreelancerId = async (freelancerId) => {
        return await Proposal.findAll({
            where: { freelancerId: freelancerId },
            include: [
                { association: 'project', attributes: ['id', 'title', 'status'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    };

    findByStatus = async (status) => {
        return await Proposal.findAll({
            where: { status: status },
            include: [
                { association: 'project', attributes: ['id', 'title'] },
                { association: 'freelancer', attributes: ['id', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    };

    update = async (id, updateData) => {
        return await Proposal.update(updateData, { where: { id: id } });
    };

    updateStatus = async (id, status) => {
        return await Proposal.update({ status: status }, { where: { id: id } });
    };

    delete = async (id) => {
        return await Proposal.destroy({ where: { id: id } });
    };
}

export default new ProposalRepository();

