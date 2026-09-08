import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import * as goalApi from "@/features/goals/api/goal-api";
import type {
  CreateGoalInput,
  Goal,
  GoalListParams,
} from "@/features/goals/types/goal.types";

/**
 * Query keys padronizadas para a feature Goal.
 *
 * `all` (`["goals"]`) age como prefixo: invalidar com ele atinge tanto a
 * lista quanto os detalhes (TanStack Query faz match por prefixo).
 */
export const goalKeys = {
  all: ["goals"] as const,
  list: (params?: GoalListParams) => ["goals", "list", params] as const,
  detail: (goalId: string) => ["goals", "detail", goalId] as const,
  progress: (goalId: string) => ["goals", "detail", goalId, "progress"] as const,
} as const;

/**
 * Resolve o Clerk session token. Lança se não houver sessão ativa — o
 * TanStack Query captura o erro e expõe via `isError`/`error` no hook.
 */
async function getAuthToken(
  getToken: () => Promise<string | null>,
): Promise<string> {
  const token = await getToken();
  if (!token) {
    throw new Error("Authentication token not available");
  }
  return token;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useGoalsQuery(params?: GoalListParams) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: goalKeys.list(params),
    queryFn: () =>
      getAuthToken(getToken).then((token) => goalApi.getGoals(token, params)),
  });
}

export function useGoalQuery(goalId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: goalKeys.detail(goalId),
    queryFn: () =>
      getAuthToken(getToken).then((token) => goalApi.getGoal(token, goalId)),
    enabled: Boolean(goalId),
  });
}

export function useGoalProgressQuery(goalId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: goalKeys.progress(goalId),
    queryFn: () =>
      getAuthToken(getToken).then((token) =>
        goalApi.getGoalProgress(token, goalId),
      ),
    enabled: Boolean(goalId),
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateGoalMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalInput) =>
      getAuthToken(getToken).then((token) => goalApi.createGoal(token, data)),
    onSuccess: (goal: Goal) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
      queryClient.invalidateQueries({
        queryKey: goalKeys.detail(goal.id),
      });
    },
  });
}

export function useArchiveGoalMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: string) =>
      getAuthToken(getToken).then((token) => goalApi.archiveGoal(token, goalId)),
    onSuccess: (goal: Goal) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
      queryClient.invalidateQueries({
        queryKey: goalKeys.detail(goal.id),
      });
      queryClient.invalidateQueries({
        queryKey: goalKeys.progress(goal.id),
      });
    },
  });
}