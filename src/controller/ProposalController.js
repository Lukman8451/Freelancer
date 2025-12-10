import ProposalService from "../service/concrete/ProposalService.js";
import ProjectService from "../service/concrete/ProjectService.js";
import { sequelize } from "../model/index.js";

class ProposalController {
    // Create proposal
    createProposal = async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { projectId, freelancerId, coverLetter, bidAmount, durationInDays } = req.body;

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

            // Check if project is open
            if (project.status !== "open") {
                await transaction.rollback();
                return res.status(400).json({ error: "Project is not open for proposals" });
            }

            const proposal = await ProposalService.create({
                projectId,
                freelancerId: freelancerId || req.user.id,
                coverLetter,
                bidAmount,
                durationInDays,
                status: "pending"
            });

            await transaction.commit();

            return res.status(201).json({
                message: "Proposal submitted successfully",
                proposal
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Create proposal error:", error);
            return res.status(500).json({
                error: "Failed to create proposal",
                details: error.message
            });
        }
    };

    // Get proposal by ID
    getProposalById = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ error: "Proposal ID is required" });
            }

            const proposal = await ProposalService.getProposalById(id);
            if (!proposal) {
                return res.status(404).json({ error: "Proposal not found" });
            }

            return res.status(200).json({ proposal });
        } catch (error) {
            console.error("Get proposal error:", error);
            return res.status(500).json({
                error: "Failed to fetch proposal",
                details: error.message
            });
        }
    };

    // Get all proposals
    getAllProposals = async (req, res) => {
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

            const result = await ProposalService.getAllProposals(
                parseInt(offset),
                parseInt(limit),
                keyword,
                orderBy,
                sortBy,
                parsedFilters
            );

            return res.status(200).json({
                proposals: result.rows,
                total: result.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } catch (error) {
            console.error("Get all proposals error:", error);
            return res.status(500).json({
                error: "Failed to fetch proposals",
                details: error.message
            });
        }
    };

    // Get proposals by project ID
    getProposalsByProjectId = async (req, res) => {
        try {
            const { projectId } = req.params;

            if (!projectId) {
                return res.status(400).json({ error: "Project ID is required" });
            }

            const proposals = await ProposalService.getProposalsByProjectId(projectId);

            return res.status(200).json({ proposals });
        } catch (error) {
            console.error("Get project proposals error:", error);
            return res.status(500).json({
                error: "Failed to fetch proposals",
                details: error.message
            });
        }
    };

    // Get proposals by freelancer ID
    getProposalsByFreelancerId = async (req, res) => {
        try {
            const { freelancerId } = req.params;

            if (!freelancerId) {
                return res.status(400).json({ error: "Freelancer ID is required" });
            }

            const proposals = await ProposalService.getProposalsByFreelancerId(freelancerId);

            return res.status(200).json({ proposals });
        } catch (error) {
            console.error("Get freelancer proposals error:", error);
            return res.status(500).json({
                error: "Failed to fetch proposals",
                details: error.message
            });
        }
    };

    // Update proposal
    updateProposal = async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ error: "No update data provided" });
            }

            // Check if proposal exists
            const proposal = await ProposalService.getProposalById(id);
            if (!proposal) {
                return res.status(404).json({ error: "Proposal not found" });
            }

            // Check if user owns the proposal or is admin
            if (proposal.freelancerId !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. You can only update your own proposals" });
            }

            const result = await ProposalService.updateProposal(id, updateData);
            if (!result || result[0] === 0) {
                return res.status(404).json({ error: "Proposal not found" });
            }

            const updatedProposal = await ProposalService.getProposalById(id);

            return res.status(200).json({
                message: "Proposal updated successfully",
                proposal: updatedProposal
            });
        } catch (error) {
            console.error("Update proposal error:", error);
            return res.status(500).json({
                error: "Failed to update proposal",
                details: error.message
            });
        }
    };

    // Update proposal status (Accept/Reject)
    updateProposalStatus = async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ error: "Status is required" });
            }

            const validStatuses = ["pending", "accepted", "rejected"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }

            // Check if proposal exists
            const proposal = await ProposalService.getProposalById(id);
            if (!proposal) {
                return res.status(404).json({ error: "Proposal not found" });
            }

            // Get the project
            const project = await ProjectService.getProjectById(proposal.projectId);
            
            // Only project owner can accept/reject proposals
            if (project.clientId !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. Only project owner can accept/reject proposals" });
            }

            const result = await ProposalService.updateProposalStatus(id, status);
            if (!result || result[0] === 0) {
                return res.status(404).json({ error: "Proposal not found" });
            }

            return res.status(200).json({ message: `Proposal ${status} successfully` });
        } catch (error) {
            console.error("Update proposal status error:", error);
            return res.status(500).json({
                error: "Failed to update proposal status",
                details: error.message
            });
        }
    };

    // Delete proposal
    deleteProposal = async (req, res) => {
        try {
            const { id } = req.params;

            // Check if proposal exists
            const proposal = await ProposalService.getProposalById(id);
            if (!proposal) {
                return res.status(404).json({ error: "Proposal not found" });
            }

            // Check if user owns the proposal or is admin
            if (proposal.freelancerId !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden. You can only delete your own proposals" });
            }

            const result = await ProposalService.deleteProposal(id);
            if (!result) {
                return res.status(404).json({ error: "Proposal not found" });
            }

            return res.status(200).json({ message: "Proposal deleted successfully" });
        } catch (error) {
            console.error("Delete proposal error:", error);
            return res.status(500).json({
                error: "Failed to delete proposal",
                details: error.message
            });
        }
    };
}

export default new ProposalController();

