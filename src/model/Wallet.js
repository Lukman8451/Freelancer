import { sequelize, SequelizeModel, DataTypes } from "../config/database.js";

const Wallet = sequelize.define("Wallets", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        comment: "User ID (one wallet per user)"
    },
    balance: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
        allowNull: false,
        comment: "Current wallet balance in USD"
    },
    totalEarned: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
        allowNull: false,
        comment: "Total amount earned (cumulative)"
    },
    totalWithdrawn: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
        allowNull: false,
        comment: "Total amount withdrawn (cumulative)"
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

Wallet.associate = function () {
    const models = sequelize.models;
    Wallet.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false
    });
    Wallet.hasMany(models.WalletTransactions, {
        foreignKey: "walletId",
        as: "transactions",
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    });
};

export { Wallet };

