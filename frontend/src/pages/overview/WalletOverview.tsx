import { useMemo } from "react";
import { ArrowUpRight, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useWalletsQuery } from "@/features/wallets/api/wallet-queries";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
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

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number }; value: number }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]!.payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground">{data.name}</p>
      <p className="text-xs tabular-nums text-foreground-secondary">{formatUSD(data.value)}</p>
    </div>
  );
}

export function WalletOverview() {
  const navigate = useNavigate();
  const walletsQuery = useWalletsQuery({ limit: 100 });
  const transactionsQuery = useTransactionsQuery({ limit: 100, sort: "-date" });

  const isLoading = walletsQuery.isLoading || transactionsQuery.isLoading;
  const isError = walletsQuery.isError || transactionsQuery.isError;

  const wallets = useMemo(() => walletsQuery.data?.data ?? [], [walletsQuery.data]);
  const transactions = useMemo(() => transactionsQuery.data?.data ?? [], [transactionsQuery.data]);

  const { rows, totalBalance, hasNegative } = useWalletBalances(wallets, transactions);

  const topWallets = rows.slice(0, 5);

  const pieData = useMemo(() => {
    return rows
      .filter(w => w.balance > 0)
      .map((w, idx) => ({
        id: w.id,
        name: w.name,
        value: w.balance,
        color: normalizeColor(undefined, idx),
      }))
      .slice(0, 8);
  }, [rows]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Wallet Overview</h2>
        <LoadingState>Loading wallets...</LoadingState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Wallet Overview</h2>
        <ErrorState
          title="Unable to load wallets"
          description="Something went wrong while loading wallet overview."
          action={
            <Button variant="outline" size="sm" onClick={() => { walletsQuery.refetch(); transactionsQuery.refetch(); }}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Wallet Overview</h2>
        <Button variant="ghost" size="sm" className="text-xs h-7 px-2 gap-1" onClick={() => navigate("/app/wallets")}>
          View Wallets
          <ArrowUpRight className="h-3 w-3" />
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No wallets yet" description="Create a wallet to start tracking your balances." />
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-80 shrink-0 min-w-0">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-medium text-foreground-muted">Balance distribution</span>
                <span className="text-[10px] tabular-nums text-foreground-secondary">{formatUSD(totalBalance)}</span>
              </div>
              <div className="relative h-55 md:h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
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
                      {pieData.map(entry => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
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
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-2 mt-4">
                {pieData.map(entry => (
                  <li key={entry.id} className="flex items-center gap-1.5 min-w-0" title={entry.name}>
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
                    <span className="truncate text-xs text-foreground-secondary">{entry.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full md:flex-1 min-w-0 flex flex-col gap-3 border-l border-border pl-4">
              <h3 className="text-[10px] font-medium text-foreground-muted uppercase tracking-wide">Wallet Balances</h3>
              <ul className="flex flex-col divide-y divide-border-subtle">
                {topWallets.map(wallet => (
                  <li key={wallet.id} className="grid grid-cols-[1fr_1fr_96px] gap-3 items-center py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: wallet.color }} />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-xs font-medium text-foreground" title={wallet.name}>
                          {wallet.name}
                        </span>
                        <span className="text-[10px] text-foreground-muted truncate">{wallet.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 w-24">
                      <span className="text-[10px] tabular-nums text-foreground-secondary text-right">
                        {wallet.participation.toFixed(1)}%
                      </span>
                      <div className="h-1.5 w-full rounded-full bg-border-subtle overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, wallet.participation)}%`, background: "#3b82f6" }} />
                      </div>
                    </div>
                    <div className="flex items-end min-w-0">
                      <span className="text-xs font-semibold tabular-nums text-foreground text-right">{formatUSD(wallet.balance)}</span>
                    </div>
                  </li>
                ))}
              </ul>
              {hasNegative && (
                <p className="text-[10px] text-warning">Some wallets have negative balances</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}