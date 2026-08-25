import { Router } from "express";
import { authenticateAndSync } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createWalletSchema,
  updateWalletSchema,
  walletIdParamsSchema,
  listWalletsQuerySchema,
} from "../schemas/wallet.schema.js";
import {
  depositSchema,
  withdrawSchema,
  adjustSchema,
  walletIdParamsSchema as walletOpsIdParamsSchema,
} from "../schemas/wallet-operations.schema.js";
import * as walletController from "../controllers/wallet.controller.js";
import * as walletOpsController from "../controllers/wallet-operations.controller.js";

const router = Router();

// Todas protegidas
router.post(
  "/",
  authenticateAndSync,
  validate({ body: createWalletSchema }),
  walletController.createWallet
);
router.get(
  "/",
  authenticateAndSync,
  validate({ query: listWalletsQuerySchema }),
  walletController.listWallets
);
router.get(
  "/:walletId",
  authenticateAndSync,
  validate({ params: walletIdParamsSchema }),
  walletController.getWallet
);
router.patch(
  "/:walletId",
  authenticateAndSync,
  validate({ params: walletIdParamsSchema, body: updateWalletSchema }),
  walletController.updateWallet
);
router.post(
  "/:walletId/deactivate",
  authenticateAndSync,
  validate({ params: walletIdParamsSchema }),
  walletController.deactivateWallet
);
router.post(
  "/:walletId/activate",
  authenticateAndSync,
  validate({ params: walletIdParamsSchema }),
  walletController.activateWallet
);
router.post(
  "/:walletId/archive",
  authenticateAndSync,
  validate({ params: walletIdParamsSchema }),
  walletController.archiveWallet
);
router.post(
  "/:walletId/deposits",
  authenticateAndSync,
  validate({ params: walletOpsIdParamsSchema, body: depositSchema }),
  walletOpsController.depositToWallet
);
router.post(
  "/:walletId/withdrawals",
  authenticateAndSync,
  validate({ params: walletOpsIdParamsSchema, body: withdrawSchema }),
  walletOpsController.withdrawFromWallet
);
router.post(
  "/:walletId/adjustments",
  authenticateAndSync,
  validate({ params: walletOpsIdParamsSchema, body: adjustSchema }),
  walletOpsController.adjustWallet
);
router.delete(
  "/:walletId",
  authenticateAndSync,
  validate({ params: walletIdParamsSchema }),
  walletController.deleteWallet
);

export default router;
