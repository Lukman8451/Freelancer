export class IUserService {
    register(userData) { }
    login(email, password) { }
    getUserById(id) { }
    getAllUsers(offset, limit, keyword, orderBy, sortBy, filters) { }
    getAllUsersForDropDown() { }
    updateUser(id, updateData) { }
    updateUserStatus(id, status) { }
    changePassword(userId, oldPassword, newPassword) { }
    deleteUser(id) { }
    blockUser(id) { }
    unblockUser(id) { }
    searchUsers(searchTerm, role) { }
    searchUsersByKeyword(keyword) { }
    getUserStats() { }
    getUserByEmail(email) { }
    getUserByIdForAuth(id) { }
    checkIsActive(id) { }
    getUsersByRole(role) { }
    getAllUsersForExport(exportScope, keyword, filters, selectedIds, limit, offset, orderBy, sortBy) { }
}

