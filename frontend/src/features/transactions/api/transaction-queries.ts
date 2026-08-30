import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import * as transactionApi from "@/features/transactions/api/transaction-api";
import type { TransactionListParams } from "@/features/transactions/types/transaction.types";

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
