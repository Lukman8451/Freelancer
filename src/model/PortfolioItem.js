import { sequelize, SequelizeModel, DataTypes } from "../config/database.js";

const PortfolioItem = sequelize.define("PortfolioItems", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    profileId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    link: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    imageUrl: {
        type: DataTypes.STRING,
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
    },
});

PortfolioItem.associate = function () {
    const models = sequelize.models;
    PortfolioItem.belongsTo(models.Profiles, {
        foreignKey: "profileId",
        as: "profile",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false
    });
};

export { PortfolioItem };
