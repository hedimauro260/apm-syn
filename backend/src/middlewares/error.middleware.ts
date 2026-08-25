import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../utils/app-error.js";
import { logger } from "../config/logger.js";

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId;

  if (err instanceof z.ZodError) {
    const details = err.issues.map(issue => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    res.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details,
        requestId,
      },
    });
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, code: err.code, statusCode: err.statusCode, requestId }, err.message);
    } else {
      logger.warn({ err, code: err.code, statusCode: err.statusCode, requestId }, err.message);
    }

    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? null,
        requestId,
      },
    });
    return;
  }

  logger.error({ err, requestId }, err.message || "Internal server error");

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      details: null,
      requestId,
    },
  });
}
