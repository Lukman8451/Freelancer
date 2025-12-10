import PortfolioItemService from "../service/concrete/PortfolioItemService.js";
import ProfileService from "../service/concrete/ProfileService.js";
import { sequelize } from "../model/index.js";

class PortfolioItemController {
    // Create portfolio item
    createPortfolioItem = async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { profileId, title, description, imageUrl, projectUrl } = req.body;

            if (!profileId) {
                await transaction.rollback();
                return res.status(400).json({ error: "Profile ID is required" });
            }

            if (!title) {
                await transaction.rollback();
                return res.status(400).json({ error: "Title is required" });
            }

            // Check if profile exists
            const profile = await ProfileService.getProfileById(profileId);
            if (!profile) {
                await transaction.rollback();
                return res.status(404).json({ error: "Profile not found" });
            }

            // Check if user owns the profile or is admin
            if (profile.userId !== req.user.id && req.user.role !== "admin") {
                await transaction.rollback();
                return res.status(403).json({ error: "Forbidden. You can only add items to your own portfolio" });
            }

            const portfolioItem = await PortfolioItemService.create({
                profileId,
                title,
                description,
                imageUrl,
                projectUrl
            });

            await transaction.commit();

            return res.status(201).json({
                message: "Portfolio item created successfully",
                portfolioItem
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Create portfolio item error:", error);
            return res.status(500).json({
                error: "Failed to create portfolio item",
                details: error.message
            });
        }
    };

    // Get portfolio item by ID
    getPortfolioItemById = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "Portfolio Item ID is required" });
            }

            const portfolioItem = await PortfolioItemService.getPortfolioItemById(id);
            if (!portfolioItem) {
                return res.status(404).json({ error: "Portfolio item not found" });
            }

            return res.status(200).json({ portfolioItem });
        } catch (error) {
            console.error("Get portfolio item error:", error);
            return res.status(500).json({
                error: "Failed to fetch portfolio item",
                details: error.message
            });
        }
    };

    // Get all portfolio items
    getAllPortfolioItems = async (req, res) => {
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

            const result = await PortfolioItemService.getAllPortfolioItems(
                parseInt(offset),
                parseInt(limit),
                keyword,
                orderBy,
                sortBy,
                parsedFilters
            );

            return res.status(200).json({
                portfolioItems: result.rows,
                total: result.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } catch (error) {
            console.error("Get all portfolio items error:", error);
            return res.status(500).json({
                error: "Failed to fetch portfolio items",
                details: error.message
            });
        }
    };

    // Get portfolio items by profile ID
    getPortfolioItemsByProfileId = async (req, res) => {
        try {
            const { profileId } = req.params;

            if (!profileId) {
                return res.status(400).json({ error: "Profile ID is required" });
            }

            const portfolioItems = await PortfolioItemService.getPortfolioItemsByProfileId(profileId);

            return res.status(200).json({ portfolioItems });
        } catch (error) {
            console.error("Get profile portfolio items error:", error);
            return res.status(500).json({
                error: "Failed to fetch portfolio items",
                details: error.message
            });
        }
    };

    // Update portfolio item
    updatePortfolioItem = async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ error: "No update data provided" });
            }

            // Check if portfolio item exists
            const portfolioItem = await PortfolioItemService.getPortfolioItemById(id);
            if (!portfolioItem) {
                return res.status(404).json({ error: "Portfolio item not found" });
            }

            // Get profile to check ownership
            const profile = await ProfileService.getProfileById(portfolioItem.profileId);
            if (profile.userId !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. You can only update your own portfolio items" });
            }

            const result = await PortfolioItemService.updatePortfolioItem(id, updateData);
            if (!result || result[0] === 0) {
                return res.status(404).json({ error: "Portfolio item not found" });
            }

            const updatedPortfolioItem = await PortfolioItemService.getPortfolioItemById(id);

            return res.status(200).json({
                message: "Portfolio item updated successfully",
                portfolioItem: updatedPortfolioItem
            });
        } catch (error) {
            console.error("Update portfolio item error:", error);
            return res.status(500).json({
                error: "Failed to update portfolio item",
                details: error.message
            });
        }
    };

    // Delete portfolio item
    deletePortfolioItem = async (req, res) => {
        try {
            const { id } = req.params;

            // Check if portfolio item exists
            const portfolioItem = await PortfolioItemService.getPortfolioItemById(id);
            if (!portfolioItem) {
                return res.status(404).json({ error: "Portfolio item not found" });
            }

            // Get profile to check ownership
            const profile = await ProfileService.getProfileById(portfolioItem.profileId);
            if (profile.userId !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. You can only delete your own portfolio items" });
            }

            const result = await PortfolioItemService.deletePortfolioItem(id);
            if (!result) {
                return res.status(404).json({ error: "Portfolio item not found" });
            }

            return res.status(200).json({ message: "Portfolio item deleted successfully" });
        } catch (error) {
            console.error("Delete portfolio item error:", error);
            return res.status(500).json({
                error: "Failed to delete portfolio item",
                details: error.message
            });
        }
    };

    // Bulk create portfolio items
    bulkCreatePortfolioItems = async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { profileId, portfolioItems } = req.body;

            if (!profileId) {
                await transaction.rollback();
                return res.status(400).json({ error: "Profile ID is required" });
            }

            if (!portfolioItems || !Array.isArray(portfolioItems) || portfolioItems.length === 0) {
                await transaction.rollback();
                return res.status(400).json({ error: "Portfolio items array is required" });
            }

            // Check if profile exists
            const profile = await ProfileService.getProfileById(profileId);
            if (!profile) {
                await transaction.rollback();
                return res.status(404).json({ error: "Profile not found" });
            }

            // Check if user owns the profile or is admin
            if (profile.userId !== req.user.id && req.user.role !== "admin") {
                await transaction.rollback();
                return res.status(403).json({ error: "Forbidden. You can only add items to your own portfolio" });
            }

            // Add profileId to each portfolio item
            const portfolioDataArray = portfolioItems.map(item => ({
                ...item,
                profileId
            }));

            const createdItems = await PortfolioItemService.bulkCreatePortfolioItems(portfolioDataArray);

            await transaction.commit();

            return res.status(201).json({
                message: "Portfolio items created successfully",
                portfolioItems: createdItems
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Bulk create portfolio items error:", error);
            return res.status(500).json({
                error: "Failed to create portfolio items",
                details: error.message
            });
        }
    };
}

export default new PortfolioItemController();

