import { Router } from "express";
import UserController from "../controller/UserController.js";
import isAuthenticated from "../middlewares/jwt.js";
import { loginRateLimiter, registerRateLimiter } from "../middlewares/rateLimiter.js";

const UserRouter = Router();

// Object for the controller to access the methods
const userController = UserController;

// Public routes (no authentication required)
UserRouter.post(
    "/users/register",
    registerRateLimiter,
    userController.register
);

UserRouter.post(
    "/users/login",
    loginRateLimiter,
    userController.login
);

// Protected routes (authentication required)
UserRouter.get(
    "/users/profile",
    isAuthenticated,
    userController.getProfile
);

UserRouter.get(
    "/users/search",
    isAuthenticated,
    userController.searchUsers
);

UserRouter.get(
    "/users/stats",
    isAuthenticated,
    userController.getUserStats
);

UserRouter.get(
    "/users/:id",
    isAuthenticated,
    userController.getUserById
);

UserRouter.get(
    "/users",
    isAuthenticated,
    userController.getAllUsers
);

UserRouter.put(
    "/users/:id",
    isAuthenticated,
    userController.updateUser
);

UserRouter.post(
    "/users/change-password",
    isAuthenticated,
    userController.changePassword
);

UserRouter.delete(
    "/users/:id",
    isAuthenticated,
    userController.deleteUser
);

UserRouter.patch(
    "/users/:id/block",
    isAuthenticated,
    userController.blockUser
);

UserRouter.patch(
    "/users/:id/unblock",
    isAuthenticated,
    userController.unblockUser
);

export { UserRouter };

