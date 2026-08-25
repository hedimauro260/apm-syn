import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";
import * as userService from "../services/user.service.js";
import type { UpdateMeBody } from "../schemas/user.schema.js";

export async function syncUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const user = await userService.syncUser(clerkId);
    res.status(200).json({ data: userService.toUserResponse(user) });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const user = await userService.getMe(clerkId);
    res.status(200).json({ data: userService.toUserResponse(user) });
  } catch (err) {
    next(err);
  }
}

export async function patchMe(
  req: Request<unknown, unknown, UpdateMeBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const { name } = req.body;
    const user = await userService.updateMe(clerkId, { name });
    res.status(200).json({ data: userService.toUserResponse(user) });
  } catch (err) {
    next(err);
  }
}

export async function deleteMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const clerkId = req.user?.clerkId;
    if (!clerkId) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    await userService.deleteMe(clerkId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
