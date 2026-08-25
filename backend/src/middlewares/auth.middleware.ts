import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/backend";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../utils/app-error.js";
import * as userService from "../services/user.service.js";

export async function authenticateAndSync(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    // Fase 2: verificação via JWKS (jwtKey) usando verifyToken do @clerk/backend
    // verifyToken valida assinatura via JWKS remoto e expiração
    let verified;
    try {
      verified = await verifyToken(token, {
        secretKey: env.CLERK_SECRET_KEY,
      });
    } catch (err) {
      logger.warn({ err }, "Clerk token verification failed");
      throw new AppError(401, "UNAUTHORIZED", "Invalid or expired token");
    }

    const clerkId = (verified as { sub?: string }).sub;

    if (!clerkId) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid token payload");
    }

    // Lazy sync: cria User interno se não existir (idempotente)
    const user = await userService.syncUser(clerkId);

    req.user = {
      id: String(user._id),
      clerkId: user.clerkId,
    };

    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    logger.error({ err }, "Unexpected error in auth middleware");
    next(new AppError(401, "UNAUTHORIZED", "Authentication failed"));
  }
}
