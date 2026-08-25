import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";
import * as websiteOpsService from "../services/website-operations.service.js";
import type {
  EarningBody,
  WithdrawalBody,
  WebsiteIdParams,
} from "../schemas/website-operations.schema.js";

function getIdempotencyKey(req: Request): string {
  const raw = req.headers["idempotency-key"] as string | undefined;
  if (!raw || typeof raw !== "string" || raw.trim() === "") {
    throw new AppError(
      422,
      "IDEMPOTENCY_KEY_INVALID",
      "Idempotency-Key header is required and must be a valid UUID"
    );
  }
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(raw.trim())) {
    throw new AppError(422, "IDEMPOTENCY_KEY_INVALID", "Idempotency-Key must be a valid UUID");
  }
  return raw.trim();
}

export async function recordEarning(
  req: Request<WebsiteIdParams, unknown, EarningBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const idempotencyKey = getIdempotencyKey(req);
    const data = await websiteOpsService.recordEarning(
      userId,
      req.params.websiteId,
      req.body,
      idempotencyKey
    );
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function withdrawFromWebsite(
  req: Request<WebsiteIdParams, unknown, WithdrawalBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const idempotencyKey = getIdempotencyKey(req);
    const data = await websiteOpsService.withdrawFromWebsite(
      userId,
      req.params.websiteId,
      req.body,
      idempotencyKey
    );
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}
