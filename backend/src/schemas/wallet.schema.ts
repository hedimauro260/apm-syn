import { z } from "zod";
import { objectIdSchema, paginationQuerySchema } from "./common.schema.js";

export const createWalletSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(80),
    type: z.enum(["exchange", "personal", "hardware", "other"]),
    color: z.string().trim().max(20).optional(),
    description: z.string().trim().max(500).optional(),
  })
  .strip();

export type CreateWalletBody = z.infer<typeof createWalletSchema>;

export const updateWalletSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    type: z.enum(["exchange", "personal", "hardware", "other"]).optional(),
    color: z.string().trim().max(20).optional(),
    description: z.string().trim().max(500).optional(),
  })
  .strip()
  .refine(data => Object.keys(data).length > 0, { message: "At least one field must be provided" });

export type UpdateWalletBody = z.infer<typeof updateWalletSchema>;

export const walletIdParamsSchema = z.object({ walletId: objectIdSchema }).strip();
export type WalletIdParams = z.infer<typeof walletIdParamsSchema>;

export const listWalletsQuerySchema = paginationQuerySchema
  .extend({
    status: z.enum(["active", "inactive", "archived"]).optional(),
    type: z.enum(["exchange", "personal", "hardware", "other"]).optional(),
  })
  .strip();

export type ListWalletsQuery = z.infer<typeof listWalletsQuerySchema>;
