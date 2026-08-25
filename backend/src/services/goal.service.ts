import mongoose from "mongoose";
import { NotFoundError, ConflictError } from "../utils/errors.js";
import * as goalRepository from "../repositories/goal.repository.js";
import * as walletRepository from "../repositories/wallet.repository.js";
import * as transactionRepository from "../repositories/transaction.repository.js";
import type { IGoal } from "../models/goal.model.js";
import type { ITransaction } from "../models/transaction.model.js";
import type { CreateGoalBody, GoalQuery } from "../schemas/goal.schema.js";

export type GoalProgressStatus =
  | "not_started"
  | "getting_started"
  | "behind"
  | "on_track"
  | "excellent"
  | "completed";

const EXPECTED_PERCENTAGE_LOW = 0.3;
const EXPECTED_PERCENTAGE_HIGH = 0.8;

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function daysBetween(start: Date, end: Date): number {
  const msPerDay = 86400000;
  const utcStart = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate()
  );
  const utcEnd = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  return Math.floor((utcEnd - utcStart) / msPerDay) + 1;
}

function dateKey(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

function getDailyProgressStatus(percentage: number): string {
  if (percentage === 0) return "not_started";
  if (percentage >= 100) return "completed";
  return "behind";
}

function getOverallProgressStatus(percentage: number, expectedPercentage: number): string {
  if (percentage === 0) return "not_started";
  if (percentage >= 100) return "completed";
  if (expectedPercentage < EXPECTED_PERCENTAGE_LOW) return "getting_started";
  if (expectedPercentage < EXPECTED_PERCENTAGE_HIGH) return "behind";
  return "on_track";
}

export type GoalProgressResponse = {
  totalWeeklyGoal: number;
  totalWeeklyProgress: number;
  remaining: number;
  percentage: number;
  status: GoalProgressStatus;
  streak: number;
  bestWallet: { walletId: string; walletName: string; progress: number; percentage: number } | null;
  walletProgress: Array<{
    walletId: string;
    walletName: string;
    weeklyGoal: number;
    weeklyProgress: number;
    remaining: number;
    percentage: number;
    status: string;
  }>;
  days: Array<{
    date: string;
    goal: number;
    progress: number;
    percentage: number;
    status: string;
  }>;
  deposits: number;
  calculatedAt: string;
};

function filterEligibleTransactions(
  goal: IGoal,
  transactions: ITransaction[],
  userId: string
): ITransaction[] {
  const walletIds = new Set(goal.wallets.map((w) => String(w.walletId)));
  return transactions.filter((tx) => {
    const txUserId = String(tx.userId);
    const destId = tx.destination?.id ? String(tx.destination.id) : null;
    return (
      txUserId === userId &&
      tx.destination?.type === "WALLET" &&
      destId !== null &&
      walletIds.has(destId) &&
      tx.countsTowardGoal === true &&
      tx.date >= goal.startDate &&
      tx.date <= goal.endDate
    );
  });
}

function calculateGoalProgress(
  goal: IGoal,
  eligible: ITransaction[],
  walletMap: Map<string, string>
): GoalProgressResponse {
  const dateGoalMap = new Map<string, number>();
  for (const wallet of goal.wallets) {
    for (const day of wallet.days) {
      const key = dateKey(day.date);
      dateGoalMap.set(key, (dateGoalMap.get(key) || 0) + day.goal);
    }
  }

  const txByDateAndWallet = new Map<string, Map<string, number>>();
  for (const tx of eligible) {
    const key = dateKey(tx.date);
    const destId = tx.destination?.id ? String(tx.destination.id) : null;
    if (!destId) continue;
    if (!txByDateAndWallet.has(key)) {
      txByDateAndWallet.set(key, new Map<string, number>());
    }
    const inner = txByDateAndWallet.get(key)!;
    inner.set(destId, (inner.get(destId) || 0) + tx.usdValue);
  }

  const walletDailyProgress = new Map<string, Map<string, number>>();
  for (const wallet of goal.wallets) {
    const walletIdStr = String(wallet.walletId);
    const dailyMap = new Map<string, number>();
    for (const day of wallet.days) {
      const key = dateKey(day.date);
      const txForDate = txByDateAndWallet.get(key);
      dailyMap.set(key, txForDate ? (txForDate.get(walletIdStr) || 0) : 0);
    }
    walletDailyProgress.set(walletIdStr, dailyMap);
  }

  const sortedDates = Array.from(dateGoalMap.keys()).sort();
  const days: GoalProgressResponse["days"] = [];
  for (const key of sortedDates) {
    const totalGoal = dateGoalMap.get(key) || 0;
    const txForDate = txByDateAndWallet.get(key);
    const totalProgress = txForDate
      ? Array.from(txForDate.values()).reduce((sum, v) => sum + v, 0)
      : 0;
    const percentage = totalGoal > 0 ? roundToTwo((totalProgress / totalGoal) * 100) : 0;
    days.push({
      date: key,
      goal: totalGoal,
      progress: roundToTwo(totalProgress),
      percentage,
      status: getDailyProgressStatus(percentage),
    });
  }

  const walletProgress: GoalProgressResponse["walletProgress"] = [];
  let totalWeeklyProgress = 0;
  for (const wallet of goal.wallets) {
    const walletIdStr = String(wallet.walletId);
    const walletName = walletMap.get(walletIdStr) || "";
    const dailyMap = walletDailyProgress.get(walletIdStr);
    let weeklyProgress = 0;
    for (const day of wallet.days) {
      const key = dateKey(day.date);
      weeklyProgress += dailyMap?.get(key) || 0;
    }
    weeklyProgress = roundToTwo(weeklyProgress);
    totalWeeklyProgress += weeklyProgress;

    const remaining = Math.max(0, wallet.weeklyGoal - weeklyProgress);
    const percentage =
      wallet.weeklyGoal > 0 ? roundToTwo((weeklyProgress / wallet.weeklyGoal) * 100) : 0;
    walletProgress.push({
      walletId: walletIdStr,
      walletName,
      weeklyGoal: wallet.weeklyGoal,
      weeklyProgress,
      remaining,
      percentage,
      status: getDailyProgressStatus(percentage),
    });
  }

  totalWeeklyProgress = roundToTwo(totalWeeklyProgress);

  const remaining = Math.max(0, goal.totalWeeklyGoal - totalWeeklyProgress);
  const percentage =
    goal.totalWeeklyGoal > 0
      ? roundToTwo((totalWeeklyProgress / goal.totalWeeklyGoal) * 100)
      : 0;

  const today = new Date();
  const totalDays = daysBetween(goal.startDate, goal.endDate);
  const referenceEnd = goal.endDate < today ? goal.endDate : today;
  const elapsedDays = totalDays > 0 ? daysBetween(goal.startDate, referenceEnd) : 0;
  const expectedPercentage = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0;
  const status = getOverallProgressStatus(percentage, expectedPercentage) as GoalProgressStatus;

  let streak = 0;
  const endDate = goal.endDate < today ? goal.endDate : today;
  const current = new Date(goal.startDate);
  current.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setUTCHours(0, 0, 0, 0);
  while (current <= end) {
    const key = dateKey(current);
    const dailyGoal = dateGoalMap.get(key);
    if (dailyGoal !== undefined) {
      const txForDate = txByDateAndWallet.get(key);
      const dailyProgress = txForDate
        ? Array.from(txForDate.values()).reduce((sum, v) => sum + v, 0)
        : 0;
      if (dailyProgress >= dailyGoal) {
        streak++;
      } else {
        break;
      }
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  let bestWallet: GoalProgressResponse["bestWallet"] = null;
  let bestPercentage = -1;
  for (const wp of walletProgress) {
    if (wp.weeklyGoal > 0 && wp.percentage > bestPercentage) {
      bestPercentage = wp.percentage;
      bestWallet = {
        walletId: wp.walletId,
        walletName: wp.walletName,
        progress: wp.weeklyProgress,
        percentage: wp.percentage,
      };
    }
  }

  return {
    totalWeeklyGoal: goal.totalWeeklyGoal,
    totalWeeklyProgress,
    remaining,
    percentage,
    status,
    streak,
    bestWallet,
    walletProgress,
    days,
    deposits: eligible.length,
    calculatedAt: new Date().toISOString(),
  };
}

function toGoalResponse(
  goal: IGoal,
  walletMap: Map<string, string>
): Record<string, unknown> {
  const obj = goal.toObject
    ? (goal.toObject() as Record<string, unknown>)
    : (goal as unknown as Record<string, unknown>);
  const { _id, __v, userId, ...rest } = obj as {
    _id: unknown;
    __v: unknown;
    userId: unknown;
    [key: string]: unknown;
  };

  return {
    id: String(_id),
    userId: String(userId),
    name: rest.name,
    status: rest.status as string,
    startDate: (rest.startDate as Date).toISOString(),
    endDate: (rest.endDate as Date).toISOString(),
    distributionType: rest.distributionType,
    totalWeeklyGoal: rest.totalWeeklyGoal,
    wallets: (rest.wallets as Array<{
      walletId: { toString(): string };
      weeklyGoal: number;
      days: Array<{ date: Date; goal: number }>;
    }>).map((w) => ({
      walletId: String(w.walletId),
      walletName: walletMap.get(String(w.walletId)) || "",
      weeklyGoal: w.weeklyGoal,
      days: w.days.map((d) => ({
        date: dateKey(d.date),
        goal: d.goal,
      })),
    })),
    archivedAt: rest.archivedAt ? (rest.archivedAt as Date).toISOString() : null,
    snapshot: rest.snapshot || null,
    createdAt: (rest.createdAt as Date).toISOString(),
    updatedAt: (rest.updatedAt as Date).toISOString(),
  };
}

export async function createGoal(
  userId: string,
  data: CreateGoalBody
): Promise<Record<string, unknown>> {
  const wallets = await walletRepository.findAllPaginated(
    { userId: new mongoose.Types.ObjectId(userId) },
    { page: 1, limit: 1000, sort: { name: 1 } }
  );
  const walletMap = new Map(wallets.data.map((w) => [String(w._id), w.name]));

  for (const config of data.wallets) {
    if (!walletMap.has(config.walletId)) {
      throw new NotFoundError("Wallet");
    }
  }

  const goal = await goalRepository.create({
    userId,
    name: data.name,
    startDate: data.startDate,
    endDate: data.endDate,
    distributionType: data.distributionType,
    totalWeeklyGoal: data.totalWeeklyGoal,
    wallets: data.wallets.map((w) => ({
      walletId: new mongoose.Types.ObjectId(w.walletId),
      weeklyGoal: w.weeklyGoal,
      days: w.days.map((d) => ({ date: d.date, goal: d.goal })),
    })),
  });

  return toGoalResponse(goal, walletMap);
}

export async function listGoals(
  userId: string,
  query: GoalQuery
): Promise<{ data: Record<string, unknown>[]; pagination: Record<string, unknown> }> {
  const filter: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId),
  };
  if (query.status) filter.status = query.status;

  const sortObj: Record<string, 1 | -1> = {};
  if (query.sort.startsWith("-")) {
    sortObj[query.sort.slice(1)] = -1;
  } else {
    sortObj[query.sort] = 1;
  }

  const result = await goalRepository.findAllPaginated(filter, {
    page: query.page,
    limit: query.limit,
    sort: sortObj,
  });

  const wallets = await walletRepository.findAllPaginated(
    { userId: new mongoose.Types.ObjectId(userId) },
    { page: 1, limit: 1000, sort: { name: 1 } }
  );
  const walletMap = new Map(wallets.data.map((w) => [String(w._id), w.name]));

  const data = result.data.map((item) => toGoalResponse(item, walletMap));

  return {
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.pagination.total,
      totalPages: result.pagination.totalPages,
    },
  };
}

export async function getGoal(
  userId: string,
  goalId: string
): Promise<Record<string, unknown>> {
  const goal = await goalRepository.findById(goalId);
  if (!goal || String(goal.userId) !== userId) {
    throw new NotFoundError("Goal");
  }

  const wallets = await walletRepository.findAllPaginated(
    { userId: new mongoose.Types.ObjectId(userId) },
    { page: 1, limit: 1000, sort: { name: 1 } }
  );
  const walletMap = new Map(wallets.data.map((w) => [String(w._id), w.name]));

  return toGoalResponse(goal, walletMap);
}

export async function getGoalProgress(
  userId: string,
  goalId: string
): Promise<GoalProgressResponse> {
  const goal = await goalRepository.findById(goalId);
  if (!goal || String(goal.userId) !== userId) {
    throw new NotFoundError("Goal");
  }

  if (goal.status === "archived") {
    if (!goal.snapshot) {
      throw new NotFoundError("Goal");
    }
    const snapshot = goal.snapshot as unknown as GoalProgressResponse;
    return {
      ...snapshot,
      calculatedAt: (snapshot.calculatedAt as unknown as Date).toISOString(),
    };
  }

  const [wallets, transactions] = await Promise.all([
    walletRepository.findAllPaginated(
      { userId: new mongoose.Types.ObjectId(userId) },
      { page: 1, limit: 1000, sort: { name: 1 } }
    ),
    transactionRepository.findAllByUser(userId),
  ]);
  const walletMap = new Map(wallets.data.map((w) => [String(w._id), w.name]));

  const eligible = filterEligibleTransactions(goal, transactions, userId);
  return calculateGoalProgress(goal, eligible, walletMap);
}

export async function archiveGoal(
  userId: string,
  goalId: string
): Promise<Record<string, unknown>> {
  const goal = await goalRepository.findById(goalId);
  if (!goal || String(goal.userId) !== userId) {
    throw new NotFoundError("Goal");
  }

  if (goal.status !== "active") {
    throw new ConflictError("GOAL_ALREADY_ARCHIVED", "Goal is already archived");
  }

  const [wallets, transactions] = await Promise.all([
    walletRepository.findAllPaginated(
      { userId: new mongoose.Types.ObjectId(userId) },
      { page: 1, limit: 1000, sort: { name: 1 } }
    ),
    transactionRepository.findAllByUser(userId),
  ]);
  const walletMap = new Map(wallets.data.map((w) => [String(w._id), w.name]));

  const progress = calculateGoalProgress(
    goal,
    filterEligibleTransactions(goal, transactions, userId),
    walletMap
  );

  const snapshot = {
    ...progress,
    calculatedAt: new Date(),
  } as unknown as IGoal["snapshot"];

  const archivedGoal = await goalRepository.archiveById(goalId, snapshot);
  if (!archivedGoal) {
    throw new NotFoundError("Goal");
  }

  return toGoalResponse(archivedGoal, walletMap);
}
