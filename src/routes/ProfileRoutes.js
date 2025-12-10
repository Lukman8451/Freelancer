import { Router } from "express";
import ProfileController from "../controller/ProfileController.js";
import isAuthenticated from "../middlewares/jwt.js";

const ProfileRouter = Router();

const profileController = ProfileController;

// All profile routes require authentication
ProfileRouter.post(
  "/profiles",
  isAuthenticated,
  profileController.createProfile
);

ProfileRouter.get(
  "/profiles/dropdown",
  isAuthenticated,
  profileController.getAllProfilesForDropDown
);

ProfileRouter.get(
  "/profiles/user/:userId",
  isAuthenticated,
  profileController.getProfileByUserId
);

ProfileRouter.get(
  "/profiles/:id",
  isAuthenticated,
  profileController.getProfileById
);

ProfileRouter.get(
  "/profiles",
  isAuthenticated,
  profileController.getAllProfiles
);

ProfileRouter.put(
  "/profiles/:id",
  isAuthenticated,
  profileController.updateProfile
);

ProfileRouter.delete(
  "/profiles/:id",
  isAuthenticated,
  profileController.deleteProfile
);

ProfileRouter.post(
  "/profiles/skills/add",
  isAuthenticated,
  profileController.addSkill
);

ProfileRouter.post(
  "/profiles/skills/remove",
  isAuthenticated,
  profileController.removeSkill
);

export { ProfileRouter };

