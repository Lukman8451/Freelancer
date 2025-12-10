import ProfileService from "../service/concrete/ProfileService.js";
import UserService from "../service/concrete/UserService.js";
import { sequelize } from "../model/index.js";

class ProfileController {
    // Create profile
    createProfile = async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { userId, displayName, bio, hourlyRate, location, experienceLevel, profilePhoto } = req.body;

            if (!userId) {
                await transaction.rollback();
                return res.status(400).json({ error: "User ID is required" });
            }

            // Check if user exists
            const user = await UserService.getUserById(userId);
            if (!user) {
                await transaction.rollback();
                return res.status(404).json({ error: "User not found" });
            }

            // Check if profile already exists for this user
            const existingProfile = await ProfileService.getProfileByUserId(userId);
            if (existingProfile) {
                await transaction.rollback();
                return res.status(409).json({ error: "Profile already exists for this user" });
            }

            const profile = await ProfileService.create({
                userId,
                displayName,
                bio,
                hourlyRate,
                location,
                experienceLevel,
                profilePhoto,
                isVerified: false
            });

            await transaction.commit();

            return res.status(201).json({
                message: "Profile created successfully",
                profile
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Create profile error:", error);
            return res.status(500).json({
                error: "Failed to create profile",
                details: error.message
            });
        }
    };

    // Get profile by ID
    getProfileById = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "Profile ID is required" });
            }

            const profile = await ProfileService.getProfileById(id);
            if (!profile) {
                return res.status(404).json({ error: "Profile not found" });
            }

            return res.status(200).json({ profile });
        } catch (error) {
            console.error("Get profile error:", error);
            return res.status(500).json({
                error: "Failed to fetch profile",
                details: error.message
            });
        }
    };

    // Get profile by user ID
    getProfileByUserId = async (req, res) => {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({ error: "User ID is required" });
            }

            const profile = await ProfileService.getProfileByUserId(userId);
            if (!profile) {
                return res.status(404).json({ error: "Profile not found" });
            }

            return res.status(200).json({ profile });
        } catch (error) {
            console.error("Get profile by user error:", error);
            return res.status(500).json({
                error: "Failed to fetch profile",
                details: error.message
            });
        }
    };

    // Get all profiles
    getAllProfiles = async (req, res) => {
        try {
            const {
                keyword = "",
                limit = 50,
                offset = 0,
                orderBy = "createdAt",
                sortBy = "DESC",
                filters
            } = req.query;

            let parsedFilters = [];
            if (filters) {
                try {
                    parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
                } catch (e) {
                    parsedFilters = [];
                }
            }

            const result = await ProfileService.getAllProfiles(
                parseInt(offset),
                parseInt(limit),
                keyword,
                orderBy,
                sortBy,
                parsedFilters
            );

            return res.status(200).json({
                profiles: result.rows,
                total: result.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } catch (error) {
            console.error("Get all profiles error:", error);
            return res.status(500).json({
                error: "Failed to fetch profiles",
                details: error.message
            });
        }
    };

    // Update profile
    updateProfile = async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ error: "No update data provided" });
            }

            // Check if profile exists
            const profile = await ProfileService.getProfileById(id);
            if (!profile) {
                return res.status(404).json({ error: "Profile not found" });
            }

            // Check if user owns the profile or is admin
            if (profile.userId !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. You can only update your own profile" });
            }

            const result = await ProfileService.updateProfile(id, updateData);
            if (!result || result[0] === 0) {
                return res.status(404).json({ error: "Profile not found" });
            }

            const updatedProfile = await ProfileService.getProfileById(id);

            return res.status(200).json({
                message: "Profile updated successfully",
                profile: updatedProfile
            });
        } catch (error) {
            console.error("Update profile error:", error);
            return res.status(500).json({
                error: "Failed to update profile",
                details: error.message
            });
        }
    };

    // Delete profile
    deleteProfile = async (req, res) => {
        try {
            const { id } = req.params;

            // Check if profile exists
            const profile = await ProfileService.getProfileById(id);
            if (!profile) {
                return res.status(404).json({ error: "Profile not found" });
            }

            // Check if user owns the profile or is admin
            if (profile.userId !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. You can only delete your own profile" });
            }

            const result = await ProfileService.deleteProfile(id);
            if (!result) {
                return res.status(404).json({ error: "Profile not found" });
            }

            return res.status(200).json({ message: "Profile deleted successfully" });
        } catch (error) {
            console.error("Delete profile error:", error);
            return res.status(500).json({
                error: "Failed to delete profile",
                details: error.message
            });
        }
    };

    // Add skill to profile
    addSkill = async (req, res) => {
        try {
            const { profileId, skillId } = req.body;

            if (!profileId || !skillId) {
                return res.status(400).json({ error: "Profile ID and Skill ID are required" });
            }

            // Check if profile exists
            const profile = await ProfileService.getProfileById(profileId);
            if (!profile) {
                return res.status(404).json({ error: "Profile not found" });
            }

            // Check if user owns the profile or is admin
            if (profile.userId !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. You can only modify your own profile" });
            }

            await ProfileService.addSkill(profileId, skillId);

            return res.status(200).json({ message: "Skill added successfully" });
        } catch (error) {
            console.error("Add skill error:", error);
            return res.status(500).json({
                error: "Failed to add skill",
                details: error.message
            });
        }
    };

    // Remove skill from profile
    removeSkill = async (req, res) => {
        try {
            const { profileId, skillId } = req.body;

            if (!profileId || !skillId) {
                return res.status(400).json({ error: "Profile ID and Skill ID are required" });
            }

            // Check if profile exists
            const profile = await ProfileService.getProfileById(profileId);
            if (!profile) {
                return res.status(404).json({ error: "Profile not found" });
            }

            // Check if user owns the profile or is admin
            if (profile.userId !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. You can only modify your own profile" });
            }

            await ProfileService.removeSkill(profileId, skillId);

            return res.status(200).json({ message: "Skill removed successfully" });
        } catch (error) {
            console.error("Remove skill error:", error);
            return res.status(500).json({
                error: "Failed to remove skill",
                details: error.message
            });
        }
    };

    // Get all profiles for dropdown
    getAllProfilesForDropDown = async (req, res) => {
        try {
            const profiles = await ProfileService.getAllProfilesForDropDown();

            return res.status(200).json({ profiles });
        } catch (error) {
            console.error("Get profiles dropdown error:", error);
            return res.status(500).json({
                error: "Failed to fetch profiles",
                details: error.message
            });
        }
    };
}

export default new ProfileController();
