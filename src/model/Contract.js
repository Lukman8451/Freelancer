import { sequelize, SequelizeModel, DataTypes } from "../config/database.js";

const Contract = sequelize.define("Contracts", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    projectId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    clientId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    freelancerId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("pending", "active", "completed", "disputed"),
        defaultValue: "pending",
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn("now"),
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn("now"),
        allowNull: false
    }
});

Contract.associate = function () {
    const models = sequelize.models;
    Contract.belongsTo(models.Projects, {
        foreignKey: "projectId",
        as: "project",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        allowNull: false
    });
    Contract.hasMany(models.Milestones, {
        foreignKey: "contractId",
        as: "milestones",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false
    });
};

export { Contract };
