import type { NextFunction, Request, Response } from "express";
import { getMongoConnection, isConnected } from "../config/database.js";

const DB_FREE_PATHS = new Set(["/health", "/ready"]);

export async function connectDatabaseMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (DB_FREE_PATHS.has(req.path)) {
    next();
    return;
  }

  try {
    if (!isConnected()) {
      await getMongoConnection();
    }
    next();
  } catch (err) {
    next(err);
  }
}