import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/app-error.js";
import * as accountService from "./account.service.js";

export async function exportBackup(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const backup = await accountService.exportBackup(userId);
    res.status(200).json({ data: backup });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccountData(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    await accountService.deleteAccountData(userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}