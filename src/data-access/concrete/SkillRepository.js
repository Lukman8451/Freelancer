import { Op, where, cast, col, fn } from "sequelize";
import { Skill, Profile } from "../../model/index.js";

class SkillRepository {
    create = async (skillData) => {
        return await Skill.create(skillData);
    };

    findById = async (id) => {
        return await Skill.findByPk(id, {
            include: [
                { association: 'profiles' }
            ]
        });
    };

    findByName = async (name) => {
        return await Skill.findOne({
            where: where(fn('LOWER', col('name')), fn('LOWER', name))
        });
    };

    findAll = async (offset, limit, keyword = "", orderBy = "name", sortBy = "ASC", filters) => {
        let whereConditions = {};

        if (keyword && keyword.trim() !== '') {
            whereConditions = {
                [Op.or]: [
                    where(cast(col("Skill.name"), "TEXT"), { [Op.iLike]: `%${keyword}%` })
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

        const textColumns = ['name'];
        let orderClause = textColumns.includes(orderBy)
            ? [[fn('LOWER', col(orderBy)), sortBy]]
            : [[orderBy, sortBy]];

        return await Skill.findAndCountAll({
            where: whereConditions,
            limit,
            offset,
            order: orderClause,
            distinct: true
        });
    };

    update = async (id, updateData) => {
        return await Skill.update(updateData, { where: { id: id } });
    };

    delete = async (id) => {
        return await Skill.destroy({ where: { id: id } });
    };

    getAllSkillsForDropDown = async () => {
        return await Skill.findAll({
            attributes: ["id", "name"],
            order: [[fn('LOWER', col('name')), 'ASC']]
        });
    };
}

export default new SkillRepository();

