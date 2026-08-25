import { z } from "zod";
import { objectIdSchema } from "./common.schema.js";

const assetSchema = z
  .object({
    externalId: z.string().trim().min(1),
    symbol: z.string().trim().min(1).max(20),
    name: z.string().trim().min(1).max(100),
  })
  .strip();

export const earningSchema = z
  .object({
    asset: assetSchema,
    quantity: z.number().positive("Quantity must be greater than zero"),
    usdValue: z.number().min(0),
    date: z.coerce
      .date()
      .optional()
      .default(() => new Date()),
    description: z.string().trim().max(500).optional(),
  })
  .strip();

export type EarningBody = z.infer<typeof earningSchema>;

export const withdrawalSchema = z
  .object({
    walletId: objectIdSchema,
    asset: assetSchema,
    quantity: z.number().positive("Quantity must be greater than zero"),
    usdValue: z.number().min(0),
    date: z.coerce
      .date()
      .optional()
      .default(() => new Date()),
    countsTowardGoal: z.boolean().optional().default(false),
    description: z.string().trim().max(500).optional(),
  })
  .strip();

export type WithdrawalBody = z.infer<typeof withdrawalSchema>;

export const websiteIdParamsSchema = z.object({ websiteId: objectIdSchema }).strip();
export type WebsiteIdParams = z.infer<typeof websiteIdParamsSchema>;
