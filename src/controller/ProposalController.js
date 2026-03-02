import ProposalService from "../service/concrete/ProposalService.js";
import ProjectService from "../service/concrete/ProjectService.js";
import ContractService from "../service/concrete/ContractService.js";
import UserService from "../service/concrete/UserService.js";
import EmailService from "../service/concrete/EmailService.js";
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

            // Validate bid amount
            const bid = parseFloat(bidAmount);
            if (!bidAmount || isNaN(bid) || bid <= 0) {
                await transaction.rollback();
                return res.status(400).json({ error: "Bid amount must be a positive number" });
            }

            // Validate duration
            const duration = parseInt(durationInDays);
            if (!durationInDays || isNaN(duration) || duration <= 0) {
                await transaction.rollback();
                return res.status(400).json({ error: "Duration in days must be a positive whole number" });
            }

            // Validate cover letter
            if (!coverLetter || coverLetter.trim().length < 20) {
                await transaction.rollback();
                return res.status(400).json({ error: "Cover letter is required and must be at least 20 characters" });
            }

            if (coverLetter.length > 5000) {
                await transaction.rollback();
                return res.status(400).json({ error: "Cover letter must not exceed 5000 characters" });
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

            // Check for duplicate proposals
            const existingProposals = await ProposalService.getProposalsByProjectId(projectId);
            const userProposal = existingProposals.find(p => p.freelancerId === (freelancerId || req.user.id));
            if (userProposal) {
                await transaction.rollback();
                return res.status(400).json({ error: "You have already submitted a proposal for this project" });
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

            // Send emails (fire-and-forget)
            const resolvedFreelancerId = freelancerId || req.user.id;
            const [freelancer, client] = await Promise.all([
                UserService.getUserById(resolvedFreelancerId),
                UserService.getUserById(project.clientId)
            ]);
            if (freelancer) {
                EmailService.sendProposalSubmittedEmail(freelancer.name, freelancer.email, project.title, bidAmount);
            }
            if (client) {
                EmailService.sendNewProposalNotificationEmail(client.name, client.email, freelancer?.name || "A freelancer", project.title, bidAmount);
            }

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
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                await transaction.rollback();
                return res.status(400).json({ error: "Status is required" });
            }

            const validStatuses = ["pending", "accepted", "rejected"];
            if (!validStatuses.includes(status)) {
                await transaction.rollback();
                return res.status(400).json({ error: "Invalid status" });
            }

            // Check if proposal exists
            const proposal = await ProposalService.getProposalById(id);
            if (!proposal) {
                await transaction.rollback();
                return res.status(404).json({ error: "Proposal not found" });
            }

            // Get the project
            const project = await ProjectService.getProjectById(proposal.projectId);

            // Only project owner can accept/reject proposals
            if (project.clientId !== req.user.id && req.user.role !== "admin") {
                await transaction.rollback();
                return res.status(403).json({ error: "Forbidden. Only project owner can accept/reject proposals" });
            }

            const result = await ProposalService.updateProposalStatus(id, status);
            if (!result || result[0] === 0) {
                await transaction.rollback();
                return res.status(404).json({ error: "Proposal not found" });
            }

            // If proposal is accepted, change project status to "in_progress", create contract, and reject other proposals
            if (status === "accepted") {
                // Update project status and assign freelancer
                await ProjectService.updateProject(proposal.projectId, {
                    status: "in_progress",
                    assignedFreelancerId: proposal.freelancerId,
                    lastProgressUpdate: new Date()
                });

                // Check if contract already exists
                const existingContract = await ContractService.getContractByProjectId(proposal.projectId);
                if (!existingContract) {
                    await ContractService.create({
                        projectId: proposal.projectId,
                        clientId: project.clientId,
                        freelancerId: proposal.freelancerId,
                        totalAmount: proposal.bidAmount,
                        status: "active"
                    });
                }

                // Batch-reject all other pending proposals for this project
                const allProposals = await ProposalService.getProposalsByProjectId(proposal.projectId);
                const rejectPromises = allProposals
                    .filter(p => p.id !== id && p.status === "pending")
                    .map(p => ProposalService.updateProposalStatus(p.id, "rejected"));
                await Promise.all(rejectPromises);
            }

            await transaction.commit();

            // Send email after commit (fire-and-forget)
            if (status === "accepted") {
                const freelancer = await UserService.getUserById(proposal.freelancerId);
                if (freelancer) {
                    EmailService.sendProposalAcceptedEmail(freelancer.name, freelancer.email, project.title, proposal.bidAmount);
                }
            }

            return res.status(200).json({ message: `Proposal ${status} successfully` });
        } catch (error) {
            await transaction.rollback();
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

