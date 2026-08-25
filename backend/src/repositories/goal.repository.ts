import { GoalModel, type IGoal } from "../models/goal.model.js";
import { paginate, type PaginatedResult } from "../shared/utils/pagination.js";
import type { FilterQuery } from "mongoose";

export async function create(
  data: {
    userId: string;
    name: string;
    startDate: Date;
    endDate: Date;
    distributionType: IGoal["distributionType"];
    totalWeeklyGoal: number;
    wallets: IGoal["wallets"];
  }
): Promise<IGoal> {
  const goal = new GoalModel(data);
  return goal.save();
}

export async function findById(id: string): Promise<IGoal | null> {
  return GoalModel.findById(id).exec();
}

export async function findAllPaginated(
  filter: FilterQuery<IGoal>,
  options: { page: number; limit: number; sort: Record<string, 1 | -1> }
): Promise<PaginatedResult<IGoal>> {
  return paginate<IGoal>(GoalModel as never, filter as never, options);
}

export async function archiveById(
  id: string,
  snapshot: IGoal["snapshot"]
): Promise<IGoal | null> {
  return GoalModel.findByIdAndUpdate(
    id,
    {
      $set: {
        status: "archived",
        archivedAt: new Date(),
        snapshot,
      },
    },
    { new: true }
  ).exec();
}
