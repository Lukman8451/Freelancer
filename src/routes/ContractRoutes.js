import { Router } from "express";
import ContractController from "../controller/ContractController.js";
import isAuthenticated from "../middlewares/jwt.js";

const ContractRouter = Router();

const contractController = ContractController;

ContractRouter.post(
  "/contracts",
  isAuthenticated,
  contractController.createContract
);

ContractRouter.get(
  "/contracts/project/:projectId",
  isAuthenticated,
  contractController.getContractByProjectId
);

ContractRouter.get(
  "/contracts/client/:clientId",
  isAuthenticated,
  contractController.getContractsByClientId
);

ContractRouter.get(
  "/contracts/freelancer/:freelancerId",
  isAuthenticated,
  contractController.getContractsByFreelancerId
);

ContractRouter.get(
  "/contracts/:id",
  isAuthenticated,
  contractController.getContractById
);

ContractRouter.get(
  "/contracts",
  isAuthenticated,
  contractController.getAllContracts
);

ContractRouter.put(
  "/contracts/:id",
  isAuthenticated,
  contractController.updateContract
);

ContractRouter.put(
  "/contracts/:id/status",
  isAuthenticated,
  contractController.updateContractStatus
);

ContractRouter.delete(
  "/contracts/:id",
  isAuthenticated,
  contractController.deleteContract
);

export { ContractRouter };

