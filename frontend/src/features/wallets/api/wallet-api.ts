import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/services/api/types";
import type {
  CreateWalletInput,
  UpdateWalletInput,
  Wallet,
  WalletListParams,
} from "@/features/wallets/types/wallet.types";

/**
 * Camada HTTP pura do domínio Wallet.
 *
 * Responsabilidade única: montar chamadas HTTP contra o backend APM SYN
 * através do `apiClient` centralizado.
 *
 * Não contém React, useQuery, useMutation, componentes ou estado visual.
 * O token de autenticação (Clerk session token) é recebido do chamador e
 * repassado ao `apiClient`, que o envia no header `Authorization`.
 *
 * Obs.: `env.apiUrl` já inclui o prefixo `/api/v1`, então os paths aqui são
 * relativos a esse prefixo (ex: `/wallets`). A concatenação final resulta
 * em `http://host/api/v1/wallets`.
 */

const WALLET_BASE = "/wallets";

function buildWalletQuery(params?: WalletListParams): string {
  if (!params) return "";

  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.sort) search.set("sort", params.sort);
  if (params.status) search.set("status", params.status);
  if (params.type) search.set("type", params.type);

  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getWallets(
  token: string,
  params?: WalletListParams,
): Promise<PaginatedResponse<Wallet>> {
  const path = `${WALLET_BASE}${buildWalletQuery(params)}`;
  return apiClient<PaginatedResponse<Wallet>>(path, { token });
}

export async function getWallet(token: string, walletId: string): Promise<Wallet> {
  const response = await apiClient<ApiResponse<Wallet>>(`${WALLET_BASE}/${walletId}`, {
    token,
  });
  return response.data;
}

export async function createWallet(token: string, body: CreateWalletInput): Promise<Wallet> {
  const response = await apiClient<ApiResponse<Wallet>>(WALLET_BASE, {
    token,
    method: "POST",
    body: JSON.stringify(body),
  });
  return response.data;
}

export async function updateWallet(
  token: string,
  walletId: string,
  body: UpdateWalletInput,
): Promise<Wallet> {
  const response = await apiClient<ApiResponse<Wallet>>(`${WALLET_BASE}/${walletId}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return response.data;
}

export async function archiveWallet(token: string, walletId: string): Promise<Wallet> {
  const response = await apiClient<ApiResponse<Wallet>>(
    `${WALLET_BASE}/${walletId}/archive`,
    { token, method: "POST" },
  );
  return response.data;
}

export async function activateWallet(token: string, walletId: string): Promise<Wallet> {
  const response = await apiClient<ApiResponse<Wallet>>(
    `${WALLET_BASE}/${walletId}/activate`,
    { token, method: "POST" },
  );
  return response.data;
}

export async function deactivateWallet(token: string, walletId: string): Promise<Wallet> {
  const response = await apiClient<ApiResponse<Wallet>>(
    `${WALLET_BASE}/${walletId}/deactivate`,
    { token, method: "POST" },
  );
  return response.data;
}

export async function deleteWallet(token: string, walletId: string): Promise<void> {
  await apiClient(`${WALLET_BASE}/${walletId}`, { token, method: "DELETE" });
}
