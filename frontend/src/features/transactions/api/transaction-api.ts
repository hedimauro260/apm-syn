import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/services/api/types";
import type { Transaction, TransactionListParams } from "@/features/transactions/types/transaction.types";

/**
 * Camada HTTP pura do domínio Transaction.
 *
 * Não contém React, useQuery, ou estado visual.
 * Token recebido do chamador e repassado ao `apiClient`.
 */

const TRANSACTION_BASE = "/transactions";

function buildTransactionQuery(params?: TransactionListParams): string {
  if (!params) return "";

  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.sort) search.set("sort", params.sort);
  if (params.type) search.set("type", params.type);
  if (params.walletId) search.set("walletId", params.walletId);
  if (params.websiteId) search.set("websiteId", params.websiteId);
  if (params.asset) search.set("asset", params.asset);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.countsTowardGoal !== undefined) search.set("countsTowardGoal", String(params.countsTowardGoal));

  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getTransactions(
  token: string,
  params?: TransactionListParams,
): Promise<PaginatedResponse<Transaction>> {
  const path = `${TRANSACTION_BASE}${buildTransactionQuery(params)}`;
  return apiClient<PaginatedResponse<Transaction>>(path, { token });
}

export async function getTransaction(token: string, transactionId: string): Promise<Transaction> {
  const response = await apiClient<ApiResponse<Transaction>>(`${TRANSACTION_BASE}/${transactionId}`, {
    token,
  });
  return response.data;
}
