import { Router } from "express";
import { authenticateAndSync } from "../middlewares/auth.middleware.js";
import * as goalController from "../controllers/goal.controller.js";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.js";
import { createGoalSchema, goalQuerySchema, goalIdParamSchema } from "../schemas/goal.schema.js";

const router = Router();

router.use(authenticateAndSync);

router.post("/", validateBody(createGoalSchema), goalController.createGoal);
router.get("/", validateQuery(goalQuerySchema), goalController.listGoals);
router.get("/:goalId", validateParams(goalIdParamSchema), goalController.getGoal);
router.get("/:goalId/progress", validateParams(goalIdParamSchema), goalController.getGoalProgress);
router.post("/:goalId/archive", validateParams(goalIdParamSchema), goalController.archiveGoal);

export default router;
