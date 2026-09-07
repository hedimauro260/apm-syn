import { useMemo } from "react";
import { Globe } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useWebsitesQuery } from "@/features/websites/api/website-queries";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatUSD } from "@/lib/formats";

const ICON_SIZE = 14;
const ICON_STROKE = 1;

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
            <linearGradient id="websiteBalanceFill" x1="0" y1="0" x2="0" y2="1">
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
            fill="url(#websiteBalanceFill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface WebsiteRow {
  id: string;
  name: string;
  balance: number;
  todayEarnings: number;
  participation: number;
  color: string;
}

export function WebsitesList() {
  const websitesQuery = useWebsitesQuery({ limit: 100 });
  const transactionsQuery = useTransactionsQuery({ limit: 100, sort: "-date" });

  const isLoading = websitesQuery.isLoading || transactionsQuery.isLoading;
  const isError = websitesQuery.isError || transactionsQuery.isError;

  const websites = useMemo(() => websitesQuery.data?.data ?? [], [websitesQuery.data]);
  const transactions = useMemo(() => transactionsQuery.data?.data ?? [], [transactionsQuery.data]);

  const websiteBalances = useMemo(() => {
    const balances = new Map<string, number>();
    for (const w of websites) balances.set(w.id, 0);

    for (const tx of transactions) {
      if (tx.destination.type === "WEBSITE" && tx.destination.id) {
        balances.set(tx.destination.id, (balances.get(tx.destination.id) ?? 0) + tx.usdValue);
      }
      if (tx.source.type === "WEBSITE" && tx.source.id) {
        balances.set(tx.source.id, (balances.get(tx.source.id) ?? 0) - tx.usdValue);
      }
    }

    return balances;
  }, [websites, transactions]);

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const rows: WebsiteRow[] = useMemo(() => {
    const list = websites.map((w, idx) => {
      const bal = websiteBalances.get(w.id) ?? 0;

      let todayEarnings = 0;
      for (const tx of transactions) {
        if (tx.type === "WEBSITE_EARNING" && tx.destination.type === "WEBSITE" && tx.destination.id === w.id) {
          const d = new Date(tx.date);
          if (d >= todayStart) todayEarnings += tx.usdValue;
        }
      }

      return {
        id: w.id,
        name: w.name,
        balance: bal,
        todayEarnings,
        participation: 0,
        color: `hsl(${(idx * 137.5) % 360}, 70%, 50%)`,
      };
    });

    const total = list.reduce((sum, r) => sum + r.balance, 0);

    return list
      .map(r => ({
        ...r,
        participation: total > 0 ? (r.balance / total) * 100 : 0,
      }))
      .sort((a, b) => b.balance - a.balance);
  }, [websites, websiteBalances, transactions, todayStart]);

  const topRows = rows.slice(0, 5);

  const trendData: ChartEntry[] = useMemo(() => {
    const sorted = [...transactions]
      .filter(tx => tx.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const points: ChartEntry[] = [];
    let running = 0;
    for (const tx of sorted) {
      if (tx.destination.type === "WEBSITE") running += tx.usdValue;
      if (tx.source.type === "WEBSITE") running -= tx.usdValue;
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
      <div className="flex flex-col gap-4 p-4 w-full lg:w-120 border border-border bg-surface rounded-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Websites</h2>
        </div>
        <LoadingState>Loading websites...</LoadingState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4 p-4 w-full lg:w-120 border border-border bg-surface rounded-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Websites</h2>
        </div>
        <ErrorState
          title="Unable to load websites"
          description="Something went wrong while loading websites."
          action={
            <Button variant="outline" size="xs" onClick={() => { websitesQuery.refetch(); transactionsQuery.refetch(); }}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-4 w-full lg:w-120 border border-border bg-surface rounded-xl">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Websites</h2>
        </div>
        <EmptyState title="No websites yet" description="Create your first website to get started." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 w-full lg:w-120 border border-border bg-surface rounded-xl">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Websites</h2>
      </div>

      <ul className="flex flex-col divide-y divide-border-subtle">
        {topRows.map(row => (
          <li key={row.id} className="grid grid-cols-[32px_1fr_1fr_1fr_96px] gap-3 items-center py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border shrink-0">
              <Globe size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-foreground-muted" />
            </span>

            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-medium text-foreground" title={row.name}>
                {row.name}
              </span>
            </div>

            <div className="flex items-end min-w-0">
              <span className="text-xs font-semibold tabular-nums text-foreground tracking-tight">{formatUSD(row.balance)}</span>
            </div>
            <div className="flex items-end min-w-0">
              <span className="text-[10px] tabular-nums text-foreground-secondary">{formatUSD(row.todayEarnings)}</span>
            </div>

            <div className="flex flex-col gap-1 w-24">
              <span className="text-[10px] tabular-nums text-foreground-secondary text-right">
                {row.participation.toFixed(1)}%
              </span>
              <div className="h-1.5 w-full rounded-full bg-border-subtle overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, row.participation)}%`, background: row.color }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
      {/** Grafico */}
      <div className="flex-1 border-t border-border pt-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-medium text-foreground-muted">Balance evolution</span>
          <span className="text-[10px] tabular-nums text-foreground-secondary">
            {trendData.length > 0 ? formatUSD(trendData[trendData.length - 1]!.value) : "-"}
          </span>
        </div>
        <BalanceTrendChart data={trendData} />
      </div>
    </div>
  );
}
