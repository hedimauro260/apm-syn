import { z } from "zod";
import { objectIdSchema, paginationQuerySchema } from "./common.schema.js";

const httpUrlSchema = z
  .string()
  .trim()
  .refine(val => val === "" || /^https?:\/\/.+/i.test(val), {
    message: "URL must be http or https",
  })
  .transform(val => (val === "" ? undefined : val));

export const createWebsiteSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(80),
    url: httpUrlSchema.optional(),
    description: z.string().trim().max(500).optional(),
  })
  .strip();

export type CreateWebsiteBody = z.infer<typeof createWebsiteSchema>;

export const updateWebsiteSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    url: httpUrlSchema.optional(),
    description: z.string().trim().max(500).optional(),
  })
  .strip()
  .refine(data => Object.keys(data).length > 0, { message: "At least one field must be provided" });

export type UpdateWebsiteBody = z.infer<typeof updateWebsiteSchema>;

export const websiteIdParamsSchema = z.object({ websiteId: objectIdSchema }).strip();
export type WebsiteIdParams = z.infer<typeof websiteIdParamsSchema>;

export const listWebsitesQuerySchema = paginationQuerySchema
  .extend({
    status: z.enum(["active", "archived"]).optional(),
  })
  .strip();

export type ListWebsitesQuery = z.infer<typeof listWebsitesQuerySchema>;
