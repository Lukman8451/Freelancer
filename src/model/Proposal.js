import { sequelize, SequelizeModel, DataTypes } from "../config/database.js";

const Proposal = sequelize.define("Proposals", {
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
    freelancerId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    coverLetter: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    bidAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    durationInDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected"),
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

Proposal.associate = function () {
    const models = sequelize.models;
    Proposal.belongsTo(models.Projects, {
        foreignKey: "projectId",
        as: "project",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false
    });
    Proposal.belongsTo(models.Users, {
        foreignKey: "freelancerId",
        as: "freelancer",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        allowNull: false
    });
};

export { Proposal };
