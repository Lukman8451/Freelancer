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
    // Payout/Transfer tracking
    razorpayPayoutId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Razorpay payout ID for transfer to freelancer"
    },
    payoutStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Status of payout to freelancer (pending, processing, processed, failed)",
        validate: {
            isIn: {
                args: [['pending', 'processing', 'processed', 'failed']],
                msg: "Payout status must be one of: pending, processing, processed, failed"
            }
        }
    },
    payoutAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: "Amount transferred to freelancer (after platform fee)"
    },
    platformFee: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: "Platform fee amount (1% of milestone amount)"
    },
    platformFeePercentage: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 1.0,
        comment: "Platform fee percentage (default 1%)"
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
