import ProjectService from "../service/concrete/ProjectService.js";
import UserService from "../service/concrete/UserService.js";
import { sequelize } from "../model/index.js";

class ProjectController {
    // Create project
    createProject = async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { clientId, title, description, budgetMin, budgetMax } = req.body;

            if (!title) {
                await transaction.rollback();
                return res.status(400).json({ error: "Title is required" });
            }

            const project = await ProjectService.create({
                clientId: clientId || req.user.id,
                title,
                description,
                budgetMin,
                budgetMax,
                status: "open"
            });

            await transaction.commit();

            return res.status(201).json({
                message: "Project created successfully",
                project
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Create project error:", error);
            return res.status(500).json({
                error: "Failed to create project",
                details: error.message
            });
        }
    };

    // Get project by ID
    getProjectById = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "Project ID is required" });
            }

            const project = await ProjectService.getProjectById(id);
            if (!project) {
                return res.status(404).json({ error: "Project not found" });
            }

            return res.status(200).json({ project });
        } catch (error) {
            console.error("Get project error:", error);
            return res.status(500).json({
                error: "Failed to fetch project",
                details: error.message
            });
        }
    };

    // Get all projects
    getAllProjects = async (req, res) => {
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

            const result = await ProjectService.getAllProjects(
                parseInt(offset),
                parseInt(limit),
                keyword,
                orderBy,
                sortBy,
                parsedFilters
            );

            return res.status(200).json({
                projects: result.rows,
                total: result.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } catch (error) {
            console.error("Get all projects error:", error);
            return res.status(500).json({
                error: "Failed to fetch projects",
                details: error.message
            });
        }
    };

    // Get projects by client ID
    getProjectsByClientId = async (req, res) => {
        try {
            const { clientId } = req.params;

            if (!clientId) {
                return res.status(400).json({ error: "Client ID is required" });
            }

            const projects = await ProjectService.getProjectsByClientId(clientId);

            return res.status(200).json({ projects });
        } catch (error) {
            console.error("Get client projects error:", error);
            return res.status(500).json({
                error: "Failed to fetch client projects",
                details: error.message
            });
        }
    };

    // Get projects by status
    getProjectsByStatus = async (req, res) => {
        try {
            const { status } = req.params;

            const validStatuses = ["open", "in_progress", "completed", "cancelled"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }

            const projects = await ProjectService.getProjectsByStatus(status);

            return res.status(200).json({ projects });
        } catch (error) {
            console.error("Get projects by status error:", error);
            return res.status(500).json({
                error: "Failed to fetch projects",
                details: error.message
            });
        }
    };

    // Update project
    updateProject = async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ error: "No update data provided" });
            }

            // Check if project exists
            const project = await ProjectService.getProjectById(id);
            if (!project) {
                return res.status(404).json({ error: "Project not found" });
            }

            // Check if user owns the project or is admin
            if (project.clientId !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. You can only update your own projects" });
            }

            const result = await ProjectService.updateProject(id, updateData);
            if (!result || result[0] === 0) {
                return res.status(404).json({ error: "Project not found" });
            }

            const updatedProject = await ProjectService.getProjectById(id);

            return res.status(200).json({
                message: "Project updated successfully",
                project: updatedProject
            });
        } catch (error) {
            console.error("Update project error:", error);
            return res.status(500).json({
                error: "Failed to update project",
                details: error.message
            });
        }
    };

    // Update project status
    updateProjectStatus = async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ error: "Status is required" });
            }

            const validStatuses = ["open", "in_progress", "completed", "cancelled"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }

            // Check if project exists
            const project = await ProjectService.getProjectById(id);
            if (!project) {
                return res.status(404).json({ error: "Project not found" });
            }

            // Check if user owns the project or is admin
            if (project.clientId !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. You can only update your own projects" });
            }

            const result = await ProjectService.updateProjectStatus(id, status);
            if (!result || result[0] === 0) {
                return res.status(404).json({ error: "Project not found" });
            }

            return res.status(200).json({ message: "Project status updated successfully" });
        } catch (error) {
            console.error("Update project status error:", error);
            return res.status(500).json({
                error: "Failed to update project status",
                details: error.message
            });
        }
    };

    // Delete project
    deleteProject = async (req, res) => {
        try {
            const { id } = req.params;

            // Check if project exists
            const project = await ProjectService.getProjectById(id);
            if (!project) {
                return res.status(404).json({ error: "Project not found" });
            }

            // Check if user owns the project or is admin
            if (project.clientId !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. You can only delete your own projects" });
            }

            const result = await ProjectService.deleteProject(id);
            if (!result) {
                return res.status(404).json({ error: "Project not found" });
            }

            return res.status(200).json({ message: "Project deleted successfully" });
        } catch (error) {
            console.error("Delete project error:", error);
            return res.status(500).json({
                error: "Failed to delete project",
                details: error.message
            });
        }
    };

    // Get all projects for dropdown
    getAllProjectsForDropDown = async (req, res) => {
        try {
            const projects = await ProjectService.getAllProjectsForDropDown();

            return res.status(200).json({ projects });
        } catch (error) {
            console.error("Get projects dropdown error:", error);
            return res.status(500).json({
                error: "Failed to fetch projects",
                details: error.message
            });
        }
    };
}

export default new ProjectController();

