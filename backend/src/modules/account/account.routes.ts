import { Router } from "express";
import { authenticateAndSync } from "../../middlewares/auth.middleware.js";
import { destructiveLimiter } from "../../middlewares/rate-limit.js";
import { validate } from "../../middlewares/validate.js";
import { deleteAccountSchema } from "./account.schemas.js";
import * as accountController from "./account.controller.js";

const router = Router();

router.get("/me/backup", authenticateAndSync, destructiveLimiter, accountController.exportBackup);
router.delete(
  "/me",
  authenticateAndSync,
  destructiveLimiter,
  validate({ body: deleteAccountSchema }),
  accountController.deleteAccountData
);

export default router;