import { IUserService } from "../abstract/IUserService.js";
import UserRepository from "../../data-access/concrete/UserRepository.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/config.js";

export class UserService extends IUserService {
    constructor() {
        super();
        this.UserRepository = UserRepository;
    }

    register = async (userData) => {
        return await this.UserRepository.create(userData);
    };

    login = async (email) => {
        return await this.UserRepository.getUserByEmail(email);
    };

    getUserById = async (id) => {
        return await this.UserRepository.findById(id);
    };

    getAllUsers = async (offset, limit, keyword, orderBy, sortBy, filters) => {
        return await this.UserRepository.findAll(offset, limit, keyword, orderBy, sortBy, filters);
    };

    getAllUsersForDropDown = async () => {
        return await this.UserRepository.getAllUsersForDropDown();
    };

    updateUser = async (id, updateData) => {
        return await this.UserRepository.update(id, updateData);
    };

    updateUserStatus = async (id, status) => {
        return await this.UserRepository.updateStatus(id, status);
    };

    changePassword = async (userId, passwordHash) => {
        return await this.UserRepository.update(userId, { passwordHash });
    };

    deleteUser = async (id) => {
        return await this.UserRepository.delete(id);
    };

    blockUser = async (id) => {
        return await this.UserRepository.updateStatus(id, "blocked");
    };

    unblockUser = async (id) => {
        return await this.UserRepository.updateStatus(id, "active");
    };

    searchUsers = async (searchTerm, role) => {
        return await this.UserRepository.searchUsers(searchTerm, role);
    };

    searchUsersByKeyword = async (keyword) => {
        return await this.UserRepository.searchUsersByKeyword(keyword);
    };

    getUserStats = async () => {
        const [totalUsers, freelancers, clients, admins] = await Promise.all([
            this.UserRepository.findAll(0, 1, "", "createdAt", "DESC", []).then(r => r.count),
            this.UserRepository.countByRole("freelancer"),
            this.UserRepository.countByRole("client"),
            this.UserRepository.countByRole("admin")
        ]);

        return {
            totalUsers,
            freelancers,
            clients,
            admins
        };
    };

    getUserByEmail = async (email) => {
        return await this.UserRepository.getUserByEmail(email);
    };

    getUserByIdForAuth = async (id) => {
        return await this.UserRepository.getUserByIdForAuth(id);
    };

    checkIsActive = async (id) => {
        return await this.UserRepository.checkIsActive(id);
    };

    getUsersByRole = async (role) => {
        return await this.UserRepository.getUsersByRole(role);
    };

    getAllUsersForExport = async (exportScope, keyword, filters, selectedIds, limit, offset, orderBy = 'createdAt', sortBy = 'DESC') => {
        return await this.UserRepository.getAllUsersForExport(
            exportScope,
            keyword,
            filters,
            selectedIds,
            limit,
            offset,
            orderBy,
            sortBy
        );
    };
}

export default new UserService();

