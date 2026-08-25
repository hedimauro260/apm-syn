import express from "express";
import type { Request, Response, NextFunction } from "express";

export function createTestApp(): express.Express {
  const app = express();
  app.use(express.json());
  return app;
}

export function mockAuthMiddleware(userId: string, clerkId: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.user = { id: userId, clerkId };
    next();
  };
}

export function mockNoAuthMiddleware() {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    next();
  };
}
