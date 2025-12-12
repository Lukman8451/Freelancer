import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  DB_DIALECT: process.env.DB_DIALECT || "postgres",
  DB_HOST: process.env.DB_HOST || "127.0.0.1",
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || process.env.MySQL_DATABASE_NAME || "freelancer_website",
  DB_USER: process.env.DB_USER || process.env.MySQL_USERNAME || "postgres",
  DB_PASS: process.env.DB_PASS || process.env.MySQL_PASSWORD || "root",
  JWT_SECRET: process.env.JWT_SECRET || process.env.jwt_secret || "lukman",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
  // Razorpay X Configuration (for payouts to freelancers)
  RAZORPAY_X_KEY_ID: process.env.RAZORPAY_X_KEY_ID || "",
  RAZORPAY_X_KEY_SECRET: process.env.RAZORPAY_X_KEY_SECRET || "",
  RAZORPAY_X_ACCOUNT_NUMBER: process.env.RAZORPAY_X_ACCOUNT_NUMBER || "",
  SERVER_URL: process.env.SERVER_URL || process.env.server || "http://localhost:5000"
};

