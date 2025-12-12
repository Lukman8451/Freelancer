import UserService from "../service/concrete/UserService.js";
import { sequelize } from "../model/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/config.js";
import { resetFailedLoginAttempts, incrementFailedLoginAttempts } from "../middlewares/rateLimiter.js";

class UserController {
    // Register a new user
    register = async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { name, email, password, role } = req.body;

            // Validation
            if (!name) {
                await transaction.rollback();
                return res.status(400).json({ error: "Name is required" });
            }

            if (!email) {
                await transaction.rollback();
                return res.status(400).json({ error: "Email is required" });
            }

            if (!password) {
                await transaction.rollback();
                return res.status(400).json({ error: "Password is required" });
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                await transaction.rollback();
                return res.status(400).json({ error: "Invalid email format" });
            }

            // Password strength validation
            if (password.length < 6) {
                await transaction.rollback();
                return res.status(400).json({
                    error: "Password must be at least 6 characters long"
                });
            }

            // Role validation
            const validRoles = ["client", "freelancer", "admin"];
            if (role && !validRoles.includes(role)) {
                await transaction.rollback();
                return res.status(400).json({
                    error: "Invalid role. Must be client, freelancer, or admin"
                });
            }

            // Check if user already exists
            const existingUser = await UserService.getUserByEmail(email);
            if (existingUser) {
                await transaction.rollback();
                return res.status(409).json({ error: "User with this email already exists" });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // Create user
            const user = await UserService.register({
                name,
                email,
                passwordHash,
                role: role || "freelancer",
                status: "active"
            });

            await transaction.commit();

            return res.status(201).json({
                message: "User registered successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status
                }
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Register error:", error);

            return res.status(500).json({
                error: "Failed to register user",
                details: error.message
            });
        }
    };

    // Login user
    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email) {
                return res.status(400).json({ error: "Email is required" });
            }

            if (!password) {
                return res.status(400).json({ error: "Password is required" });
            }

            // Find user
            const user = await UserService.login(email);
            if (!user) {
                // Increment failed login attempts
                incrementFailedLoginAttempts(req);
                return res.status(404).json({ error: "User not found. Please check your email address or sign up to create an account." });
            }

            // Check if user is active
            if (user.status !== "active") {
                // Increment failed login attempts
                incrementFailedLoginAttempts(req);
                return res.status(401).json({ error: "Account is blocked. Please contact support" });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.passwordHash);
            if (!isValidPassword) {
                // Increment failed login attempts
                incrementFailedLoginAttempts(req);
                return res.status(401).json({ error: "Password is incorrect. Please try again." });
            }

            // SUCCESSFUL LOGIN - Reset failed attempts counter
            resetFailedLoginAttempts(req);

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            return res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status
                }
            });
        } catch (error) {
            console.error("Login error:", error);

            return res.status(500).json({
                error: "Failed to login",
                details: error.message
            });
        }
    };

    // Get current user profile (authenticated)
    getProfile = async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await UserService.getUserById(userId);

            return res.status(200).json({ user });
        } catch (error) {
            console.error("Get profile error:", error);

            if (error.message === "User not found") {
                return res.status(404).json({ error: error.message });
            }

            return res.status(500).json({
                error: "Failed to fetch profile",
                details: error.message
            });
        }
    };

    // Get user by ID
    getUserById = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "User ID is required" });
            }

            const user = await UserService.getUserById(id);

            return res.status(200).json({ user });
        } catch (error) {
            console.error("Get user error:", error);

            if (error.message === "User not found") {
                return res.status(404).json({ error: error.message });
            }

            return res.status(500).json({
                error: "Failed to fetch user",
                details: error.message
            });
        }
    };

    // Get all users (with filters)
    getAllUsers = async (req, res) => {
        try {
            const {
                keyword = "",
                limit = 50,
                offset = 0,
                orderBy = "createdAt",
                sortBy = "DESC",
                filters
            } = req.query;

            // Parse filters if it's a JSON string
            let parsedFilters = [];
            if (filters) {
                try {
                    parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
                } catch (e) {
                    parsedFilters = [];
                }
            }

            const result = await UserService.getAllUsers(
                parseInt(offset),
                parseInt(limit),
                keyword,
                orderBy,
                sortBy,
                parsedFilters
            );

            return res.status(200).json({
                users: result.rows,
                total: result.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } catch (error) {
            console.error("Get all users error:", error);
            return res.status(500).json({
                error: "Failed to fetch users",
                details: error.message
            });
        }
    };

    // Update user
    updateUser = async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Check if user is updating their own profile or is admin
            if (req.user.id !== id && req.user.role !== "admin") {
                return res.status(403).json({
                    error: "Forbidden. You can only update your own profile"
                });
            }

            // Validate update data
            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    error: "No update data provided"
                });
            }

            // Don't allow direct password update through this method
            if (updateData.password || updateData.passwordHash) {
                return res.status(400).json({
                    error: "Use change-password endpoint to update password"
                });
            }

            // Prevent role change unless admin
            if (updateData.role && req.user.role !== "admin") {
                return res.status(403).json({
                    error: "Only admins can change user roles"
                });
            }

            // Prevent status change unless admin
            if (updateData.status && req.user.role !== "admin") {
                return res.status(403).json({
                    error: "Only admins can change user status"
                });
            }

            const result = await UserService.updateUser(id, updateData);
            if (!result || result[0] === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            // Get updated user
            const user = await UserService.getUserById(id);

            return res.status(200).json({
                message: "User updated successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status
                }
            });
        } catch (error) {
            console.error("Update user error:", error);

            return res.status(500).json({
                error: "Failed to update user",
                details: error.message
            });
        }
    };

    // Change password
    changePassword = async (req, res) => {
        try {
            const userId = req.user.id;
            const { oldPassword, newPassword, confirmPassword } = req.body;

            // Validation
            if (!oldPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    error: "All password fields are required"
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    error: "New password and confirm password do not match"
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    error: "New password must be at least 6 characters long"
                });
            }

            // Get user info
            const userInfo = await UserService.getUserById(userId);
            if (!userInfo) {
                return res.status(404).json({ error: "User not found" });
            }

            // Get user with password
            const user = await UserService.getUserByEmail(userInfo.email);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Verify old password
            const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
            if (!isValidPassword) {
                return res.status(401).json({ error: "Current password is incorrect" });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(newPassword, salt);

            await UserService.changePassword(userId, passwordHash);

            return res.status(200).json({ message: "Password changed successfully" });
        } catch (error) {
            console.error("Change password error:", error);

            return res.status(500).json({
                error: "Failed to change password",
                details: error.message
            });
        }
    };

    // Delete user (admin only)
    deleteUser = async (req, res) => {
        try {
            const { id } = req.params;

            // Only admins can delete users
            if (req.user.role !== "admin") {
                return res.status(403).json({
                    error: "Forbidden. Only admins can delete users"
                });
            }

            // Prevent self-deletion
            if (req.user.id === id) {
                return res.status(400).json({
                    error: "You cannot delete your own account"
                });
            }

            const result = await UserService.deleteUser(id);
            if (!result) {
                return res.status(404).json({ error: "User not found" });
            }

            return res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            console.error("Delete user error:", error);

            return res.status(500).json({
                error: "Failed to delete user",
                details: error.message
            });
        }
    };

    // Block user (admin only)
    blockUser = async (req, res) => {
        try {
            const { id } = req.params;

            // Only admins can block users
            if (req.user.role !== "admin") {
                return res.status(403).json({
                    error: "Forbidden. Only admins can block users"
                });
            }

            // Prevent self-blocking
            if (req.user.id === id) {
                return res.status(400).json({
                    error: "You cannot block your own account"
                });
            }

            const result = await UserService.blockUser(id);
            if (!result || result[0] === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            const user = await UserService.getUserById(id);

            return res.status(200).json({
                message: "User blocked successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    status: user.status
                }
            });
        } catch (error) {
            console.error("Block user error:", error);

            return res.status(500).json({
                error: "Failed to block user",
                details: error.message
            });
        }
    };

    // Unblock user (admin only)
    unblockUser = async (req, res) => {
        try {
            const { id } = req.params;

            // Only admins can unblock users
            if (req.user.role !== "admin") {
                return res.status(403).json({
                    error: "Forbidden. Only admins can unblock users"
                });
            }

            const result = await UserService.unblockUser(id);
            if (!result || result[0] === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            const user = await UserService.getUserById(id);

            return res.status(200).json({
                message: "User unblocked successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    status: user.status
                }
            });
        } catch (error) {
            console.error("Unblock user error:", error);

            return res.status(500).json({
                error: "Failed to unblock user",
                details: error.message
            });
        }
    };

    // Search users
    searchUsers = async (req, res) => {
        try {
            const { q, role } = req.query;

            if (!q) {
                return res.status(400).json({
                    error: "Search query 'q' is required"
                });
            }

            if (q.length < 2) {
                return res.status(400).json({
                    error: "Search query must be at least 2 characters"
                });
            }

            const users = await UserService.searchUsers(q, role);

            return res.status(200).json({
                users,
                count: users.length
            });
        } catch (error) {
            console.error("Search users error:", error);
            return res.status(500).json({
                error: "Failed to search users",
                details: error.message
            });
        }
    };

    // Get user statistics (admin only)
    getUserStats = async (req, res) => {
        try {
            // Only admins can view stats
            if (req.user.role !== "admin") {
                return res.status(403).json({
                    error: "Forbidden. Only admins can view user statistics"
                });
            }

            const stats = await UserService.getUserStats();

            return res.status(200).json({ stats });
        } catch (error) {
            console.error("Get user stats error:", error);
            return res.status(500).json({
                error: "Failed to fetch user statistics",
                details: error.message
            });
        }
    };
}

export default new UserController();

