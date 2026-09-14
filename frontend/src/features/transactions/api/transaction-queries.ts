import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import * as transactionApi from "@/features/transactions/api/transaction-api";
import type {
  TransactionListParams,
  UpdateTransactionInput,
} from "@/features/transactions/types/transaction.types";
import { walletKeys } from "@/features/wallets/api/wallet-queries";
import { websiteKeys } from "@/features/websites/api/website-queries";

export const transactionKeys = {
  all: ["transactions"] as const,
  list: (params?: TransactionListParams) => ["transactions", "list", params] as const,
  detail: (transactionId: string) => ["transactions", "detail", transactionId] as const,
} as const;

async function getAuthToken(getToken: () => Promise<string | null>): Promise<string> {
  const token = await getToken();
  if (!token) {
    throw new Error("Authentication token not available");
  }
  return token;
}

export function useTransactionsQuery(params?: TransactionListParams) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => getAuthToken(getToken).then(token => transactionApi.getTransactions(token, params)),
  });
}

export function useTransactionQuery(transactionId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: transactionKeys.detail(transactionId),
    queryFn: () => getAuthToken(getToken).then(token => transactionApi.getTransaction(token, transactionId)),
    enabled: Boolean(transactionId),
  });
}

/**
 * Invalida as queries afetadas por edição/remoção de uma Transaction:
 * saldos de wallets e websites dependem das transações, então re-busca todos.
 */
function invalidateFinancialQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: transactionKeys.all });
  queryClient.invalidateQueries({ queryKey: walletKeys.all });
  queryClient.invalidateQueries({ queryKey: websiteKeys.all });
}

export function useUpdateTransactionMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, data }: { transactionId: string; data: UpdateTransactionInput }) =>
      getAuthToken(getToken).then(token => transactionApi.updateTransaction(token, transactionId, data)),
    onSuccess: () => {
      invalidateFinancialQueries(queryClient);
    },
  });
}

export function useDeleteTransactionMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) =>
      getAuthToken(getToken).then(token => transactionApi.deleteTransaction(token, transactionId)),
    onSuccess: () => {
      invalidateFinancialQueries(queryClient);
    },
  });
}
