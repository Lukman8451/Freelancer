import { sequelize, SequelizeModel, DataTypes } from "../config/database.js";

const Profile = sequelize.define("Profiles", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
    },
    displayName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    hourlyRate: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "USD",
    },
    experienceLevel: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    profilePhoto: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    // Payment/Payout Account Details
    razorpayContactId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Razorpay contact ID for payouts"
    },
    bankAccountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Bank account number for payouts"
    },
    bankIfscCode: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Bank IFSC code for payouts"
    },
    bankAccountHolderName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Bank account holder name"
    },
    bankAccountType: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Bank account type (savings or current)",
        validate: {
            isIn: {
                args: [['savings', 'current']],
                msg: "Bank account type must be either 'savings' or 'current'"
            }
        }
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

Profile.associate = function () {
    const models = sequelize.models;
    Profile.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false
    });
    Profile.belongsToMany(models.Skills, {
        through: models.ProfileSkills,
        foreignKey: "profileId",
        otherKey: "skillId",
        as: "skills",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false
    });
    Profile.hasMany(models.PortfolioItems, {
        foreignKey: "profileId",
        as: "portfolio",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false
    });
};

export { Profile };
