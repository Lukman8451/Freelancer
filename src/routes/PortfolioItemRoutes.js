import { Router } from "express";
import PortfolioItemController from "../controller/PortfolioItemController.js";
import isAuthenticated from "../middlewares/jwt.js";

const PortfolioItemRouter = Router();

const portfolioItemController = PortfolioItemController;

PortfolioItemRouter.post(
  "/portfolio",
  isAuthenticated,
  portfolioItemController.createPortfolioItem
);

PortfolioItemRouter.post(
  "/portfolio/bulk",
  isAuthenticated,
  portfolioItemController.bulkCreatePortfolioItems
);

PortfolioItemRouter.get(
  "/portfolio/profile/:profileId",
  isAuthenticated,
  portfolioItemController.getPortfolioItemsByProfileId
);

PortfolioItemRouter.get(
  "/portfolio/:id",
  isAuthenticated,
  portfolioItemController.getPortfolioItemById
);

PortfolioItemRouter.get(
  "/portfolio",
  isAuthenticated,
  portfolioItemController.getAllPortfolioItems
);

PortfolioItemRouter.put(
  "/portfolio/:id",
  isAuthenticated,
  portfolioItemController.updatePortfolioItem
);

PortfolioItemRouter.delete(
  "/portfolio/:id",
  isAuthenticated,
  portfolioItemController.deletePortfolioItem
);

export { PortfolioItemRouter };

