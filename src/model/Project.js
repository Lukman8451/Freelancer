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
    assignedFreelancerId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    progressPercentage: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
            min: 0,
            max: 100
        }
    },
    progressNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    lastProgressUpdate: {
        type: DataTypes.DATE,
        allowNull: true,
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
    Project.belongsTo(models.Users, {
        foreignKey: "assignedFreelancerId",
        as: "assignedFreelancer",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        allowNull: true
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
