import { Router } from "express";
import SkillController from "../controller/SkillController.js";
import isAuthenticated from "../middlewares/jwt.js";

const SkillRouter = Router();

const skillController = SkillController;

SkillRouter.post(
  "/skills",
  isAuthenticated,
  skillController.createSkill
);

SkillRouter.get(
  "/skills/dropdown",
  isAuthenticated,
  skillController.getAllSkillsForDropDown
);

SkillRouter.get(
  "/skills/:id",
  isAuthenticated,
  skillController.getSkillById
);

SkillRouter.get(
  "/skills",
  isAuthenticated,
  skillController.getAllSkills
);

SkillRouter.put(
  "/skills/:id",
  isAuthenticated,
  skillController.updateSkill
);

SkillRouter.delete(
  "/skills/:id",
  isAuthenticated,
  skillController.deleteSkill
);

export { SkillRouter };

