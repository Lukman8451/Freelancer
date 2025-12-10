import { Op, where, cast, col, fn } from "sequelize";
import { Profile, User, Skill, PortfolioItem } from "../../model/index.js";

class ProfileRepository {
    create = async (profileData) => {
        return await Profile.create(profileData);
    };

    findById = async (id) => {
        return await Profile.findByPk(id, {
            include: [
                { association: 'user', attributes: ['id', 'name', 'email', 'role'] },
                { association: 'skills' },
                { association: 'portfolio' }
            ]
        });
    };

    findByUserId = async (userId) => {
        return await Profile.findOne({
            where: { userId: userId },
            include: [
                { association: 'user', attributes: ['id', 'name', 'email', 'role'] },
                { association: 'skills' },
                { association: 'portfolio' }
            ]
        });
    };

    findAll = async (offset, limit, keyword = "", orderBy = "createdAt", sortBy = "DESC", filters) => {
        let whereConditions = {};

        if (keyword && keyword.trim() !== '') {
            whereConditions = {
                ...whereConditions,
                [Op.or]: [
                    where(cast(col("Profile.displayName"), "TEXT"), { [Op.iLike]: `%${keyword}%` }),
                    where(cast(col("bio"), "TEXT"), { [Op.iLike]: `%${keyword}%` }),
                    where(cast(col("location"), "TEXT"), { [Op.iLike]: `%${keyword}%` })
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

        const textColumns = ['displayName', 'location'];
        let orderClause = textColumns.includes(orderBy)
            ? [[fn('LOWER', col(orderBy)), sortBy]]
            : [[orderBy, sortBy]];

        return await Profile.findAndCountAll({
            where: whereConditions,
            limit,
            offset,
            include: [
                { association: 'user', attributes: ['id', 'name', 'email'] },
                { association: 'skills' }
            ],
            order: orderClause,
            distinct: true
        });
    };

    update = async (id, updateData) => {
        return await Profile.update(updateData, { where: { id: id } });
    };

    delete = async (id) => {
        return await Profile.destroy({ where: { id: id } });
    };

    addSkill = async (profileId, skillId) => {
        const profile = await Profile.findByPk(profileId);
        if (!profile) return null;
        return await profile.addSkill(skillId);
    };

    removeSkill = async (profileId, skillId) => {
        const profile = await Profile.findByPk(profileId);
        if (!profile) return null;
        return await profile.removeSkill(skillId);
    };

    getAllProfilesForDropDown = async () => {
        return await Profile.findAll({
            attributes: ["id", "displayName", "userId"],
            include: [{ association: 'user', attributes: ['name', 'email'] }],
            order: [['displayName', 'ASC']]
        });
    };
}

export default new ProfileRepository();

