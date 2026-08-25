import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";
import * as goalService from "../services/goal.service.js";

export async function createGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const result = await goalService.createGoal(userId, req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function listGoals(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const result = await goalService.listGoals(userId, req.query as never);
    res.status(200).json({ data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const goalId = req.params.goalId;
    if (!goalId) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid goal id");
    }

    const result = await goalService.getGoal(userId, goalId);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function getGoalProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const goalId = req.params.goalId;
    if (!goalId) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid goal id");
    }

    const result = await goalService.getGoalProgress(userId, goalId);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function archiveGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const goalId = req.params.goalId;
    if (!goalId) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid goal id");
    }

    const result = await goalService.archiveGoal(userId, goalId);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}
