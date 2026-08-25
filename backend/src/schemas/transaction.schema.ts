import { z } from "zod";
import { objectIdSchema, paginationQuerySchema } from "./common.schema.js";

// Discriminated union: WALLET/WEBSITE exigem id, EXTERNAL proíbe id
const walletParticipantSchema = z.object({ type: z.literal("WALLET"), id: objectIdSchema }).strip();
const websiteParticipantSchema = z
  .object({ type: z.literal("WEBSITE"), id: objectIdSchema })
  .strip();
const externalParticipantSchema = z
  .object({ type: z.literal("EXTERNAL") })
  .strip()
  .strict();

const participantSchema = z.discriminatedUnion("type", [
  walletParticipantSchema,
  websiteParticipantSchema,
  externalParticipantSchema,
]);

const assetSchema = z
  .object({
    externalId: z.string().trim().min(1),
    symbol: z.string().trim().min(1).max(20),
    name: z.string().trim().min(1).max(100),
  })
  .strip();

// Matriz type ↔ source ↔ destination (Fase 9: WEBSITE habilitado)
const ALLOWED_COMBINATIONS: Record<string, { source: string[]; destination: string[] }> = {
  WALLET_DEPOSIT: { source: ["EXTERNAL"], destination: ["WALLET"] },
  WALLET_WITHDRAWAL: { source: ["WALLET"], destination: ["EXTERNAL"] },
  WALLET_TRANSFER: { source: ["WALLET"], destination: ["WALLET"] },
  WALLET_ADJUSTMENT: { source: ["EXTERNAL", "WALLET"], destination: ["WALLET", "EXTERNAL"] },
  // WEBSITE_* reservado Fase 8, mas schema permite para não quebrar validação futura
  WEBSITE_EARNING: { source: ["EXTERNAL"], destination: ["WEBSITE"] },
  WEBSITE_WITHDRAWAL: { source: ["WEBSITE"], destination: ["WALLET"] },
};

export const createTransactionSchema = z
  .object({
    type: z.enum([
      "WALLET_DEPOSIT",
      "WALLET_WITHDRAWAL",
      "WALLET_TRANSFER",
      "WALLET_ADJUSTMENT",
      "WEBSITE_EARNING",
      "WEBSITE_WITHDRAWAL",
    ]),
    source: participantSchema,
    destination: participantSchema,
    asset: assetSchema,
    quantity: z.number().positive("Quantity must be greater than zero"),
    usdValue: z.number().min(0, "usdValue must be >= 0"),
    countsTowardGoal: z.boolean().optional().default(false),
    date: z.coerce.date(),
    description: z.string().trim().max(500).optional(),
  })
  .strip()
  .superRefine((data, ctx) => {
    const combo = ALLOWED_COMBINATIONS[data.type];
    if (!combo) return;
    if (!combo.source.includes(data.source.type)) {
      ctx.addIssue({
        code: "custom",
        path: ["source", "type"],
        message: `Source type ${data.source.type} not allowed for ${data.type}`,
      });
    }
    if (!combo.destination.includes(data.destination.type)) {
      ctx.addIssue({
        code: "custom",
        path: ["destination", "type"],
        message: `Destination type ${data.destination.type} not allowed for ${data.type}`,
      });
    }

    // WALLET_TRANSFER: ids diferentes
    if (data.type === "WALLET_TRANSFER") {
      const sId = (data.source as { id?: string }).id;
      const dId = (data.destination as { id?: string }).id;
      if (sId && dId && sId === dId) {
        ctx.addIssue({
          code: "custom",
          path: ["destination", "id"],
          message: "Source and destination wallet must be different",
        });
      }
    }

    // WALLET_ADJUSTMENT: EXTERNAL → WALLET ou WALLET → EXTERNAL, não ambos WALLET nem ambos EXTERNAL
    if (data.type === "WALLET_ADJUSTMENT") {
      const s = data.source.type;
      const d = data.destination.type;
      const valid = (s === "EXTERNAL" && d === "WALLET") || (s === "WALLET" && d === "EXTERNAL");
      if (!valid) {
        ctx.addIssue({
          code: "custom",
          path: ["destination", "type"],
          message: "WALLET_ADJUSTMENT must be EXTERNAL ↔ WALLET",
        });
      }
    }
  });

export type CreateTransactionBody = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = z
  .object({
    quantity: z.number().positive().optional(),
    usdValue: z.number().min(0).optional(),
    date: z.coerce.date().optional(),
    description: z.string().trim().max(500).optional(),
    countsTowardGoal: z.boolean().optional(),
  })
  .strip()
  .refine(d => Object.keys(d).length > 0, { message: "At least one field must be provided" });

export type UpdateTransactionBody = z.infer<typeof updateTransactionSchema>;

export const transactionIdParamsSchema = z.object({ transactionId: objectIdSchema }).strip();
export type TransactionIdParams = z.infer<typeof transactionIdParamsSchema>;

export const listTransactionsQuerySchema = paginationQuerySchema
  .extend({
    type: z
      .enum([
        "WALLET_DEPOSIT",
        "WALLET_WITHDRAWAL",
        "WALLET_TRANSFER",
        "WALLET_ADJUSTMENT",
        "WEBSITE_EARNING",
        "WEBSITE_WITHDRAWAL",
      ])
      .optional(),
    walletId: objectIdSchema.optional(),
    websiteId: objectIdSchema.optional(),
    asset: z.string().trim().min(1).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    countsTowardGoal: z.coerce.boolean().optional(),
  })
  .strip()
  .superRefine((data, ctx) => {
    if (data.from && data.to && data.from > data.to) {
      ctx.addIssue({ code: "custom", path: ["from"], message: "from must be <= to" });
    }
  });

export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
