/**
 * Tipos do domínio Goal (frontend).
 *
 * Refletem o contrato HTTP real do backend APM SYN (ver `toGoalResponse`
 * e `GoalProgressResponse` em `backend/src/services/goal.service.ts`),
 * não uma versão inventada.
 *
 * O backend converte o `_id` do MongoDB para `id` antes de expor o Goal,
 * então o frontend nunca precisa conhecer `_id`.
 */

export type GoalStatus = "active" | "archived";

export type GoalDistributionType = "same" | "custom";

export type GoalProgressStatus =
  | "not_started"
  | "getting_started"
  | "behind"
  | "on_track"
  | "excellent"
  | "completed";

export interface GoalDay {
  date: string;
  goal: number;
}

export interface GoalWallet {
  walletId: string;
  walletName: string;
  weeklyGoal: number;
  days: GoalDay[];
}

export interface GoalWalletProgress {
  walletId: string;
  walletName: string;
  weeklyGoal: number;
  weeklyProgress: number;
  remaining: number;
  percentage: number;
  status: string;
}

export interface GoalDayProgress {
  date: string;
  goal: number;
  progress: number;
  percentage: number;
  status: string;
}

export interface GoalProgress {
  totalWeeklyGoal: number;
  totalWeeklyProgress: number;
  remaining: number;
  percentage: number;
  status: GoalProgressStatus;
  streak: number;
  bestWallet: {
    walletId: string;
    walletName: string;
    progress: number;
    percentage: number;
  } | null;
  walletProgress: GoalWalletProgress[];
  days: GoalDayProgress[];
  deposits: number;
  calculatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  status: GoalStatus;
  startDate: string;
  endDate: string;
  distributionType: GoalDistributionType;
  totalWeeklyGoal: number;
  wallets: GoalWallet[];
  archivedAt: string | null;
  snapshot: GoalProgress | null;
  createdAt: string;
  updatedAt: string;
}

export const GOAL_STATUSES: GoalStatus[] = ["active", "archived"];

export const GOAL_DISTRIBUTION_TYPES: GoalDistributionType[] = ["same", "custom"];

export interface CreateGoalWalletInput {
  walletId: string;
  weeklyGoal: number;
  days: GoalDay[];
}

export interface CreateGoalInput {
  name: string;
  startDate: string;
  endDate: string;
  distributionType: GoalDistributionType;
  totalWeeklyGoal: number;
  wallets: CreateGoalWalletInput[];
}

export interface GoalListParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: GoalStatus;
}