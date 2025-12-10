import { sequelize, SequelizeModel, DataTypes } from "../config/database.js";

const Skill = sequelize.define("Skills", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    createdAt: {
        type: DataTypes.DATE, defaultValue: sequelize.fn("now"),
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE, defaultValue: sequelize.fn("now"),
        allowNull: false
    }
});

Skill.associate = function () {
    const models = sequelize.models;
    Skill.belongsToMany(models.Profiles, {
        through: models.ProfileSkills,
        foreignKey: "skillId",
        otherKey: "profileId",
        as: "profiles",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false
    });
};

export { Skill };
