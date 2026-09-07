import { useMemo } from "react";
import { Wallet } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useWalletsQuery } from "@/features/wallets/api/wallet-queries";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";
import { useAssetHoldings } from "@/hooks/use-asset-holdings";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatUSD } from "@/lib/formats";

const FALLBACK_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f97316",
];

function normalizeColor(color: string | undefined, index: number): string {
  if (color && /^#([0-9A-Fa-f]{3}){1,2}$/.test(color.trim())) {
    return color.trim().toLowerCase();
  }
  if (color && color.trim().length > 0) {
    return color.trim();
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length]!;
}

interface ChartEntry {
  externalId: string;
  name: string;
  symbol: string;
  value: number;
  color: string;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartEntry; value: number }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]!.payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground">{data.name}</p>
      <p className="text-xs tabular-nums text-foreground-secondary">{formatUSD(data.value)}</p>
    </div>
  );
}

function ParticipationChart({ data, totalBalance }: { data: ChartEntry[]; totalBalance: number }) {
  if (data.length === 0 || totalBalance <= 0) {
    return <EmptyState title="No balance to display" description="Create transactions to see participation." className="py-8" />;
  }

  const legendColsClass = data.length < 3 ? "grid-cols-2" : "grid-cols-3";

  return (
    <>
      <div className="relative h-55 md:h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={1}
              cornerRadius={4}
              stroke="var(--color-surface)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map(entry => (
                <Cell key={entry.externalId} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-elevated border border-border">
            <Wallet className="h-3.5 w-3.5 text-foreground-muted" />
          </span>
          <span className="text-[10px] font-medium text-foreground-muted">Total Balance</span>
          <span className="text-sm font-semibold tabular-nums text-foreground tracking-tight">{formatUSD(totalBalance)}</span>
        </div>
      </div>
      <ul className={`grid ${legendColsClass} gap-x-3 gap-y-2 mt-4`}>
        {data.map(entry => (
          <li key={entry.externalId} className="flex items-center gap-1.5 min-w-0" title={entry.name}>
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
            <span className="truncate text-xs text-foreground-secondary">{entry.symbol}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

export function AnalysisParticipation() {
  const walletsQuery = useWalletsQuery({ limit: 100 });
  const transactionsQuery = useTransactionsQuery({ limit: 100, sort: "-date" });

  const isLoading = walletsQuery.isLoading || transactionsQuery.isLoading;
  const isError = walletsQuery.isError || transactionsQuery.isError;

  const transactions = useMemo(() => transactionsQuery.data?.data ?? [], [transactionsQuery.data]);

  const holdings = useAssetHoldings(transactions);

  const { participationData, totalBalance } = useMemo(() => {
    let total = 0;
    const raw: Array<{ externalId: string; name: string; symbol: string; value: number }> = [];

    for (const held of holdings.values()) {
      if (held.quantity <= 0 || held.valueUsd <= 0) continue;
      total += held.valueUsd;
      raw.push({
        externalId: held.externalId,
        name: held.name,
        symbol: held.symbol,
        value: held.valueUsd,
      });
    }

    const entries: ChartEntry[] = raw
      .sort((a, b) => b.value - a.value)
      .map((e, idx) => ({
        externalId: e.externalId,
        name: e.name,
        symbol: e.symbol,
        value: e.value,
        color: normalizeColor(undefined, idx),
      }));

    return { participationData: entries, totalBalance: total };
  }, [holdings]);

  if (isLoading) {
    return (
      <div className="flex flex-col rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Analysis by participation</h2>
        <LoadingState>Loading analysis...</LoadingState>
      </div>
    );
  }

  if (isError) {
    const handleRetry = () => {
      if (walletsQuery.isError) walletsQuery.refetch();
      if (transactionsQuery.isError) transactionsQuery.refetch();
    };
    return (
      <div className="flex flex-col rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Analysis by participation</h2>
        <ErrorState
          title="Unable to load analysis"
          description="Something went wrong while loading analysis."
          action={
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Analysis by participation</h2>
        <p className="text-xs text-foreground-muted leading-snug">Distribution of total balance across your assets.</p>
      </div>
      <div className="mt-4">
        <ParticipationChart data={participationData} totalBalance={totalBalance} />
      </div>
    </div>
  );
}
