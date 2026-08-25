import mongoose from "mongoose";
import { GoalModel } from "../../src/models/goal.model.js";
import type { IGoal, GoalStatus, GoalDistributionType } from "../../src/models/goal.model.js";

let counter = 0;

export async function createTestGoal(
  userId: mongoose.Types.ObjectId,
  walletIds: mongoose.Types.ObjectId[],
  overrides: Partial<{
    name: string;
    status: GoalStatus;
    startDate: Date;
    endDate: Date;
    distributionType: GoalDistributionType;
    totalWeeklyGoal: number;
    wallets: Array<{ walletId: mongoose.Types.ObjectId; weeklyGoal: number; days: Array<{ date: Date; goal: number }> }>;
  }> = {}
): Promise<IGoal> {
  counter++;
  const now = new Date();
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const defaults = {
    userId,
    name: overrides.name || `Goal ${counter}`,
    status: overrides.status || ("active" as GoalStatus),
    startDate: overrides.startDate || now,
    endDate: overrides.endDate || oneWeekLater,
    distributionType: overrides.distributionType || ("same" as GoalDistributionType),
    totalWeeklyGoal: overrides.totalWeeklyGoal || 100,
    wallets: overrides.wallets || walletIds.map((walletId) => ({
      walletId,
      weeklyGoal: 100 / walletIds.length,
      days: [],
    })),
  };

  const goal = new GoalModel(defaults);
  await goal.save();
  return goal;
}
