import { sequelize, SequelizeModel, DataTypes } from "../config/database.js";

const User = sequelize.define("Users", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM("client", "freelancer", "admin"),
        defaultValue: "freelancer"
    },
    status: {
        type: DataTypes.ENUM("active", "blocked"),
        defaultValue: "active"
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

User.associate = function () {
    const models = sequelize.models;
    User.hasOne(models.Profiles, {
        foreignKey: "userId",
        as: "profile",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false
    });
    User.hasMany(models.Projects, {
        foreignKey: "clientId",
        as: "projects",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        allowNull: false
    });
    User.hasMany(models.Proposals, {
        foreignKey: "freelancerId",
        as: "proposals",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        allowNull: false
    });
    User.hasMany(models.Contracts, {
        foreignKey: "clientId",
        as: "clientContracts",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        allowNull: false
    });
    User.hasMany(models.Contracts, {
        foreignKey: "freelancerId",
        as: "freelancerContracts",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        allowNull: false
    });
    User.hasMany(models.PaymentOrders, {
        foreignKey: "userId",
        as: "paymentOrders",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        allowNull: false
    });
};

export { User };
