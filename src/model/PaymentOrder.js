import { sequelize, SequelizeModel, DataTypes } from "../config/database.js";

const PaymentOrder = sequelize.define("PaymentOrders", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    milestoneId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    razorpayOrderId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: "INR",
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("created", "paid", "failed"),
        defaultValue: "created",
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

PaymentOrder.associate = function () {
    const models = sequelize.models;
    PaymentOrder.belongsTo(models.Milestones, {
        foreignKey: "milestoneId",
        as: "milestone",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        allowNull: false
    });
    PaymentOrder.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        allowNull: false
    });
};

export { PaymentOrder };
