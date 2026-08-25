import { Router } from "express";
import { authenticateAndSync } from "../../middlewares/auth.middleware.js";
import * as portfolioController from "./portfolio.controller.js";

const router = Router();

router.use(authenticateAndSync);

router.get("/", portfolioController.getPortfolio);

export default router;
