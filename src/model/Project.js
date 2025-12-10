import { sequelize, SequelizeModel, DataTypes } from "../config/database.js";

const Project = sequelize.define("Projects", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    clientId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    budgetMin: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    budgetMax: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("open", "in_progress", "completed", "cancelled"),
        defaultValue: "open",
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

Project.associate = function () {
    const models = sequelize.models;
    Project.belongsTo(models.Users, {
        foreignKey: "clientId",
        as: "client",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        allowNull: false
    });
    Project.hasMany(models.Proposals, {
        foreignKey: "projectId",
        as: "proposals",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false
    });
    Project.hasOne(models.Contracts, {
        foreignKey: "projectId",
        as: "contract",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        allowNull: false
    });
};

export { Project };
