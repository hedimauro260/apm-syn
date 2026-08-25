import { Router, type Request, type Response } from "express";
import { getConnectionStatus } from "../config/database.js";

const router = Router();

function livenessHandler(_req: Request, res: Response): void {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

function readinessHandler(_req: Request, res: Response): void {
  const dbStatus = getConnectionStatus();
  const isReady = dbStatus === "connected";

  res.status(isReady ? 200 : 503).json({
    status: isReady ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    checks: {
      database: dbStatus,
    },
  });
}

router.get("/health", livenessHandler);
router.get("/ready", readinessHandler);

export default router;
