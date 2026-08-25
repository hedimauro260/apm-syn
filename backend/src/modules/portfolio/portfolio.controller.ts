import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/app-error.js";
import * as portfolioService from "./portfolio.service.js";

export async function getPortfolio(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const result = await portfolioService.getPortfolio(userId);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}
