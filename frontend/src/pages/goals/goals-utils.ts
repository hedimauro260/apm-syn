import {
  addDays,
  format,
  isWithinInterval,
  parseISO,
} from "date-fns";
import type { Goal } from "@/features/goals/types/goal.types";
import type { GoalProgress } from "@/features/goals/types/goal.types";
import type { Transaction } from "@/features/transactions/types/transaction.types";

const WEEK_DAYS = 7;

export function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface GoalDayColumn {
  date: string;
  label: string;
  isToday: boolean;
}

export interface GoalDayCell {
  date: string;
  goal: number;
  progress: number;
  percentage: number;
}

export interface DailyGoalRow {
  walletId: string;
  walletName: string;
  weeklyGoal: number;
  days: GoalDayCell[];
  current: number;
  percentage: number;
  status: string;
}

export interface GoalStatusMeta {
  label: string;
  variant: "success" | "warning" | "info" | "default" | "primary" | "danger";
}

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  getting_started: "Getting started",
  behind: "Behind",
  on_track: "On track",
  excellent: "Excellent",
  completed: "Completed",
};

const STATUS_VARIANTS: Record<string, GoalStatusMeta["variant"]> = {
  not_started: "default",
  getting_started: "info",
  behind: "warning",
  on_track: "success",
  excellent: "success",
  completed: "success",
};

function normalizeStatus(status: string): string {
  const value = status?.trim().toLowerCase() ?? "";
  if (STATUS_LABELS[value] !== undefined) return value;
  return value.length > 0 ? "on_track" : "not_started";
}

export function goalStatusMeta(status: string): GoalStatusMeta {
  const key = normalizeStatus(status);
  return {
    label: STATUS_LABELS[key] ?? key,
    variant: STATUS_VARIANTS[key] ?? "default",
  };
}

/** Converte uma data local em ISO usando meio-dia (evita deslocamento de fuso). */
export function dateToISO(date: Date): string {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
    0,
  ).toISOString();
}

/** Data no formato `yyyy-MM-dd` (mesma chave usada pelo backend). */
export function dateKey(iso: string): string {
  return parseISO(iso).toISOString().slice(0, 10);
}

/**
 * Um transaction conta pra meta se for depósito (countsTowardGoal) direcionado
 * a uma das wallets do goal dentro do período — espelha a lógica do backend.
 */
export function isTransactionEligible(goal: Goal, tx: Transaction): boolean {
  if (tx.countsTowardGoal !== true) return false;
  if (tx.destination.type !== "WALLET" || !tx.destination.id) return false;
  if (!goal.wallets.some(w => w.walletId === tx.destination.id)) return false;

  const d = parseISO(tx.date);
  const start = parseISO(goal.startDate);
  const end = parseISO(goal.endDate);
  return isWithinInterval(d, { start, end });
}

/**
 * Colunas dos 7 dias exibidos na tabela diária. Usa as datas agendadas do
 * goal (união dos days das wallets); se o goal não tiver days, assume a
 * semana começando em `startDate`.
 */
export function getGoalDayColumns(goal: Goal | undefined): GoalDayColumn[] {
  if (!goal) return [];

  const seen = new Set<string>();
  const dates: string[] = [];
  for (const wallet of goal.wallets) {
    for (const day of wallet.days) {
      if (!seen.has(day.date)) {
        seen.add(day.date);
        dates.push(day.date);
      }
    }
  }
  dates.sort();

  const columns = (dates.length > 0 ? dates : []).slice(0, WEEK_DAYS);

  const baseColumns =
    columns.length > 0
      ? columns
      : Array.from({ length: WEEK_DAYS }, (_, i) =>
          format(addDays(parseISO(goal.startDate), i), "yyyy-MM-dd"),
        );

  const today = format(new Date(), "yyyy-MM-dd");

  return baseColumns.map((date, index) => ({
    date,
    label: index === 0 ? format(parseISO(date), "EEE dd") : format(parseISO(date), "EEE"),
    isToday: date === today,
  }));
}

function walletDayGoals(
  goal: Goal,
): Map<string, Map<string, number>> {
  const map = new Map<string, Map<string, number>>();
  for (const wallet of goal.wallets) {
    const dayMap = new Map<string, number>();
    for (const day of wallet.days) dayMap.set(day.date, day.goal);
    map.set(wallet.walletId, dayMap);
  }
  return map;
}

function dateStatus(percentage: number): string {
  if (percentage <= 0) return "not_started";
  if (percentage >= 100) return "completed";
  return "behind";
}

/**
 * Monta as linhas da tabela diária por wallet.
 *
 * `Current`, `Percentage` e `Status` vêm do backend (`walletProgress`), que é
 * a fonte de verdade. As células diárias (meta e alcançado) são complemento
 * de UI calculado a partir das transações elegíveis.
 */
export function buildDailyGoalRows(
  goal: Goal,
  progress: GoalProgress | undefined,
  transactions: Transaction[],
): DailyGoalRow[] {
  const dayColumns = getGoalDayColumns(goal);

  const dayGoals = walletDayGoals(goal);

  const earnedByDate = new Map<string, Map<string, number>>();
  for (const tx of transactions) {
    if (!isTransactionEligible(goal, tx) || !tx.destination.id) continue;
    const key = tx.date.slice(0, 10);
    const inner = earnedByDate.get(key) ?? new Map<string, number>();
    inner.set(tx.destination.id, (inner.get(tx.destination.id) ?? 0) + tx.usdValue);
    earnedByDate.set(key, inner);
  }

  const progressByWallet = new Map(
    (progress?.walletProgress ?? []).map(wp => [wp.walletId, wp]),
  );

  return goal.wallets.map(wallet => {
    const wp = progressByWallet.get(wallet.walletId);

    const days = dayColumns.map(day => {
      const goalValue = dayGoals.get(wallet.walletId)?.get(day.date) ?? 0;
      const progressValue = earnedByDate.get(day.date)?.get(wallet.walletId) ?? 0;
      return {
        date: day.date,
        goal: goalValue,
        progress: roundToTwo(progressValue),
        percentage: goalValue > 0 ? roundToTwo((progressValue / goalValue) * 100) : 0,
      };
    });

    const computedCurrent = roundToTwo(
      days.reduce((sum, day) => sum + day.progress, 0),
    );
    const current = wp ? wp.weeklyProgress : computedCurrent;
    const percentage =
      wp !== undefined
        ? wp.percentage
        : wallet.weeklyGoal > 0
          ? roundToTwo((current / wallet.weeklyGoal) * 100)
          : 0;

    return {
      walletId: wallet.walletId,
      walletName: wallet.walletName,
      weeklyGoal: wallet.weeklyGoal,
      days,
      current,
      percentage,
      status: wp ? wp.status : dateStatus(percentage),
    };
  });
}