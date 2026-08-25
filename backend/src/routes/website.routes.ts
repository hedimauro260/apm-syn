import { Router } from "express";
import { authenticateAndSync } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createWebsiteSchema,
  updateWebsiteSchema,
  websiteIdParamsSchema,
  listWebsitesQuerySchema,
} from "../schemas/website.schema.js";
import {
  earningSchema,
  withdrawalSchema,
  websiteIdParamsSchema as websiteOpsIdParamsSchema,
} from "../schemas/website-operations.schema.js";
import * as websiteController from "../controllers/website.controller.js";
import * as websiteOpsController from "../controllers/website-operations.controller.js";

const router = Router();

router.post(
  "/",
  authenticateAndSync,
  validate({ body: createWebsiteSchema }),
  websiteController.createWebsite
);
router.get(
  "/",
  authenticateAndSync,
  validate({ query: listWebsitesQuerySchema }),
  websiteController.listWebsites
);
router.get(
  "/:websiteId",
  authenticateAndSync,
  validate({ params: websiteIdParamsSchema }),
  websiteController.getWebsite
);
router.patch(
  "/:websiteId",
  authenticateAndSync,
  validate({ params: websiteIdParamsSchema, body: updateWebsiteSchema }),
  websiteController.updateWebsite
);
router.post(
  "/:websiteId/archive",
  authenticateAndSync,
  validate({ params: websiteIdParamsSchema }),
  websiteController.archiveWebsite
);
router.post(
  "/:websiteId/earnings",
  authenticateAndSync,
  validate({ params: websiteOpsIdParamsSchema, body: earningSchema }),
  websiteOpsController.recordEarning
);
router.post(
  "/:websiteId/withdrawals",
  authenticateAndSync,
  validate({ params: websiteOpsIdParamsSchema, body: withdrawalSchema }),
  websiteOpsController.withdrawFromWebsite
);
router.delete(
  "/:websiteId",
  authenticateAndSync,
  validate({ params: websiteIdParamsSchema }),
  websiteController.deleteWebsite
);

export default router;
