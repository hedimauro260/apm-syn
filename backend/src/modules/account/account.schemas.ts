import { z } from "zod";

export const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE_MY_DATA"),
});

export type DeleteAccountBody = z.infer<typeof deleteAccountSchema>;