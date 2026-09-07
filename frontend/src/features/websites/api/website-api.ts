import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/services/api/types";
import type {
  CreateWebsiteInput,
  UpdateWebsiteInput,
  Website,
  WebsiteListParams,
} from "@/features/websites/types/website.types";

/**
 * Camada HTTP pura do domínio Website.
 *
 * Responsabilidade única: montar chamadas HTTP contra o backend APM SYN
 * através do `apiClient` centralizado.
 *
 * Não contém React, useQuery, useMutation, componentes ou estado visual.
 * O token de autenticação (Clerk session token) é recebido do chamador e
 * repassado ao `apiClient`, que o envia no header `Authorization`.
 *
 * Obs.: `env.apiUrl` já inclui o prefixo `/api/v1`, então os paths aqui são
 * relativos a esse prefixo (ex: `/websites`). A concatenação final resulta
 * em `http://host/api/v1/websites`.
 */

const WEBSITE_BASE = "/websites";

function buildWebsiteQuery(params?: WebsiteListParams): string {
  if (!params) return "";

  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.sort) search.set("sort", params.sort);
  if (params.status) search.set("status", params.status);

  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getWebsites(
  token: string,
  params?: WebsiteListParams,
): Promise<PaginatedResponse<Website>> {
  const path = `${WEBSITE_BASE}${buildWebsiteQuery(params)}`;
  return apiClient<PaginatedResponse<Website>>(path, { token });
}

export async function getWebsite(
  token: string,
  websiteId: string,
): Promise<Website> {
  const response = await apiClient<ApiResponse<Website>>(
    `${WEBSITE_BASE}/${websiteId}`,
    { token },
  );
  return response.data;
}

export async function createWebsite(
  token: string,
  body: CreateWebsiteInput,
): Promise<Website> {
  const response = await apiClient<ApiResponse<Website>>(WEBSITE_BASE, {
    token,
    method: "POST",
    body: JSON.stringify(body),
  });
  return response.data;
}

export async function updateWebsite(
  token: string,
  websiteId: string,
  body: UpdateWebsiteInput,
): Promise<Website> {
  const response = await apiClient<ApiResponse<Website>>(
    `${WEBSITE_BASE}/${websiteId}`,
    {
      token,
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
  return response.data;
}

export async function archiveWebsite(
  token: string,
  websiteId: string,
): Promise<Website> {
  const response = await apiClient<ApiResponse<Website>>(
    `${WEBSITE_BASE}/${websiteId}/archive`,
    { token, method: "POST" },
  );
  return response.data;
}

export async function deleteWebsite(
  token: string,
  websiteId: string,
): Promise<void> {
  await apiClient(`${WEBSITE_BASE}/${websiteId}`, { token, method: "DELETE" });
}
