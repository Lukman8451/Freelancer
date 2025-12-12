import ContractService from "../service/concrete/ContractService.js";
import ProjectService from "../service/concrete/ProjectService.js";
import ProposalService from "../service/concrete/ProposalService.js";
import { sequelize } from "../model/index.js";

class ContractController {
    // Create contract
    createContract = async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { projectId, clientId, freelancerId } = req.body;

            if (!projectId) {
                await transaction.rollback();
                return res.status(400).json({ error: "Project ID is required" });
            }

            // Check if project exists
            const project = await ProjectService.getProjectById(projectId);
            if (!project) {
                await transaction.rollback();
                return res.status(404).json({ error: "Project not found" });
            }

            // Check if user is the client or admin
            if (project.clientId !== req.user.id && req.user.role !== "admin") {
                await transaction.rollback();
                return res.status(403).json({ error: "Forbidden. Only project owner can create contracts" });
            }

            // Check if contract already exists for this project
            const existingContract = await ContractService.getContractByProjectId(projectId);
            if (existingContract) {
                await transaction.rollback();
                return res.status(409).json({ error: "Contract already exists for this project" });
            }

            const contract = await ContractService.create({
                projectId,
                clientId: clientId || project.clientId,
                freelancerId: freelancerId,
                status: "pending"
            });

            await transaction.commit();

            return res.status(201).json({
                message: "Contract created successfully",
                contract
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Create contract error:", error);
            return res.status(500).json({
                error: "Failed to create contract",
                details: error.message
            });
        }
    };

    // Get contract by ID
    getContractById = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "Contract ID is required" });
            }

            const contract = await ContractService.getContractById(id);
            if (!contract) {
                return res.status(404).json({ error: "Contract not found" });
            }

            return res.status(200).json({ contract });
        } catch (error) {
            console.error("Get contract error:", error);
            return res.status(500).json({
                error: "Failed to fetch contract",
                details: error.message
            });
        }
    };

    // Get all contracts
    getAllContracts = async (req, res) => {
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

            const result = await ContractService.getAllContracts(
                parseInt(offset),
                parseInt(limit),
                keyword,
                orderBy,
                sortBy,
                parsedFilters
            );

            return res.status(200).json({
                contracts: result.rows,
                total: result.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } catch (error) {
            console.error("Get all contracts error:", error);
            return res.status(500).json({
                error: "Failed to fetch contracts",
                details: error.message
            });
        }
    };

    // Get contract by project ID
    getContractByProjectId = async (req, res) => {
        try {
            const { projectId } = req.params;

            if (!projectId) {
                return res.status(400).json({ error: "Project ID is required" });
            }

            const contract = await ContractService.getContractByProjectId(projectId);
            if (!contract) {
                return res.status(404).json({ error: "Contract not found" });
            }

            return res.status(200).json({ contract });
        } catch (error) {
            console.error("Get contract by project error:", error);
            return res.status(500).json({
                error: "Failed to fetch contract",
                details: error.message
            });
        }
    };

    // Get contracts by client ID
    getContractsByClientId = async (req, res) => {
        try {
            const { clientId } = req.params;

            if (!clientId) {
                return res.status(400).json({ error: "Client ID is required" });
            }

            const contracts = await ContractService.getContractsByClientId(clientId);

            return res.status(200).json({ contracts });
        } catch (error) {
            console.error("Get client contracts error:", error);
            return res.status(500).json({
                error: "Failed to fetch contracts",
                details: error.message
            });
        }
    };

    // Get contracts by freelancer ID
    getContractsByFreelancerId = async (req, res) => {
        try {
            const { freelancerId } = req.params;

            if (!freelancerId) {
                return res.status(400).json({ error: "Freelancer ID is required" });
            }

            const contracts = await ContractService.getContractsByFreelancerId(freelancerId);

            return res.status(200).json({ contracts });
        } catch (error) {
            console.error("Get freelancer contracts error:", error);
            return res.status(500).json({
                error: "Failed to fetch contracts",
                details: error.message
            });
        }
    };

    // Update contract
    updateContract = async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ error: "No update data provided" });
            }

            // Check if contract exists
            const contract = await ContractService.getContractById(id);
            if (!contract) {
                return res.status(404).json({ error: "Contract not found" });
            }

            // Check if user is part of the contract or is admin
            if (contract.clientId !== req.user.id && 
                contract.freelancerId !== req.user.id && 
                req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. You can only update your own contracts" });
            }

            const result = await ContractService.updateContract(id, updateData);
            if (!result || result[0] === 0) {
                return res.status(404).json({ error: "Contract not found" });
            }

            const updatedContract = await ContractService.getContractById(id);

            return res.status(200).json({
                message: "Contract updated successfully",
                contract: updatedContract
            });
        } catch (error) {
            console.error("Update contract error:", error);
            return res.status(500).json({
                error: "Failed to update contract",
                details: error.message
            });
        }
    };

    // Get contract payment summary
    getContractPaymentSummary = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "Contract ID is required" });
            }

            const contract = await ContractService.getContractById(id);
            if (!contract) {
                return res.status(404).json({ error: "Contract not found" });
            }

            // Get all milestones for this contract
            const milestones = await ContractService.getMilestonesByContractId(id);
            const milestonesList = milestones || [];
            
            const totalAmount = contract.totalAmount || 0;
            const paidAmount = milestonesList
                .filter(m => m.status === 'funded' || m.status === 'released')
                .reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
            const remainingAmount = Math.max(0, totalAmount - paidAmount);

            return res.status(200).json({
                totalAmount,
                paidAmount,
                remainingAmount,
                milestonesCount: milestonesList.length
            });
        } catch (error) {
            console.error("Get contract payment summary error:", error);
            return res.status(500).json({
                error: "Failed to fetch payment summary",
                details: error.message
            });
        }
    };

    // Update contract status
    updateContractStatus = async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ error: "Status is required" });
            }

            const validStatuses = ["pending", "active", "completed", "disputed"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }

            // Check if contract exists
            const contract = await ContractService.getContractById(id);
            if (!contract) {
                return res.status(404).json({ error: "Contract not found" });
            }

            // Check if user is part of the contract or is admin
            if (contract.clientId !== req.user.id && 
                contract.freelancerId !== req.user.id && 
                req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden" });
            }

            const result = await ContractService.updateContractStatus(id, status);
            if (!result || result[0] === 0) {
                return res.status(404).json({ error: "Contract not found" });
            }

            return res.status(200).json({ message: "Contract status updated successfully" });
        } catch (error) {
            console.error("Update contract status error:", error);
            return res.status(500).json({
                error: "Failed to update contract status",
                details: error.message
            });
        }
    };

    // Delete contract
    deleteContract = async (req, res) => {
        try {
            const { id } = req.params;

            // Only admins can delete contracts
            if (req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. Only admins can delete contracts" });
            }

            const result = await ContractService.deleteContract(id);
            if (!result) {
                return res.status(404).json({ error: "Contract not found" });
            }

            return res.status(200).json({ message: "Contract deleted successfully" });
        } catch (error) {
            console.error("Delete contract error:", error);
            return res.status(500).json({
                error: "Failed to delete contract",
                details: error.message
            });
        }
    };
}

export default new ContractController();

