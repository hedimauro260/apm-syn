import { z } from "zod";

/**
 * Schemas Zod do domínio Wallet (frontend).
 *
 * O backend continua sendo a autoridade. Estes schemas validam apenas o
 * que melhora a experiência do usuário (campos obrigatórios, limites
 * básicos, enums de dominio) antes de enviar a requisição à API.
 *
 * Regras de segurança e negócio permanecem no backend.
 */

export const walletTypeSchema = z.enum([
  "exchange",
  "crypto",
  "microwallet",
  "hardware",
  "banking",
  "other",
]);

export const walletStatusSchema = z.enum(["active", "inactive", "archived"]);

export const createWalletSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(80),
    type: walletTypeSchema,
    color: z.string().trim().max(20).optional(),
    description: z.string().trim().max(500).optional(),
  })
  .strip();

export type CreateWalletFormData = z.infer<typeof createWalletSchema>;

export const updateWalletSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(80).optional(),
    type: walletTypeSchema.optional(),
    color: z.string().trim().max(20).optional(),
    description: z.string().trim().max(500).optional(),
  })
  .strip()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateWalletFormData = z.infer<typeof updateWalletSchema>;

export const walletListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.string().optional(),
    status: walletStatusSchema.optional(),
    type: walletTypeSchema.optional(),
  })
  .strip();

export type WalletListQuery = z.infer<typeof walletListQuerySchema>;
