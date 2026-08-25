import { z } from "zod";
import { objectIdSchema } from "../shared/schemas/common.schemas.js";

export const createGoalSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    distributionType: z.enum(["same", "custom"]).default("same"),
    totalWeeklyGoal: z.coerce.number().positive(),
    wallets: z
      .array(
        z.object({
          walletId: objectIdSchema,
          weeklyGoal: z.coerce.number().nonnegative(),
          days: z
            .array(
              z.object({
                date: z.coerce.date(),
                goal: z.coerce.number().nonnegative(),
              })
            )
            .min(1),
        })
      )
      .min(1),
  })
  .superRefine((data, ctx) => {
    if (data.startDate >= data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startDate must be before endDate",
        path: ["endDate"],
      });
    }

    if (data.totalWeeklyGoal <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "totalWeeklyGoal must be positive",
        path: ["totalWeeklyGoal"],
      });
    }

    for (const wallet of data.wallets) {
      if (wallet.days.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one day is required per wallet",
          path: ["wallets", data.wallets.indexOf(wallet), "days"],
        });
      }
    }
  })
  .strip();

export type CreateGoalBody = z.infer<typeof createGoalSchema>;

export const goalQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z
      .enum(["startDate", "-startDate", "createdAt", "-createdAt", "updatedAt", "-updatedAt"])
      .default("-startDate"),
    status: z.enum(["active", "archived"]).optional(),
  })
  .strip();

export type GoalQuery = z.infer<typeof goalQuerySchema>;

export const goalIdParamSchema = z
  .object({
    goalId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id"),
  })
  .strip();

export type GoalIdParam = z.infer<typeof goalIdParamSchema>;
