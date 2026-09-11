import { useState, useMemo, useRef, useEffect } from "react";
import { Globe, Ellipsis } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useWebsitesQuery } from "@/features/websites/api/website-queries";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";
import type { Transaction } from "@/features/transactions/types/transaction.types";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatUSD } from "@/lib/formats";
import { startOfDay, subDays, isWithinInterval, parseISO } from "date-fns";

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

const EMPTY_TRANSACTIONS: Transaction[] = [];

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
  id: string;
  name: string;
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

type Variant = "participation" | "earnings" | "withdrawals" | "period";

const VARIANT_LABEL: Record<Variant, string> = {
  participation: "Analysis by participation",
  earnings: "Analysis by earnings",
  withdrawals: "Analysis by withdrawals",
  period: "Analysis by period",
};

const VARIANT_DESC: Record<Variant, string> = {
  participation: "Distribution of total balance across your websites.",
  earnings: "Total earnings per website in the last 6 days (including today).",
  withdrawals: "Total withdrawals per website in the last 6 days (including today).",
  period: "Earnings breakdown by recent periods.",
};

function AnalysisHeader({
  variant,
  onVariantChange,
}: {
  variant: Variant;
  onVariantChange: (v: Variant) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">{VARIANT_LABEL[variant]}</h2>
        <div className="relative" ref={ref}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            aria-label="More analysis options"
            onClick={() => setOpen(v => !v)}
          >
            <Ellipsis className="h-4 w-4" />
          </Button>
          {open && (
            <div className="absolute right-0 top-8 z-20 w-52 rounded-lg border border-border bg-surface shadow-md overflow-hidden">
              <div className="flex flex-col py-1">
                {(Object.keys(VARIANT_LABEL) as Variant[]).map(v => (
                  <button
                    key={v}
                    className={`text-left px-3 py-2 text-xs hover:bg-surface-elevated transition-colors ${variant === v ? "text-primary font-medium bg-primary/5" : "text-foreground-secondary"}`}
                    onClick={() => {
                      onVariantChange(v);
                      setOpen(false);
                    }}
                  >
                    {VARIANT_LABEL[v]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-foreground-muted leading-snug">{VARIANT_DESC[variant]}</p>
    </div>
  );
}

function ParticipationChart({
  data,
  totalBalance,
}: {
  data: ChartEntry[];
  totalBalance: number;
}) {
  if (data.length === 0 || totalBalance <= 0) {
    return <EmptyState title="No balance to display" description="Create earnings to see participation." className="py-8" />;
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
                <Cell key={entry.id} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-elevated border border-border">
            <Globe className="h-3.5 w-3.5 text-foreground-muted" />
          </span>
          <span className="text-[10px] font-medium text-foreground-muted">Total Balance</span>
          <span className="text-sm font-semibold tabular-nums text-foreground tracking-tight">{formatUSD(totalBalance)}</span>
        </div>
      </div>
      <ul className={`grid ${legendColsClass} gap-x-3 gap-y-2 mt-4`}>
        {data.map(entry => (
          <li key={entry.id} className="flex items-center gap-1.5 min-w-0" title={entry.name}>
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
            <span className="truncate text-xs text-foreground-secondary">{entry.name}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function InflowsOutflowsList({
  entries,
  type,
}: {
  entries: { id: string; name: string; value: number; color: string }[];
  type: "earnings" | "withdrawals";
}) {
  if (entries.length === 0) {
    return <EmptyState title={`No ${type} in last 6 days`} description="No transactions in this period." className="py-8" />;
  }
  const max = Math.max(...entries.map(e => e.value), 1);
  return (
    <ul className="flex flex-col gap-2 mt-2">
      {entries.map(e => (
        <li key={e.id} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: e.color }} />
              <span className="truncate text-xs font-medium text-foreground">{e.name}</span>
            </div>
            <span className="text-xs tabular-nums text-foreground-secondary shrink-0">{formatUSD(e.value)}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-border-subtle overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(e.value / max) * 100}%`, background: e.color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function AnalysisByPeriod() {
  const transactionsQuery = useTransactionsQuery({ limit: 200, sort: "-date" });
  const transactions = transactionsQuery.data?.data ?? EMPTY_TRANSACTIONS;

  const periods = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const yesterdayStart = startOfDay(subDays(now, 1));
    const last7Start = subDays(now, 6);
    const last30Start = subDays(now, 29);

    let todayEarnings = 0;
    let yesterdayEarnings = 0;
    let last7Earnings = 0;
    let last30Earnings = 0;

    for (const tx of transactions) {
      if (tx.type !== "WEBSITE_EARNING" || tx.destination.type !== "WEBSITE") continue;
      const d = parseISO(tx.date);
      if (d >= todayStart) todayEarnings += tx.usdValue;
      if (d >= yesterdayStart && d < todayStart) yesterdayEarnings += tx.usdValue;
      if (d >= last7Start) last7Earnings += tx.usdValue;
      if (d >= last30Start) last30Earnings += tx.usdValue;
    }

    return [
      { label: "Earning Today", value: todayEarnings },
      { label: "Earning Yesterday", value: yesterdayEarnings },
      { label: "Last 7 days", value: last7Earnings },
      { label: "Last 30 days", value: last30Earnings },
    ];
  }, [transactions]);

  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {periods.map(p => (
        <div key={p.label} className="rounded-lg border border-border bg-surface-elevated p-3">
          <span className="text-[10px] font-medium text-foreground-muted">{p.label}</span>
          <span className="text-xs font-semibold tabular-nums text-foreground mt-1 block">{formatUSD(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function WebsitesAnalysis() {
  const [variant, setVariant] = useState<Variant>("participation");
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

  const totalBalance = useMemo(() => {
    let total = 0;
    for (const v of websiteBalances.values()) {
      if (v > 0) total += v;
    }
    return total;
  }, [websiteBalances]);

  const participationData = useMemo(() => {
    return websites
      .map((w, idx) => ({
        id: w.id,
        name: w.name,
        value: Math.max(0, websiteBalances.get(w.id) ?? 0),
        color: normalizeColor(undefined, idx),
      }))
      .filter(e => e.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [websites, websiteBalances]);

  const earnings6 = useMemo(() => {
    const from = subDays(new Date(), 6);
    const now = new Date();
    const map = new Map<string, number>();
    for (const w of websites) map.set(w.id, 0);
    for (const tx of transactions) {
      const d = parseISO(tx.date);
      if (!isWithinInterval(d, { start: from, end: now })) continue;
      if (tx.type === "WEBSITE_EARNING" && tx.destination.type === "WEBSITE" && tx.destination.id && map.has(tx.destination.id)) {
        map.set(tx.destination.id, (map.get(tx.destination.id) ?? 0) + tx.usdValue);
      }
    }
    return websites
      .map((w, idx) => ({
        id: w.id,
        name: w.name,
        value: map.get(w.id) ?? 0,
        color: normalizeColor(undefined, idx),
      }))
      .filter(e => e.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [websites, transactions]);

  const withdrawals6 = useMemo(() => {
    const from = subDays(new Date(), 6);
    const now = new Date();
    const map = new Map<string, number>();
    for (const w of websites) map.set(w.id, 0);
    for (const tx of transactions) {
      const d = parseISO(tx.date);
      if (!isWithinInterval(d, { start: from, end: now })) continue;
      if (tx.type === "WEBSITE_WITHDRAWAL" && tx.source.type === "WEBSITE" && tx.source.id && map.has(tx.source.id)) {
        map.set(tx.source.id, (map.get(tx.source.id) ?? 0) + tx.usdValue);
      }
    }
    return websites
      .map((w, idx) => ({
        id: w.id,
        name: w.name,
        value: map.get(w.id) ?? 0,
        color: normalizeColor(undefined, idx),
      }))
      .filter(e => e.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [websites, transactions]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <LoadingState>Loading analysis...</LoadingState>
      </div>
    );
  }

  if (isError) {
    const handleRetry = () => {
      if (websitesQuery.isError) websitesQuery.refetch();
      if (transactionsQuery.isError) transactionsQuery.refetch();
    };
    return (
      <div className="rounded-xl border border-border bg-surface">
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
      <AnalysisHeader variant={variant} onVariantChange={setVariant} />
      <div className="mt-4">
        {variant === "participation" && <ParticipationChart data={participationData} totalBalance={totalBalance} />}
        {variant === "earnings" && <InflowsOutflowsList entries={earnings6} type="earnings" />}
        {variant === "withdrawals" && <InflowsOutflowsList entries={withdrawals6} type="withdrawals" />}
        {variant === "period" && <AnalysisByPeriod />}
      </div>
    </div>
  );
}
