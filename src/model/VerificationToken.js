import { sequelize, DataTypes } from "../config/database.js";

const VerificationToken = sequelize.define("VerificationTokens", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    token: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
    },
    type: {
        type: DataTypes.ENUM("email_verification", "password_reset"),
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
});

VerificationToken.associate = function () {
    const models = sequelize.models;
    VerificationToken.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE"
    });
};

export { VerificationToken };
