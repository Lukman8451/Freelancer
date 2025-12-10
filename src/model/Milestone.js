import { sequelize, SequelizeModel, DataTypes } from "../config/database.js";

const Milestone = sequelize.define("Milestones", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    contractId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.FLOAT, allowNull: false,
    },
    dueDate: {
        type: DataTypes.DATE, allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("pending", "funded", "released"),
        defaultValue: "pending",
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE, defaultValue: sequelize.fn("now"),
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE, defaultValue: sequelize.fn("now"),
        allowNull: false
    },
});

Milestone.associate = function () {
    const models = sequelize.models;
    Milestone.belongsTo(models.Contracts, {
        foreignKey: "contractId",
        as: "contract",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false
    });
    Milestone.hasOne(models.PaymentOrders, {
        foreignKey: "milestoneId",
        as: "paymentOrder",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        allowNull: false
    });
};

export { Milestone };
