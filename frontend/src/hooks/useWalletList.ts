import { useMemo } from "react";
import { useWalletsQuery } from "@/features/wallets/api/wallet-queries";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";

interface UseWalletListOptions {
  walletLimit?: number;
  transactionLimit?: number;
  transactionSort?: string;
}

export function useWalletList(options: UseWalletListOptions = {}) {
  const { walletLimit = 100, transactionLimit = 100, transactionSort = "-date" } = options;

  const walletsQuery = useWalletsQuery({ limit: walletLimit });
  const transactionsQuery = useTransactionsQuery({ limit: transactionLimit, sort: transactionSort });

  const isLoading = walletsQuery.isLoading || transactionsQuery.isLoading;
  const isError = walletsQuery.isError || transactionsQuery.isError;

  const wallets = useMemo(() => walletsQuery.data?.data ?? [], [walletsQuery.data]);
  const transactions = useMemo(() => transactionsQuery.data?.data ?? [], [transactionsQuery.data]);

  const refetchAll = () => {
    if (walletsQuery.isError) walletsQuery.refetch();
    if (transactionsQuery.isError) transactionsQuery.refetch();
  };

  return {
    isLoading,
    isError,
    wallets,
    transactions,
    refetchAll,
    walletsQuery,
    transactionsQuery,
  };
}
