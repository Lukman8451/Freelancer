import { Router } from "express";
import ProposalController from "../controller/ProposalController.js";
import isAuthenticated from "../middlewares/jwt.js";

const ProposalRouter = Router();

const proposalController = ProposalController;

ProposalRouter.post(
  "/proposals",
  isAuthenticated,
  proposalController.createProposal
);

ProposalRouter.get(
  "/proposals/project/:projectId",
  isAuthenticated,
  proposalController.getProposalsByProjectId
);

ProposalRouter.get(
  "/proposals/freelancer/:freelancerId",
  isAuthenticated,
  proposalController.getProposalsByFreelancerId
);

ProposalRouter.get(
  "/proposals/:id",
  isAuthenticated,
  proposalController.getProposalById
);

ProposalRouter.get(
  "/proposals",
  isAuthenticated,
  proposalController.getAllProposals
);

ProposalRouter.put(
  "/proposals/:id",
  isAuthenticated,
  proposalController.updateProposal
);

ProposalRouter.put(
  "/proposals/:id/status",
  isAuthenticated,
  proposalController.updateProposalStatus
);

ProposalRouter.delete(
  "/proposals/:id",
  isAuthenticated,
  proposalController.deleteProposal
);

export { ProposalRouter };

