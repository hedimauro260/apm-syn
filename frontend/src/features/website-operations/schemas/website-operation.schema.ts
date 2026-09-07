import { z } from "zod";

/**
 * Schemas Zod das operações financeiras sobre Websites (frontend).
 *
 * Validam formulários antes do envio à API. O backend continua sendo a
 * autoridade — estas validações melhoram a UX, não substituem regras de negócio.
 *
 * Regras de segurança (ownership, saldo, website/wallet ativo) permanecem no backend.
 */

const assetSchema = z
  .object({
    externalId: z.string().trim().min(1, "Asset is required"),
    symbol: z.string().trim().min(1).max(20),
    name: z.string().trim().min(1).max(100),
  })
  .strip();

export const recordEarningSchema = z
  .object({
    asset: assetSchema,
    quantity: z.number().positive("Quantity must be greater than zero"),
    usdValue: z.number().min(0, "USD value cannot be negative"),
    date: z.coerce
      .date()
      .optional()
      .default(() => new Date()),
    description: z.string().trim().max(500).optional(),
  })
  .strip();

export type RecordEarningFormData = z.infer<typeof recordEarningSchema>;

export const withdrawFromWebsiteSchema = z
  .object({
    walletId: z.string().min(1, "Destination wallet is required"),
    asset: assetSchema,
    quantity: z.number().positive("Quantity must be greater than zero"),
    usdValue: z.number().min(0, "USD value cannot be negative"),
    date: z.coerce
      .date()
      .optional()
      .default(() => new Date()),
    countsTowardGoal: z.boolean().optional().default(false),
    description: z.string().trim().max(500).optional(),
  })
  .strip();

export type WithdrawFromWebsiteFormData = z.infer<typeof withdrawFromWebsiteSchema>;
