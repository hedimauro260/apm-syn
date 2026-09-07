import { z } from "zod";

/**
 * Schemas Zod do domínio Website (frontend).
 *
 * O backend continua sendo a autoridade. Estes schemas validam apenas o
 * que melhora a experiência do usuário (campos obrigatórios, limites
 * básicos, enums de domínio) antes de enviar a requisição à API.
 *
 * Regras de segurança e negócio permanecem no backend.
 */

export const websiteStatusSchema = z.enum(["active", "archived"]);

export const createWebsiteSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(80),
    url: z
      .string()
      .trim()
      .refine((val) => val === "" || /^https?:\/\/.+/i.test(val), {
        message: "URL must be http or https",
      })
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
    description: z.string().trim().max(500).optional(),
  })
  .strip();

export type CreateWebsiteFormData = z.infer<typeof createWebsiteSchema>;

export const updateWebsiteSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(80).optional(),
    url: z
      .string()
      .trim()
      .refine((val) => val === "" || /^https?:\/\/.+/i.test(val), {
        message: "URL must be http or https",
      })
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
    description: z.string().trim().max(500).optional(),
  })
  .strip()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateWebsiteFormData = z.infer<typeof updateWebsiteSchema>;

export const websiteListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.string().optional(),
    status: websiteStatusSchema.optional(),
  })
  .strip();

export type WebsiteListQuery = z.infer<typeof websiteListQuerySchema>;
