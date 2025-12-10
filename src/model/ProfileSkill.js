import { sequelize, SequelizeModel, DataTypes } from "../config/database.js";

const ProfileSkill = sequelize.define("ProfileSkills", {
    profileId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    skillId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    timestamps: false,
    onDelete: "CASCADE",
    allowNull: false
});

export { ProfileSkill };
