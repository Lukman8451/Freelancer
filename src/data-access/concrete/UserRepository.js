import { Op, where, literal, cast, col, fn } from "sequelize";
import { User, Profile } from "../../model/index.js";

class UserRepository {
    create = async (userData) => {
        return await User.create(userData);
    };

    findById = async (id) => {
        return await User.findByPk(id, {
            include: [
                {
                    association: 'profile',
                    include: ['skills', 'portfolio']
                }
            ],
            attributes: { exclude: ['passwordHash'] }
        });
    };

    findByEmail = async (email) => {
        return await User.findOne({
            where: {
                email: { [Op.iLike]: email }
            }
        });
    };

    getUserByEmail = async (email) => {
        return await User.findOne({
            where: {
                email: { [Op.iLike]: email }
            },
            attributes: { exclude: [] }
        });
    };

    findAll = async (
        offset,
        limit,
        keyword = "",
        orderBy = "createdAt",
        sortBy = "DESC",
        filters
    ) => {
        let whereConditions = {};

        // Keyword search
        if (keyword && keyword.trim() !== '') {
            whereConditions = {
                ...whereConditions,
                [Op.or]: [
                    where(cast(col("User.name"), "TEXT"), { [Op.iLike]: `%${keyword}%` }),
                    where(cast(col("email"), "TEXT"), { [Op.iLike]: `%${keyword}%` })
                ]
            };
        }

        // Process filters
        if (filters && Array.isArray(filters) && filters.length > 0) {
            for (const filter of filters) {
                const { column, operator, value } = filter;
                if (!column || value === undefined) continue;

                const filterOperator = operator || 'contains';
                const stringValue = value !== null && value !== undefined ? String(value) : '';

                let filterCondition;

                switch (filterOperator) {
                    case 'contains':
                        filterCondition = where(cast(col(column), 'TEXT'), {
                            [Op.iLike]: `%${stringValue}%`
                        });
                        break;
                    case 'equals':
                        filterCondition = { [Op.eq]: stringValue };
                        break;
                    case 'starts with':
                        filterCondition = where(cast(col(column), 'TEXT'), {
                            [Op.iLike]: `${stringValue}%`
                        });
                        break;
                    case 'ends with':
                        filterCondition = where(cast(col(column), 'TEXT'), {
                            [Op.iLike]: `%${stringValue}`
                        });
                        break;
                    case 'is empty':
                        filterCondition = { [Op.or]: [{ [Op.eq]: '' }, { [Op.is]: null }] };
                        break;
                    case 'is not empty':
                        filterCondition = { [Op.and]: [{ [Op.ne]: '' }, { [Op.not]: null }] };
                        break;
                    case 'is any of':
                        const values = Array.isArray(value)
                            ? value
                            : stringValue.split(',').map(v => v.trim()).filter(v => v !== '');
                        if (values.length > 0) {
                            filterCondition = { [Op.in]: values };
                        }
                        break;
                    default:
                        filterCondition = where(cast(col(column), 'TEXT'), {
                            [Op.iLike]: `%${stringValue}%`
                        });
                }

                if (filterCondition) {
                    whereConditions[column] = filterCondition;
                }
            }
        }

        // Order clause
        const textColumns = ['name', 'email'];
        let orderClause;

        if (textColumns.includes(orderBy)) {
            orderClause = [[fn('LOWER', col(orderBy)), sortBy]];
        } else {
            orderClause = [[orderBy, sortBy]];
        }

        return await User.findAndCountAll({
            where: whereConditions,
            limit,
            offset,
            include: [
                {
                    association: 'profile',
                    attributes: ['displayName', 'bio', 'hourlyRate', 'location'],
                    required: false
                }
            ],
            attributes: { exclude: ['passwordHash'] },
            order: orderClause,
            distinct: true
        });
    };

    update = async (id, updateData) => {
        return await User.update(updateData, {
            where: { id: id }
        });
    };

    updateUser = async (id, updateData) => {
        const user = await User.findByPk(id);
        if (!user) return null;

        return await user.update(updateData);
    };

    delete = async (id) => {
        return await User.destroy({
            where: { id: id }
        });
    };

    updateStatus = async (id, status) => {
        return await User.update(
            { status: status },
            { where: { id: id } }
        );
    };

    countByRole = async (role) => {
        return await User.count({
            where: { role: role }
        });
    };

    searchUsers = async (searchTerm, role = null) => {
        let whereConditions = {
            [Op.or]: [
                where(cast(col("User.name"), "TEXT"), { [Op.iLike]: `%${searchTerm}%` }),
                where(cast(col("email"), "TEXT"), { [Op.iLike]: `%${searchTerm}%` })
            ]
        };

        if (role) {
            whereConditions.role = role;
        }

        return await User.findAll({
            where: whereConditions,
            include: [
                {
                    association: 'profile',
                    attributes: ['displayName', 'bio', 'location'],
                    required: false
                }
            ],
            attributes: { exclude: ['passwordHash'] },
            limit: 20,
            order: [['name', 'ASC']]
        });
    };

    getAllUsersForDropDown = async () => {
        return await User.findAll({
            attributes: ["id", "name", "email", "role"],
            where: {
                status: "active"
            },
            order: [['name', 'ASC']]
        });
    };

    getUsersByRole = async (role) => {
        return await User.findAll({
            where: {
                role: role,
                status: "active"
            },
            attributes: { exclude: ['passwordHash'] }
        });
    };

    searchUsersByKeyword = async (keyword) => {
        return await User.findAll({
            where: {
                [Op.or]: [
                    where(cast(col("name"), "TEXT"), { [Op.iLike]: `%${keyword}%` }),
                    where(cast(col("email"), "TEXT"), { [Op.iLike]: `%${keyword}%` })
                ]
            },
            include: [
                {
                    association: 'profile',
                    attributes: ['displayName', 'bio', 'hourlyRate', 'location'],
                    required: false
                }
            ],
            attributes: { exclude: ['passwordHash'] },
            order: [['name', 'ASC']]
        });
    };

    getUserByIdForAuth = async (id) => {
        return await User.findOne({
            where: { id: id },
            attributes: ["id", "name", "email", "role", "status"]
        });
    };

    checkIsActive = async (id) => {
        return await User.findOne({
            where: {
                id: id,
                status: "active"
            }
        });
    };

    getAllUsersForExport = async (exportScope, keyword, filters, selectedIds, limit, offset, orderBy = 'createdAt', sortBy = 'DESC') => {
        const whereConditions = {};
        const andConditions = [];

        // Filters (AND)
        if (filters && Array.isArray(filters)) {
            for (const { column, value } of filters) {
                if (!value?.trim()) continue;
                const val = `%${value}%`;

                if (column === 'role' || column === 'status') {
                    andConditions.push(
                        where(col(column), { [Op.eq]: value })
                    );
                } else {
                    andConditions.push(
                        where(cast(col(column), 'TEXT'), { [Op.iLike]: val })
                    );
                }
            }
        }

        if (andConditions.length > 0) {
            whereConditions[Op.and] = andConditions;
        }

        // Selected scope filter
        if (exportScope === 'selected' && selectedIds?.length) {
            whereConditions.id = { [Op.in]: selectedIds };
        }

        // Keyword search (OR)
        if (keyword?.trim() && exportScope !== 'selected') {
            const kw = `%${keyword}%`;
            const keywordConditions = [
                where(cast(col('name'), 'TEXT'), { [Op.iLike]: kw }),
                where(cast(col('email'), 'TEXT'), { [Op.iLike]: kw })
            ];

            whereConditions[Op.and] = [...(whereConditions[Op.and] || []), { [Op.or]: keywordConditions }];
        }

        // Pagination
        const pagination =
            exportScope === 'visible' && typeof limit === 'number' && typeof offset === 'number'
                ? { limit, offset }
                : {};

        // Sort
        const validSortFields = ['name', 'email', 'role', 'status', 'createdAt'];
        const safeOrderBy = validSortFields.includes(orderBy) ? orderBy : 'createdAt';
        const orderClause = [[safeOrderBy, sortBy]];

        return await User.findAll({
            where: whereConditions,
            raw: true,
            nest: true,
            attributes: ['id', 'name', 'email', 'role', 'status', 'createdAt'],
            order: orderClause,
            ...pagination
        });
    };
}

export default new UserRepository();

