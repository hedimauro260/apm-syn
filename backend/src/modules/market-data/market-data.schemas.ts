import { z } from "zod";

export const searchAssetsQuerySchema = z.object({
  q: z.string().min(1, "Query parameter 'q' is required"),
});

export const convertQuerySchema = z.object({
  assetId: z.string().min(1, "Query parameter 'assetId' is required"),
  quantity: z.coerce.number().positive("Query parameter 'quantity' must be positive"),
});

export const externalIdParamsSchema = z.object({
  externalId: z.string().min(1, "External ID is required"),
});

export const assetIdParamsSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required"),
});