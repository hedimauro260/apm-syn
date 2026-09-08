import { useMemo } from "react";
import { useWalletsQuery } from "@/features/wallets/api/wallet-queries";
import { useWebsitesQuery } from "@/features/websites/api/website-queries";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";
import type { Transaction } from "@/features/transactions/types/transaction.types";
import type { Wallet } from "@/features/wallets/types/wallet.types";
import type { Website } from "@/features/websites/types/website.types";
import { isTxInScope, type ActivitiesScope } from "./activities-utils";

export function useActivities(scope: ActivitiesScope) {
  const walletsQuery = useWalletsQuery({ limit: 100 });
  const websitesQuery = useWebsitesQuery({ limit: 100 });
  const transactionsQuery = useTransactionsQuery({ limit: 100, sort: "-date" });

  const wallets: Wallet[] = useMemo(() => walletsQuery.data?.data ?? [], [walletsQuery.data]);
  const websites: Website[] = useMemo(() => websitesQuery.data?.data ?? [], [websitesQuery.data]);
  const transactions: Transaction[] = useMemo(
    () => transactionsQuery.data?.data ?? [],
    [transactionsQuery.data],
  );

  const walletNames = useMemo(() => new Map(wallets.map(w => [w.id, w.name] as const)), [wallets]);
  const websiteNames = useMemo(() => new Map(websites.map(w => [w.id, w.name] as const)), [websites]);

  const scopedTransactions: Transaction[] = useMemo(
    () => transactions.filter(tx => isTxInScope(tx, scope)),
    [transactions, scope],
  );

  const isLoading =
    walletsQuery.isLoading || websitesQuery.isLoading || transactionsQuery.isLoading;
  const isError = walletsQuery.isError || websitesQuery.isError || transactionsQuery.isError;

  const refetchAll = () => {
    void walletsQuery.refetch();
    void websitesQuery.refetch();
    void transactionsQuery.refetch();
  };

  return {
    wallets,
    websites,
    walletNames,
    websiteNames,
    transactions,
    scopedTransactions,
    totalTransactions: transactionsQuery.data?.pagination?.total,
    isLoading,
    isError,
    refetchAll,
  };
}