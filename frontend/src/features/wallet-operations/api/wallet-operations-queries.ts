import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import * as walletOperationsApi from "@/features/wallet-operations/api/wallet-operations-api";
import type {
  DepositWalletInput,
  WithdrawWalletInput,
  AdjustWalletInput,
  TransferWalletInput,
} from "@/features/wallet-operations/types/wallet-operation.types";
import { walletKeys } from "@/features/wallets/api/wallet-queries";
import { transactionKeys } from "@/features/transactions/api/transaction-queries";

/**
 * Query keys da feature Wallet Operations.
 *
 * As operações não possuem queries próprias (são mutations puras). A chave
 * `all` existe apenas para manter consistência com as demais features.
 */
export const walletOperationKeys = {
  all: ["wallet-operations"] as const,
} as const;

/**
 * Resolve o Clerk session token. Lança se não houver sessão ativa — o
 * TanStack Query captura o erro e expõe via `isError`/`error` no hook.
 */
async function getAuthToken(getToken: () => Promise<string | null>): Promise<string> {
  const token = await getToken();
  if (!token) {
    throw new Error("Authentication token not available");
  }
  return token;
}

/**
 * Invalida as queries afetadas por qualquer operação financeira.
 *
 * Uma operação cria uma Transaction e altera o saldo de wallets, portanto
 * tanto `walletKeys` quanto `transactionKeys` ficam desatualizados.
 * O backend continua sendo a source of truth — a UI apenas re-busca.
 */
function invalidateFinancialQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: walletKeys.all });
  queryClient.invalidateQueries({ queryKey: transactionKeys.all });
}

export function useDepositMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DepositWalletInput) =>
      getAuthToken(getToken).then(token => walletOperationsApi.depositToWallet(token, input)),
    onSuccess: () => {
      invalidateFinancialQueries(queryClient);
    },
  });
}

export function useWithdrawMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WithdrawWalletInput) =>
      getAuthToken(getToken).then(token => walletOperationsApi.withdrawFromWallet(token, input)),
    onSuccess: () => {
      invalidateFinancialQueries(queryClient);
    },
  });
}

export function useTransferMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TransferWalletInput) =>
      getAuthToken(getToken).then(token => walletOperationsApi.transferBetweenWallets(token, input)),
    onSuccess: () => {
      invalidateFinancialQueries(queryClient);
    },
  });
}

export function useAdjustMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdjustWalletInput) =>
      getAuthToken(getToken).then(token => walletOperationsApi.adjustWallet(token, input)),
    onSuccess: () => {
      invalidateFinancialQueries(queryClient);
    },
  });
}
