import { Router } from "express";
import { authenticateAndSync } from "../../middlewares/auth.middleware.js";
import { marketDataLimiter } from "../../middlewares/rate-limit.js";
import * as marketDataController from "./market-data.controller.js";

const router = Router();

router.use(authenticateAndSync);
router.use(marketDataLimiter);

router.get("/assets/search", marketDataController.searchAssets);
router.get("/assets/ticker", marketDataController.getTicker);
router.get("/assets/:externalId", marketDataController.getAsset);
router.get("/prices/:externalId", marketDataController.getPrice);
router.get("/convert", marketDataController.convert);

export default router;
