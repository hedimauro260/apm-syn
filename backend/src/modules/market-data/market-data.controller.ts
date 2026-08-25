import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../../utils/app-error.js";
import * as marketDataService from "./market-data.service.js";
import type {
  searchAssetsQuerySchema,
  externalIdParamsSchema,
  convertQuerySchema,
} from "./market-data.schemas.js";

type SearchAssetsQuery = z.infer<typeof searchAssetsQuerySchema>;
type ExternalIdParams = z.infer<typeof externalIdParamsSchema>;
type ConvertQuery = z.infer<typeof convertQuerySchema>;

export async function searchAssets(
  req: Request<unknown, unknown, unknown, SearchAssetsQuery>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query.q;
    if (!query || typeof query !== "string") {
      throw new AppError(400, "BAD_REQUEST", "Query parameter 'q' is required");
    }

    const result = await marketDataService.searchAssets(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getAsset(
  req: Request<ExternalIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { externalId } = req.params;
    const result = await marketDataService.getAsset(externalId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getPrice(
  req: Request<ExternalIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { externalId } = req.params;
    const result = await marketDataService.getPrice(externalId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function convert(
  req: Request<unknown, unknown, unknown, ConvertQuery>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { assetId, quantity } = req.query;

    if (!assetId || typeof assetId !== "string") {
      throw new AppError(400, "BAD_REQUEST", "Query parameter 'assetId' is required");
    }

    const qty = typeof quantity === "string" ? parseFloat(quantity) : quantity;
    if (typeof qty !== "number" || qty <= 0) {
      throw new AppError(400, "BAD_REQUEST", "Query parameter 'quantity' must be a positive number");
    }

    const result = await marketDataService.convertToUsd(assetId, qty);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
