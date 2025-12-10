// src/config/database.js
import { Sequelize, DataTypes as _DataTypes, Model as _Model } from "sequelize";
import { env } from "../config/config.js";

/**
 * Build Sequelize instance using environment or config fallback.
 */
export const DataTypes = _DataTypes;
export const SequelizeModel = _Model;
export const SequelizeClass = Sequelize;

export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: env.DB_DIALECT,
    logging: false, // Set to console.log to see SQL queries
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        // avoid creating plural forms automatically if you want to control table names
        // freezeTableName: false
    }
});

/**
 * Optional helper to test the connection
 */
export async function connect() {
    try {
        await sequelize.authenticate();
        console.log("Sequelize connection OK");
    } catch (err) {
        console.error("Sequelize connection error:", err);
        throw err;
    }
}
