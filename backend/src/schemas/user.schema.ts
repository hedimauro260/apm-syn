import { z } from "zod";

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100).optional(),
    onboarding: z
      .object({
        completed: z.boolean().optional(),
        skipped: z.boolean().optional(),
      })
      .strict()
      .optional(),
  })
  .strip();

export type UpdateMeBody = z.infer<typeof updateMeSchema>;

// Exemplo de schema de params (para Fase 3 — demonstra infraestrutura)
import { objectIdSchema } from "./common.schema.js";

export const userIdParamsSchema = z
  .object({
    userId: objectIdSchema,
  })
  .strip();

// Exemplo de query com paginação (Fase 3 — somente paginação, resto fica para fases de domínio)
import { paginationQuerySchema } from "./common.schema.js";

export const listUsersQuerySchema = paginationQuerySchema;

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
