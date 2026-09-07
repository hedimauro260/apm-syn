import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useWalletsQuery } from "@/features/wallets/api/wallet-queries";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";
import { useAssetHoldings } from "@/hooks/use-asset-holdings";
import { formatUSD } from "@/lib/formats";
import { getCoinLogoUrl } from "@/features/assets/logo";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface ChartEntry {
  date: string;
  label: string;
  value: number;
}

function AreaTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-md">
      <p className="text-xs tabular-nums text-foreground-secondary">{formatUSD(payload[0]!.value)}</p>
    </div>
  );
}

function BalanceTrendChart({ data }: { data: ChartEntry[] }) {
  if (data.length === 0) {
    return <div className="flex h-full items-center justify-center text-[10px] text-foreground-muted">No balance data in this period</div>;
  }

  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const base = minValue >= 0 ? 0 : minValue * 1.1;
  const top = maxValue * 1.1;

  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="assetBalanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" hide />
          <YAxis hide domain={[base, top]} />
          <ReferenceLine y={base} stroke="#374151" strokeDasharray="3 3" strokeWidth={1} />
          <Tooltip content={<AreaTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#assetBalanceFill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface AssetRow {
  externalId: string;
  name: string;
  symbol: string;
  quantity: number;
  currentValueUSD: number;
  participation: number;
}

export function AssetDistribution() {
  const navigate = useNavigate();
  const walletsQuery = useWalletsQuery({ limit: 100 });
  const transactionsQuery = useTransactionsQuery({ limit: 100, sort: "-date" });

  const isLoading = walletsQuery.isLoading || transactionsQuery.isLoading;
  const isError = walletsQuery.isError || transactionsQuery.isError;

  const transactions = useMemo(() => transactionsQuery.data?.data ?? [], [transactionsQuery.data]);

  const heldAssets = useAssetHoldings(transactions);

  const assets = useMemo(() => {
    const list: AssetRow[] = [];
    let total = 0;

    for (const held of heldAssets.values()) {
      if (held.quantity <= 0) continue;
      total += held.valueUsd;
      list.push({
        externalId: held.externalId,
        name: held.name,
        symbol: held.symbol,
        quantity: held.quantity,
        currentValueUSD: held.valueUsd,
        participation: 0,
      });
    }

    return {
      assets: list
        .map(a => ({
          ...a,
          participation: total > 0 ? (a.currentValueUSD / total) * 100 : 0,
        }))
        .sort((a, b) => b.currentValueUSD - a.currentValueUSD),
      total,
    };
  }, [heldAssets]);

  const trendData: ChartEntry[] = useMemo(() => {
    const sorted = [...transactions]
      .filter(tx => tx.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const points: ChartEntry[] = [];
    let running = 0;
    for (const tx of sorted) {
      if (tx.destination.type === "WALLET") running += tx.usdValue;
      if (tx.source.type === "WALLET") running -= tx.usdValue;
      points.push({
        date: tx.date,
        label: "",
        value: running,
      });
    }
    if (points.length === 0) return points;
    return points.slice(-12);
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="w-full lg:w-120 flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Asset Distribution</h2>
        </div>
        <LoadingState>Loading assets...</LoadingState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full lg:w-120 flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Asset Distribution</h2>
        </div>
        <ErrorState
          title="Unable to load assets"
          description="Something went wrong while loading asset distribution."
          action={
            <Button variant="outline" size="sm" onClick={() => { walletsQuery.refetch(); transactionsQuery.refetch(); }}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const topAssets = assets.assets.slice(0, 5);

  return (
    <div className="w-full lg:w-120 flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Asset Distribution</h2>
        <Button variant="ghost" size="sm" className="text-xs h-7 px-2 gap-1" onClick={() => navigate("/app/wallets")}>
          View Wallets
          <ArrowUpRight className="h-3 w-3" />
        </Button>
      </div>

      {topAssets.length === 0 ? (
        <EmptyState title="No assets yet" description="Create transactions to see asset distribution." />
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-border-subtle">
            {topAssets.map(asset => (
              <li key={asset.externalId} className="grid grid-cols-[32px_1fr_1fr_1fr_96px] gap-3 items-center py-2.5">
                <img
                  src={getCoinLogoUrl(asset.externalId, "thumb")}
                  alt={asset.symbol}
                  className="h-5 w-5 rounded-full shrink-0"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />

                <div className="flex flex-col min-w-0">
                  <span className="truncate text-xs font-medium text-foreground" title={asset.name}>
                    {asset.name}
                  </span>
                  <span className="text-[10px] text-foreground-muted truncate">{asset.symbol}</span>
                </div>

                <div className="flex items-end min-w-0">
                  <span className="text-xs font-semibold tabular-nums text-foreground">{asset.quantity.toLocaleString()}</span>
                </div>
                <div className="flex items-end min-w-0">
                  <span className="text-[10px] tabular-nums text-foreground-secondary">{formatUSD(asset.currentValueUSD)}</span>
                </div>

                <div className="flex flex-col gap-1 w-24">
                  <span className="text-[10px] tabular-nums text-foreground-secondary text-right">
                    {asset.participation.toFixed(1)}%
                  </span>
                  <div className="h-1.5 w-full rounded-full bg-border-subtle overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, asset.participation)}%`, background: "#3b82f6" }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex-1 border-t border-border pt-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] font-medium text-foreground-muted">Portfolio value evolution</span>
              <span className="text-[10px] tabular-nums text-foreground-secondary">
                {trendData.length > 0 ? formatUSD(trendData[trendData.length - 1]!.value) : "-"}
              </span>
            </div>
            <BalanceTrendChart data={trendData} />
          </div>
        </>
      )}
    </div>
  );
}
