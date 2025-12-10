import { Op, where, cast, col, fn } from "sequelize";
import { PortfolioItem, Profile } from "../../model/index.js";

class PortfolioItemRepository {
    create = async (portfolioData) => {
        return await PortfolioItem.create(portfolioData);
    };

    findById = async (id) => {
        return await PortfolioItem.findByPk(id, {
            include: [
                { association: 'profile', attributes: ['id', 'displayName', 'userId'] }
            ]
        });
    };

    findAll = async (offset, limit, keyword = "", orderBy = "createdAt", sortBy = "DESC", filters) => {
        let whereConditions = {};

        if (keyword && keyword.trim() !== '') {
            whereConditions = {
                [Op.or]: [
                    where(cast(col("PortfolioItem.title"), "TEXT"), { [Op.iLike]: `%${keyword}%` }),
                    where(cast(col("description"), "TEXT"), { [Op.iLike]: `%${keyword}%` })
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

        const textColumns = ['title'];
        let orderClause = textColumns.includes(orderBy)
            ? [[fn('LOWER', col(orderBy)), sortBy]]
            : [[orderBy, sortBy]];

        return await PortfolioItem.findAndCountAll({
            where: whereConditions,
            limit,
            offset,
            include: [
                { association: 'profile', attributes: ['id', 'displayName'] }
            ],
            order: orderClause,
            distinct: true
        });
    };

    findByProfileId = async (profileId) => {
        return await PortfolioItem.findAll({
            where: { profileId: profileId },
            order: [['createdAt', 'DESC']]
        });
    };

    update = async (id, updateData) => {
        return await PortfolioItem.update(updateData, { where: { id: id } });
    };

    delete = async (id) => {
        return await PortfolioItem.destroy({ where: { id: id } });
    };

    bulkCreate = async (portfolioDataArray) => {
        return await PortfolioItem.bulkCreate(portfolioDataArray);
    };
}

export default new PortfolioItemRepository();

