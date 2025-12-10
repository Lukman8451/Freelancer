import { Op, where, cast, col, fn } from "sequelize";
import { Project, User, Proposal, Contract } from "../../model/index.js";

class ProjectRepository {
    create = async (projectData) => {
        return await Project.create(projectData);
    };

    findById = async (id) => {
        return await Project.findByPk(id, {
            include: [
                { association: 'client', attributes: ['id', 'name', 'email'] },
                { association: 'proposals' },
                { association: 'contract' }
            ]
        });
    };

    findAll = async (offset, limit, keyword = "", orderBy = "createdAt", sortBy = "DESC", filters) => {
        let whereConditions = {};

        if (keyword && keyword.trim() !== '') {
            whereConditions = {
                ...whereConditions,
                [Op.or]: [
                    where(cast(col("Project.title"), "TEXT"), { [Op.iLike]: `%${keyword}%` }),
                    where(cast(col("description"), "TEXT"), { [Op.iLike]: `%${keyword}%` })
                ]
            };
        }

        if (filters && Array.isArray(filters)) {
            for (const filter of filters) {
                const { column, operator, value } = filter;
                if (!column || value === undefined) continue;

                const stringValue = String(value);
                let filterCondition;

                switch (operator || 'contains') {
                    case 'contains':
                        filterCondition = where(cast(col(column), 'TEXT'), { [Op.iLike]: `%${stringValue}%` });
                        break;
                    case 'equals':
                        filterCondition = { [Op.eq]: stringValue };
                        break;
                    default:
                        filterCondition = where(cast(col(column), 'TEXT'), { [Op.iLike]: `%${stringValue}%` });
                }

                if (filterCondition) {
                    whereConditions[column] = filterCondition;
                }
            }
        }

        const textColumns = ['title'];
        let orderClause = textColumns.includes(orderBy)
            ? [[fn('LOWER', col(orderBy)), sortBy]]
            : [[orderBy, sortBy]];

        return await Project.findAndCountAll({
            where: whereConditions,
            limit,
            offset,
            include: [
                { association: 'client', attributes: ['id', 'name', 'email'] }
            ],
            order: orderClause,
            distinct: true
        });
    };

    findByClientId = async (clientId) => {
        return await Project.findAll({
            where: { clientId: clientId },
            include: [
                { association: 'proposals' }
            ],
            order: [['createdAt', 'DESC']]
        });
    };

    findByStatus = async (status) => {
        return await Project.findAll({
            where: { status: status },
            include: [
                { association: 'client', attributes: ['id', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    };

    update = async (id, updateData) => {
        return await Project.update(updateData, { where: { id: id } });
    };

    updateStatus = async (id, status) => {
        return await Project.update({ status: status }, { where: { id: id } });
    };

    delete = async (id) => {
        return await Project.destroy({ where: { id: id } });
    };

    getAllProjectsForDropDown = async () => {
        return await Project.findAll({
            attributes: ["id", "title", "status"],
            where: { status: ['open', 'in_progress'] },
            order: [['title', 'ASC']]
        });
    };
}

export default new ProjectRepository();

