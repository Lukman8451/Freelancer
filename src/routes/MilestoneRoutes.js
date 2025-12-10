import { Router } from "express";
import MilestoneController from "../controller/MilestoneController.js";
import isAuthenticated from "../middlewares/jwt.js";

const MilestoneRouter = Router();

const milestoneController = MilestoneController;

MilestoneRouter.post(
  "/milestones",
  isAuthenticated,
  milestoneController.createMilestone
);

MilestoneRouter.get(
  "/milestones/contract/:contractId",
  isAuthenticated,
  milestoneController.getMilestonesByContractId
);

MilestoneRouter.get(
  "/milestones/:id",
  isAuthenticated,
  milestoneController.getMilestoneById
);

MilestoneRouter.get(
  "/milestones",
  isAuthenticated,
  milestoneController.getAllMilestones
);

MilestoneRouter.put(
  "/milestones/:id",
  isAuthenticated,
  milestoneController.updateMilestone
);

MilestoneRouter.put(
  "/milestones/:id/status",
  isAuthenticated,
  milestoneController.updateMilestoneStatus
);

MilestoneRouter.delete(
  "/milestones/:id",
  isAuthenticated,
  milestoneController.deleteMilestone
);

export { MilestoneRouter };

