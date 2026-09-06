import { z } from "zod";

/**
 * Schemas Zod das operações financeiras (frontend).
 *
 * Validam formulários antes do envio à API. O backend continua sendo a
 * autoridade — estas validações melhoram a UX, não substituem regras de negócio.
 *
 * Regras de segurança (ownership, saldo, wallet ativa) permanecem no backend.
 */

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid wallet ID");

const assetSchema = z
  .object({
    externalId: z.string().trim().min(1, "Asset is required"),
    symbol: z.string().trim().min(1).max(20),
    name: z.string().trim().min(1).max(100),
  })
  .strip();

export const depositSchema = z
  .object({
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

export type DepositFormData = z.infer<typeof depositSchema>;

export const withdrawSchema = z
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

export type WithdrawFormData = z.infer<typeof withdrawSchema>;

export const adjustSchema = z
  .object({
    asset: assetSchema,
    quantity: z.number().positive("Quantity must be greater than zero"),
    usdValue: z.number().min(0, "USD value cannot be negative"),
    direction: z.enum(["increase", "decrease"]),
    date: z.coerce
      .date()
      .optional()
      .default(() => new Date()),
    countsTowardGoal: z.boolean().optional().default(false),
    description: z.string().trim().max(500).optional(),
  })
  .strip();

export type AdjustFormData = z.infer<typeof adjustSchema>;

export const transferSchema = z
  .object({
    sourceWalletId: objectIdSchema,
    destinationWalletId: objectIdSchema,
    asset: assetSchema,
    quantity: z.number().positive("Quantity must be greater than zero"),
    usdValue: z.number().min(0, "USD value cannot be negative"),
    date: z.coerce
      .date()
      .optional()
      .default(() => new Date()),
    description: z.string().trim().max(500).optional(),
  })
  .strip()
  .refine(
    (data) => data.sourceWalletId !== data.destinationWalletId,
    {
      message: "Source and destination must be different",
      path: ["destinationWalletId"],
    },
  );

export type TransferFormData = z.infer<typeof transferSchema>;
