import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/services/api/types";
import type { Transaction } from "@/features/transactions/types/transaction.types";
import type {
  DepositWalletInput,
  WithdrawWalletInput,
  AdjustWalletInput,
  TransferWalletInput,
} from "@/features/wallet-operations/types/wallet-operation.types";

/**
 * Camada HTTP pura das operações financeiras sobre Wallets.
 *
 * Responsabilidade única: montar chamadas HTTP contra o backend APM SYN
 * através do `apiClient` centralizado.
 *
 * Não contém React, useQuery, useMutation, componentes ou estado visual.
 * O token de autenticação (Clerk session token) é recebido do chamador e
 * repassado ao `apiClient`, que o envia no header `Authorization`.
 *
 * Rotas reais do backend:
 *   POST /api/v1/wallets/:walletId/deposits
 *   POST /api/v1/wallets/:walletId/withdrawals
 *   POST /api/v1/wallets/:walletId/adjustments
 *   POST /api/v1/wallet-transfers
 */

const WALLET_BASE = "/wallets";
const TRANSFER_BASE = "/wallet-transfers";

export async function depositToWallet(
  token: string,
  input: DepositWalletInput,
): Promise<Transaction> {
  const { walletId, ...body } = input;
  const response = await apiClient<ApiResponse<Transaction>>(
    `${WALLET_BASE}/${walletId}/deposits`,
    {
      token,
      method: "POST",
      body: JSON.stringify(body),
    },
  );
  return response.data;
}

export async function withdrawFromWallet(
  token: string,
  input: WithdrawWalletInput,
): Promise<Transaction> {
  const { walletId, ...body } = input;
  const response = await apiClient<ApiResponse<Transaction>>(
    `${WALLET_BASE}/${walletId}/withdrawals`,
    {
      token,
      method: "POST",
      body: JSON.stringify(body),
    },
  );
  return response.data;
}

export async function adjustWallet(
  token: string,
  input: AdjustWalletInput,
): Promise<Transaction> {
  const { walletId, ...body } = input;
  const response = await apiClient<ApiResponse<Transaction>>(
    `${WALLET_BASE}/${walletId}/adjustments`,
    {
      token,
      method: "POST",
      body: JSON.stringify(body),
    },
  );
  return response.data;
}

export async function transferBetweenWallets(
  token: string,
  input: TransferWalletInput,
): Promise<Transaction> {
  const response = await apiClient<ApiResponse<Transaction>>(TRANSFER_BASE, {
    token,
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}
