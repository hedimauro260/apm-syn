import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/services/api/types";
import type {
  CreateGoalInput,
  Goal,
  GoalListParams,
  GoalProgress,
} from "@/features/goals/types/goal.types";

/**
 * Camada HTTP pura do domínio Goal.
 *
 * Responsabilidade única: montar chamadas HTTP contra o backend APM SYN
 * através do `apiClient` centralizado.
 *
 * Não contém React, useQuery, useMutation, componentes ou estado visual.
 * O token de autenticação (Clerk session token) é recebido do chamador e
 * repassado ao `apiClient`, que o envia no header `Authorization`.
 *
 * Obs.: `env.apiUrl` já inclui o prefixo `/api/v1`, então os paths aqui são
 * relativos a esse prefixo (ex: `/goals`). A concatenação final resulta
 * em `http://host/api/v1/goals`.
 */

const GOAL_BASE = "/goals";

function buildGoalQuery(params?: GoalListParams): string {
  if (!params) return "";

  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.sort) search.set("sort", params.sort);
  if (params.status) search.set("status", params.status);

  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getGoals(
  token: string,
  params?: GoalListParams,
): Promise<PaginatedResponse<Goal>> {
  const path = `${GOAL_BASE}${buildGoalQuery(params)}`;
  return apiClient<PaginatedResponse<Goal>>(path, { token });
}

export async function getGoal(token: string, goalId: string): Promise<Goal> {
  const response = await apiClient<ApiResponse<Goal>>(
    `${GOAL_BASE}/${goalId}`,
    { token },
  );
  return response.data;
}

export async function getGoalProgress(
  token: string,
  goalId: string,
): Promise<GoalProgress> {
  const response = await apiClient<ApiResponse<GoalProgress>>(
    `${GOAL_BASE}/${goalId}/progress`,
    { token },
  );
  return response.data;
}

export async function createGoal(
  token: string,
  body: CreateGoalInput,
): Promise<Goal> {
  const response = await apiClient<ApiResponse<Goal>>(GOAL_BASE, {
    token,
    method: "POST",
    body: JSON.stringify(body),
  });
  return response.data;
}

export async function archiveGoal(
  token: string,
  goalId: string,
): Promise<Goal> {
  const response = await apiClient<ApiResponse<Goal>>(
    `${GOAL_BASE}/${goalId}/archive`,
    { token, method: "POST" },
  );
  return response.data;
}