import { Router } from "express";
import { authenticateAndSync } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { updateMeSchema } from "../schemas/user.schema.js";
import * as userController from "../controllers/user.controller.js";

const router = Router();

// Todas as rotas de usuário são protegidas (decisão Fase 2)
router.post("/sync", authenticateAndSync, userController.syncUser);
router.get("/me", authenticateAndSync, userController.getMe);
router.patch(
  "/me",
  authenticateAndSync,
  validate({ body: updateMeSchema }),
  userController.patchMe
);
router.delete("/me", authenticateAndSync, userController.deleteMe);

export default router;
