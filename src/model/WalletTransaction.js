import { sequelize, SequelizeModel, DataTypes } from "../config/database.js";

const WalletTransaction = sequelize.define("WalletTransactions", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    walletId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: "Wallet ID"
    },
    milestoneId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "Milestone ID (if transaction is from milestone payment)"
    },
    paymentOrderId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "Payment Order ID (if transaction is from payment)"
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Transaction type: credit, debit, withdrawal",
        validate: {
            isIn: {
                args: [['credit', 'debit', 'withdrawal', 'refund']],
                msg: "Transaction type must be one of: credit, debit, withdrawal, refund"
            }
        }
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: "Transaction amount in USD"
    },
    balanceBefore: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: "Wallet balance before transaction"
    },
    balanceAfter: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: "Wallet balance after transaction"
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Transaction description"
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "completed",
        allowNull: false,
        comment: "Transaction status: pending, completed, failed",
        validate: {
            isIn: {
                args: [['pending', 'completed', 'failed']],
                msg: "Transaction status must be one of: pending, completed, failed"
            }
        }
    },
    // Withdrawal tracking (if type is withdrawal)
    withdrawalRequestId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "Withdrawal request ID (if this is a withdrawal transaction)"
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

WalletTransaction.associate = function () {
    const models = sequelize.models;
    WalletTransaction.belongsTo(models.Wallets, {
        foreignKey: "walletId",
        as: "wallet",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false
    });
    WalletTransaction.belongsTo(models.Milestones, {
        foreignKey: "milestoneId",
        as: "milestone",
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    });
    WalletTransaction.belongsTo(models.PaymentOrders, {
        foreignKey: "paymentOrderId",
        as: "paymentOrder",
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    });
};

export { WalletTransaction };

