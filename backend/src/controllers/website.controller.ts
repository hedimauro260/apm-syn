import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";
import * as websiteService from "../services/website.service.js";
import type {
  CreateWebsiteBody,
  UpdateWebsiteBody,
  ListWebsitesQuery,
  WebsiteIdParams,
} from "../schemas/website.schema.js";

export async function createWebsite(
  req: Request<unknown, unknown, CreateWebsiteBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await websiteService.createWebsite(userId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function listWebsites(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const result = await websiteService.listWebsites(
      userId,
      req.query as unknown as ListWebsitesQuery
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getWebsite(
  req: Request<WebsiteIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await websiteService.getWebsite(userId, req.params.websiteId);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function updateWebsite(
  req: Request<WebsiteIdParams, unknown, UpdateWebsiteBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await websiteService.updateWebsite(userId, req.params.websiteId, req.body);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function archiveWebsite(
  req: Request<WebsiteIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const data = await websiteService.archiveWebsite(userId, req.params.websiteId);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function deleteWebsite(
  req: Request<WebsiteIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    await websiteService.deleteWebsite(userId, req.params.websiteId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
