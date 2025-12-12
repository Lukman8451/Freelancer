import { sequelize, SequelizeModel, DataTypes } from "../config/database.js";

const WithdrawalRequest = sequelize.define("WithdrawalRequests", {
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
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: "User ID (freelancer requesting withdrawal)"
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: "Withdrawal amount in USD"
    },
    // Bank account details for withdrawal
    bankAccountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Bank account number for withdrawal"
    },
    bankIfscCode: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Bank IFSC code"
    },
    bankAccountHolderName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Bank account holder name"
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
        allowNull: false,
        comment: "Withdrawal status: pending, processing, completed, rejected, failed",
        validate: {
            isIn: {
                args: [['pending', 'processing', 'completed', 'rejected', 'failed']],
                msg: "Withdrawal status must be one of: pending, processing, completed, rejected, failed"
            }
        }
    },
    processedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Date when withdrawal was processed"
    },
    processedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "Admin user ID who processed the withdrawal"
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Reason for rejection (if status is rejected)"
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "External transaction ID (e.g., Razorpay payout ID, bank transfer reference)"
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Additional notes"
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

WithdrawalRequest.associate = function () {
    const models = sequelize.models;
    WithdrawalRequest.belongsTo(models.Wallets, {
        foreignKey: "walletId",
        as: "wallet",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false
    });
    WithdrawalRequest.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false
    });
};

export { WithdrawalRequest };

