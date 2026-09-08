import { useMemo } from "react";
import { useGoalQuery, useGoalProgressQuery } from "@/features/goals/api/goal-queries";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";
import type { Goal } from "@/features/goals/types/goal.types";
import type { GoalProgress } from "@/features/goals/types/goal.types";
import type { Transaction } from "@/features/transactions/types/transaction.types";
import {
  buildDailyGoalRows,
  getGoalDayColumns,
  isTransactionEligible,
  type DailyGoalRow,
  type GoalDayColumn,
} from "./goals-utils";

/**
 * Agrega os dados do goal selecionado para o painel Goals.
 *
 * Segue o padrão de `use-activities.ts`: cada componente que precisa dos
 * dados chama este hook com o mesmo `goalId` e o TanStack Query deduplica
 * as requisições pela query key.
 */
export function useGoals(goalId: string | null) {
  const goalIdKey = goalId ?? "";

  const goalQuery = useGoalQuery(goalIdKey);
  const progressQuery = useGoalProgressQuery(goalIdKey);
  const transactionsQuery = useTransactionsQuery({ limit: 100, sort: "-date" });

  const goal: Goal | undefined = goalQuery.data;
  const progress: GoalProgress | undefined = progressQuery.data;
  const transactions: Transaction[] = useMemo(
    () => transactionsQuery.data?.data ?? [],
    [transactionsQuery.data],
  );

  const dayColumns: GoalDayColumn[] = useMemo(
    () => getGoalDayColumns(goal),
    [goal],
  );

  const rows: DailyGoalRow[] = useMemo(() => {
    if (!goal) return [];
    return buildDailyGoalRows(goal, progress, transactions);
  }, [goal, progress, transactions]);

  const eligibleTransactions: Transaction[] = useMemo(() => {
    if (!goal) return [];
    return transactions
      .filter(tx => isTransactionEligible(goal, tx))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [goal, transactions]);

  const isLoading =
    goalQuery.isLoading || progressQuery.isLoading || transactionsQuery.isLoading;
  const isError =
    goalQuery.isError || progressQuery.isError || transactionsQuery.isError;

  const refetchAll = () => {
    if (goalQuery.isError) goalQuery.refetch();
    if (progressQuery.isError) progressQuery.refetch();
    if (transactionsQuery.isError) transactionsQuery.refetch();
  };

  return {
    goal,
    progress,
    rows,
    dayColumns,
    eligibleTransactions,
    transactions,
    isLoading,
    isError,
    refetchAll,
  };
}