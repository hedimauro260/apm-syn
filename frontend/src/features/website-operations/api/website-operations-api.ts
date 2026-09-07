import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/services/api/types";
import type { Transaction } from "@/features/transactions/types/transaction.types";
import type {
  RecordEarningInput,
  WithdrawFromWebsiteInput,
} from "@/features/website-operations/types/website-operation.types";

/**
 * Camada HTTP pura das operações financeiras sobre Websites.
 *
 * Responsabilidade única: montar chamadas HTTP contra o backend APM SYN
 * através do `apiClient` centralizado.
 *
 * Não contém React, useQuery, useMutation, componentes ou estado visual.
 * O token de autenticação (Clerk session token) é recebido do chamador e
 * repassado ao `apiClient`, que o envia no header `Authorization`.
 *
 * Rotas reais do backend:
 *   POST /api/v1/websites/:websiteId/earnings     (requer Idempotency-Key header)
 *   POST /api/v1/websites/:websiteId/withdrawals  (requer Idempotency-Key header)
 */

const WEBSITE_BASE = "/websites";

export async function recordEarning(
  token: string,
  input: RecordEarningInput,
): Promise<Transaction> {
  const { websiteId, ...body } = input;
  const idempotencyKey = crypto.randomUUID();
  const response = await apiClient<ApiResponse<Transaction>>(
    `${WEBSITE_BASE}/${websiteId}/earnings`,
    {
      token,
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(body),
    },
  );
  return response.data;
}

export async function withdrawFromWebsite(
  token: string,
  input: WithdrawFromWebsiteInput,
): Promise<Transaction> {
  const { websiteId, ...body } = input;
  const idempotencyKey = crypto.randomUUID();
  const response = await apiClient<ApiResponse<Transaction>>(
    `${WEBSITE_BASE}/${websiteId}/withdrawals`,
    {
      token,
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(body),
    },
  );
  return response.data;
}
