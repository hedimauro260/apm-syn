import { z } from "zod";
import { objectIdSchema } from "./common.schema.js";

const assetSchema = z
  .object({
    externalId: z.string().trim().min(1),
    symbol: z.string().trim().min(1).max(20),
    name: z.string().trim().min(1).max(100),
  })
  .strip();

export const depositSchema = z
  .object({
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

export type DepositBody = z.infer<typeof depositSchema>;

export const withdrawSchema = z
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

export type WithdrawBody = z.infer<typeof withdrawSchema>;

export const adjustSchema = z
  .object({
    asset: assetSchema,
    quantity: z.number().positive("Quantity must be greater than zero"),
    usdValue: z.number().min(0),
    direction: z.enum(["increase", "decrease"]),
    date: z.coerce
      .date()
      .optional()
      .default(() => new Date()),
    countsTowardGoal: z.boolean().optional().default(false),
    description: z.string().trim().max(500).optional(),
  })
  .strip();

export type AdjustBody = z.infer<typeof adjustSchema>;

export const transferSchema = z
  .object({
    sourceWalletId: objectIdSchema,
    destinationWalletId: objectIdSchema,
    asset: assetSchema,
    quantity: z.number().positive("Quantity must be greater than zero"),
    usdValue: z.number().min(0),
    date: z.coerce
      .date()
      .optional()
      .default(() => new Date()),
    description: z.string().trim().max(500).optional(),
  })
  .strip()
  .refine(data => data.sourceWalletId !== data.destinationWalletId, {
    message: "Source and destination wallet must be different",
    path: ["destinationWalletId"],
  });

export type TransferBody = z.infer<typeof transferSchema>;

export const walletIdParamsSchema = z.object({ walletId: objectIdSchema }).strip();
export type WalletIdParams = z.infer<typeof walletIdParamsSchema>;
