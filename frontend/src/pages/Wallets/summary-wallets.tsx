import { Wallet, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import { startOfWeek, isWithinInterval, parseISO } from "date-fns";
import { useWalletsQuery } from "@/features/wallets/api/wallet-queries";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  secondaryText: string;
}

function SummaryCard({ icon: Icon, label, value, secondaryText }: SummaryCardProps) {
  return (
    <div className="flex justify-between gap-2 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated border border-border">
            <Icon className="h-4 w-4 text-foreground-muted" />
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-foreground-muted">{label}</span>
            <span className="text-base font-semibold tabular-nums text-foreground tracking-tight">{value}</span>
          </div>
        </div>
        <div className="mt-0">
          <span className="text-[10px] text-foreground-secondary">{secondaryText}</span>
        </div>
      </div>
      {/* TODO: Add chart */}
      <div className="w-42 h-full border border-border"></div>
    </div>
  );
}

export function SummaryWallets() {
  const walletsQuery = useWalletsQuery({ limit: 100 });
  const transactionsQuery = useTransactionsQuery({ limit: 100, sort: "-date" });

  const isLoading = walletsQuery.isLoading || transactionsQuery.isLoading;
  const isError = walletsQuery.isError || transactionsQuery.isError;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-2">
        <LoadingState>Loading summary...</LoadingState>
      </div>
    );
  }

  if (isError) {
    const handleRetry = () => {
      if (walletsQuery.isError) walletsQuery.refetch();
      if (transactionsQuery.isError) transactionsQuery.refetch();
    };
    return (
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState
          title="Unable to load summary"
          description="Something went wrong while loading wallets summary."
          action={
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const wallets = walletsQuery.data?.data ?? [];
  const walletCount = walletsQuery.data?.pagination?.total ?? wallets.length;

  const transactions = transactionsQuery.data?.data ?? [];
  const totalTransactions = transactionsQuery.data?.pagination?.total ?? transactions.length;

  let totalInflows = 0;
  let totalOutflows = 0;

  for (const tx of transactions) {
    if (tx.destination.type === "WALLET") totalInflows += tx.usdValue;
    if (tx.source.type === "WALLET") totalOutflows += tx.usdValue;
  }

  const balance = totalInflows - totalOutflows;

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const now = new Date();

  let weeklyInflows = 0;
  let weeklyOutflows = 0;
  let weeklyCount = 0;

  for (const tx of transactions) {
    const d = parseISO(tx.date);
    const inWeek = isWithinInterval(d, { start: weekStart, end: now });
    if (!inWeek) continue;
    weeklyCount += 1;
    if (tx.destination.type === "WALLET") weeklyInflows += tx.usdValue;
    if (tx.source.type === "WALLET") weeklyOutflows += tx.usdValue;
  }

  return (
    <div className="flex flex-col gap-3">
      <SummaryCard
        icon={Wallet}
        label="Total Balance"
        value={formatUSD(balance)}
        secondaryText={`Across ${walletCount} ${walletCount === 1 ? "wallet" : "wallets"}`}
      />
      <SummaryCard
        icon={TrendingUp}
        label="Total Inflows"
        value={formatUSD(totalInflows)}
        secondaryText={`${formatUSD(weeklyInflows)}\nThis week`}
      />
      <SummaryCard
        icon={TrendingDown}
        label="Total Outflows"
        value={formatUSD(totalOutflows)}
        secondaryText={`${formatUSD(weeklyOutflows)}\nThis week`}
      />
      <SummaryCard
        icon={Receipt}
        label="Total Transactions"
        value={String(totalTransactions)}
        secondaryText={`${weeklyCount} this week`}
      />
    </div>
  );
}
