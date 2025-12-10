import SkillService from "../service/concrete/SkillService.js";
import { sequelize } from "../model/index.js";

class SkillController {
    // Create skill
    createSkill = async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { name } = req.body;

            if (!name) {
                await transaction.rollback();
                return res.status(400).json({ error: "Skill name is required" });
            }

            // Check if skill already exists
            const existingSkill = await SkillService.getSkillByName(name);
            if (existingSkill) {
                await transaction.rollback();
                return res.status(409).json({ error: "Skill already exists" });
            }

            const skill = await SkillService.create({ name });

            await transaction.commit();

            return res.status(201).json({
                message: "Skill created successfully",
                skill
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Create skill error:", error);
            return res.status(500).json({
                error: "Failed to create skill",
                details: error.message
            });
        }
    };

    // Get skill by ID
    getSkillById = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "Skill ID is required" });
            }

            const skill = await SkillService.getSkillById(id);
            if (!skill) {
                return res.status(404).json({ error: "Skill not found" });
            }

            return res.status(200).json({ skill });
        } catch (error) {
            console.error("Get skill error:", error);
            return res.status(500).json({
                error: "Failed to fetch skill",
                details: error.message
            });
        }
    };

    // Get all skills
    getAllSkills = async (req, res) => {
        try {
            const {
                keyword = "",
                limit = 50,
                offset = 0,
                orderBy = "name",
                sortBy = "ASC",
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

            const result = await SkillService.getAllSkills(
                parseInt(offset),
                parseInt(limit),
                keyword,
                orderBy,
                sortBy,
                parsedFilters
            );

            return res.status(200).json({
                skills: result.rows,
                total: result.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } catch (error) {
            console.error("Get all skills error:", error);
            return res.status(500).json({
                error: "Failed to fetch skills",
                details: error.message
            });
        }
    };

    // Update skill
    updateSkill = async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ error: "Skill name is required" });
            }

            // Check if skill exists
            const skill = await SkillService.getSkillById(id);
            if (!skill) {
                return res.status(404).json({ error: "Skill not found" });
            }

            // Check if new name already exists (for another skill)
            const existingSkill = await SkillService.getSkillByName(name);
            if (existingSkill && existingSkill.id !== id) {
                return res.status(409).json({ error: "Skill name already exists" });
            }

            const result = await SkillService.updateSkill(id, { name });
            if (!result || result[0] === 0) {
                return res.status(404).json({ error: "Skill not found" });
            }

            const updatedSkill = await SkillService.getSkillById(id);

            return res.status(200).json({
                message: "Skill updated successfully",
                skill: updatedSkill
            });
        } catch (error) {
            console.error("Update skill error:", error);
            return res.status(500).json({
                error: "Failed to update skill",
                details: error.message
            });
        }
    };

    // Delete skill
    deleteSkill = async (req, res) => {
        try {
            const { id } = req.params;

            // Only admins can delete skills
            if (req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. Only admins can delete skills" });
            }

            const result = await SkillService.deleteSkill(id);
            if (!result) {
                return res.status(404).json({ error: "Skill not found" });
            }

            return res.status(200).json({ message: "Skill deleted successfully" });
        } catch (error) {
            console.error("Delete skill error:", error);
            return res.status(500).json({
                error: "Failed to delete skill",
                details: error.message
            });
        }
    };

    // Get all skills for dropdown
    getAllSkillsForDropDown = async (req, res) => {
        try {
            const skills = await SkillService.getAllSkillsForDropDown();

            return res.status(200).json({ skills });
        } catch (error) {
            console.error("Get skills dropdown error:", error);
            return res.status(500).json({
                error: "Failed to fetch skills",
                details: error.message
            });
        }
    };
}

export default new SkillController();

