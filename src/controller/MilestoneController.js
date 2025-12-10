import MilestoneService from "../service/concrete/MilestoneService.js";
import ContractService from "../service/concrete/ContractService.js";
import { sequelize } from "../model/index.js";

class MilestoneController {
    // Create milestone
    createMilestone = async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { contractId, title, amount, dueDate } = req.body;

            if (!contractId) {
                await transaction.rollback();
                return res.status(400).json({ error: "Contract ID is required" });
            }

            if (!title) {
                await transaction.rollback();
                return res.status(400).json({ error: "Title is required" });
            }

            if (!amount) {
                await transaction.rollback();
                return res.status(400).json({ error: "Amount is required" });
            }

            // Check if contract exists
            const contract = await ContractService.getContractById(contractId);
            if (!contract) {
                await transaction.rollback();
                return res.status(404).json({ error: "Contract not found" });
            }

            // Check if user is part of the contract
            if (contract.clientId !== req.user.id && 
                contract.freelancerId !== req.user.id && 
                req.user.role !== "admin") {
                await transaction.rollback();
                return res.status(403).json({ error: "Forbidden" });
            }

            const milestone = await MilestoneService.create({
                contractId,
                title,
                amount,
                dueDate,
                status: "pending"
            });

            await transaction.commit();

            return res.status(201).json({
                message: "Milestone created successfully",
                milestone
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Create milestone error:", error);
            return res.status(500).json({
                error: "Failed to create milestone",
                details: error.message
            });
        }
    };

    // Get milestone by ID
    getMilestoneById = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "Milestone ID is required" });
            }

            const milestone = await MilestoneService.getMilestoneById(id);
            if (!milestone) {
                return res.status(404).json({ error: "Milestone not found" });
            }

            return res.status(200).json({ milestone });
        } catch (error) {
            console.error("Get milestone error:", error);
            return res.status(500).json({
                error: "Failed to fetch milestone",
                details: error.message
            });
        }
    };

    // Get all milestones
    getAllMilestones = async (req, res) => {
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

            const result = await MilestoneService.getAllMilestones(
                parseInt(offset),
                parseInt(limit),
                keyword,
                orderBy,
                sortBy,
                parsedFilters
            );

            return res.status(200).json({
                milestones: result.rows,
                total: result.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } catch (error) {
            console.error("Get all milestones error:", error);
            return res.status(500).json({
                error: "Failed to fetch milestones",
                details: error.message
            });
        }
    };

    // Get milestones by contract ID
    getMilestonesByContractId = async (req, res) => {
        try {
            const { contractId } = req.params;

            if (!contractId) {
                return res.status(400).json({ error: "Contract ID is required" });
            }

            const milestones = await MilestoneService.getMilestonesByContractId(contractId);

            return res.status(200).json({ milestones });
        } catch (error) {
            console.error("Get contract milestones error:", error);
            return res.status(500).json({
                error: "Failed to fetch milestones",
                details: error.message
            });
        }
    };

    // Update milestone
    updateMilestone = async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ error: "No update data provided" });
            }

            // Check if milestone exists
            const milestone = await MilestoneService.getMilestoneById(id);
            if (!milestone) {
                return res.status(404).json({ error: "Milestone not found" });
            }

            // Get contract to check ownership
            const contract = await ContractService.getContractById(milestone.contractId);
            if (contract.clientId !== req.user.id && 
                contract.freelancerId !== req.user.id && 
                req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden" });
            }

            const result = await MilestoneService.updateMilestone(id, updateData);
            if (!result || result[0] === 0) {
                return res.status(404).json({ error: "Milestone not found" });
            }

            const updatedMilestone = await MilestoneService.getMilestoneById(id);

            return res.status(200).json({
                message: "Milestone updated successfully",
                milestone: updatedMilestone
            });
        } catch (error) {
            console.error("Update milestone error:", error);
            return res.status(500).json({
                error: "Failed to update milestone",
                details: error.message
            });
        }
    };

    // Update milestone status
    updateMilestoneStatus = async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ error: "Status is required" });
            }

            const validStatuses = ["pending", "funded", "released"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }

            // Check if milestone exists
            const milestone = await MilestoneService.getMilestoneById(id);
            if (!milestone) {
                return res.status(404).json({ error: "Milestone not found" });
            }

            // Get contract to check ownership
            const contract = await ContractService.getContractById(milestone.contractId);
            if (contract.clientId !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. Only client can update milestone status" });
            }

            const result = await MilestoneService.updateMilestoneStatus(id, status);
            if (!result || result[0] === 0) {
                return res.status(404).json({ error: "Milestone not found" });
            }

            return res.status(200).json({ message: "Milestone status updated successfully" });
        } catch (error) {
            console.error("Update milestone status error:", error);
            return res.status(500).json({
                error: "Failed to update milestone status",
                details: error.message
            });
        }
    };

    // Delete milestone
    deleteMilestone = async (req, res) => {
        try {
            const { id } = req.params;

            // Check if milestone exists
            const milestone = await MilestoneService.getMilestoneById(id);
            if (!milestone) {
                return res.status(404).json({ error: "Milestone not found" });
            }

            // Get contract to check ownership
            const contract = await ContractService.getContractById(milestone.contractId);
            if (contract.clientId !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. Only client can delete milestones" });
            }

            const result = await MilestoneService.deleteMilestone(id);
            if (!result) {
                return res.status(404).json({ error: "Milestone not found" });
            }

            return res.status(200).json({ message: "Milestone deleted successfully" });
        } catch (error) {
            console.error("Delete milestone error:", error);
            return res.status(500).json({
                error: "Failed to delete milestone",
                details: error.message
            });
        }
    };
}

export default new MilestoneController();

