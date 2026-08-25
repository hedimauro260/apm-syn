import { Router } from "express";
import { authenticateAndSync } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { transferSchema } from "../schemas/wallet-operations.schema.js";
import * as walletOpsController from "../controllers/wallet-operations.controller.js";

const router = Router();

router.post(
  "/",
  authenticateAndSync,
  validate({ body: transferSchema }),
  walletOpsController.transferBetweenWallets
);

export default router;
