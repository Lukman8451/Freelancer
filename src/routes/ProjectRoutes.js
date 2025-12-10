import { Router } from "express";
import ProjectController from "../controller/ProjectController.js";
import isAuthenticated from "../middlewares/jwt.js";

const ProjectRouter = Router();

const projectController = ProjectController;

ProjectRouter.post(
  "/projects",
  isAuthenticated,
  projectController.createProject
);

ProjectRouter.get(
  "/projects/dropdown",
  isAuthenticated,
  projectController.getAllProjectsForDropDown
);

ProjectRouter.get(
  "/projects/client/:clientId",
  isAuthenticated,
  projectController.getProjectsByClientId
);

ProjectRouter.get(
  "/projects/status/:status",
  isAuthenticated,
  projectController.getProjectsByStatus
);

ProjectRouter.get(
  "/projects/:id",
  isAuthenticated,
  projectController.getProjectById
);

ProjectRouter.get(
  "/projects",
  isAuthenticated,
  projectController.getAllProjects
);

ProjectRouter.put(
  "/projects/:id",
  isAuthenticated,
  projectController.updateProject
);

ProjectRouter.put(
  "/projects/:id/status",
  isAuthenticated,
  projectController.updateProjectStatus
);

ProjectRouter.delete(
  "/projects/:id",
  isAuthenticated,
  projectController.deleteProject
);

export { ProjectRouter };

