import { useState, useMemo, useRef, useEffect } from "react";
import { Wallet, Ellipsis } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { subDays, isWithinInterval, parseISO } from "date-fns";
import { useWalletsQuery } from "@/features/wallets/api/wallet-queries";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

type Variant = "participation" | "inflows" | "outflows" | "transactions";

const VARIANT_LABEL: Record<Variant, string> = {
  participation: "Analysis by participation",
  inflows: "Analysis by inflows",
  outflows: "Analysis by outflows",
  transactions: "Analysis by transactions",
};

const VARIANT_DESC: Record<Variant, string> = {
  participation: "Distribution of total balance across your wallets.",
  inflows: "Total inflows per wallet in the last 6 days (including today).",
  outflows: "Total outflows per wallet in the last 6 days (including today).",
  transactions: "Wallets ranked by transaction count (most to least).",
};

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

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
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
                <Cell key={entry.id} fill={entry.color} />
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
  type: "inflows" | "outflows";
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

function TransactionsRankList({
  entries,
}: {
  entries: { id: string; name: string; count: number; color: string }[];
}) {
  if (entries.length === 0) {
    return <EmptyState title="No transactions" description="No transactions to rank." className="py-8" />;
  }
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-[auto_1fr_auto] gap-2 px-3 py-2 bg-surface-elevated border-b border-border">
        <span className="text-[10px] font-medium text-foreground-muted">#</span>
        <span className="text-[10px] font-medium text-foreground-muted">Wallet</span>
        <span className="text-[10px] font-medium text-foreground-muted text-right">Tx</span>
      </div>
      <ul className="flex flex-col">
        {entries.map((e, idx) => (
          <li key={e.id} className="grid grid-cols-[auto_1fr_auto] gap-2 px-3 py-2 items-center border-b border-border-subtle last:border-0">
            <span className="text-xs font-medium text-foreground-muted w-4">{idx + 1}</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: e.color }} />
              <span className="truncate text-xs text-foreground">{e.name}</span>
            </div>
            <span className="text-xs tabular-nums font-medium text-foreground text-right">{e.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AnalysisWallets() {
  const [variant, setVariant] = useState<Variant>("participation");
  const walletsQuery = useWalletsQuery({ limit: 100 });
  const transactionsQuery = useTransactionsQuery({ limit: 100, sort: "-date" });

  const isLoading = walletsQuery.isLoading || transactionsQuery.isLoading;
  const isError = walletsQuery.isError || transactionsQuery.isError;

  const wallets = useMemo(() => walletsQuery.data?.data ?? [], [walletsQuery.data]);
  const transactions = useMemo(() => transactionsQuery.data?.data ?? [], [transactionsQuery.data]);

  const { participationData, totalBalance } = useMemo(() => {
    const balances = new Map<string, number>();
    for (const w of wallets) balances.set(w.id, 0);
    for (const tx of transactions) {
      const destId = tx.destination.type === "WALLET" ? tx.destination.id : undefined;
      const srcId = tx.source.type === "WALLET" ? tx.source.id : undefined;
      if (destId && balances.has(destId)) balances.set(destId, (balances.get(destId) ?? 0) + tx.usdValue);
      if (srcId && balances.has(srcId)) balances.set(srcId, (balances.get(srcId) ?? 0) - tx.usdValue);
    }
    let total = 0;
    for (const v of balances.values()) if (v > 0) total += v;
    if (total === 0) {
      let alt = 0;
      for (const tx of transactions) {
        if (tx.destination.type === "WALLET") alt += tx.usdValue;
        if (tx.source.type === "WALLET") alt -= tx.usdValue;
      }
      total = alt > 0 ? alt : 0;
    }
    const entries: ChartEntry[] = wallets
      .map((w, idx) => ({
        id: w.id,
        name: w.name,
        value: Math.max(0, balances.get(w.id) ?? 0),
        color: normalizeColor(w.color, idx),
      }))
      .filter(e => e.value > 0)
      .sort((a, b) => b.value - a.value);
    return { participationData: entries, totalBalance: total };
  }, [wallets, transactions]);

  const inflows6 = useMemo(() => {
    const from = subDays(new Date(), 6);
    const now = new Date();
    const map = new Map<string, number>();
    for (const w of wallets) map.set(w.id, 0);
    for (const tx of transactions) {
      const d = parseISO(tx.date);
      if (!isWithinInterval(d, { start: from, end: now })) continue;
      if (tx.destination.type === "WALLET" && tx.destination.id && map.has(tx.destination.id)) {
        map.set(tx.destination.id, (map.get(tx.destination.id) ?? 0) + tx.usdValue);
      }
    }
    return wallets
      .map((w, idx) => ({
        id: w.id,
        name: w.name,
        value: map.get(w.id) ?? 0,
        color: normalizeColor(w.color, idx),
      }))
      .filter(e => e.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [wallets, transactions]);

  const outflows6 = useMemo(() => {
    const from = subDays(new Date(), 6);
    const now = new Date();
    const map = new Map<string, number>();
    for (const w of wallets) map.set(w.id, 0);
    for (const tx of transactions) {
      const d = parseISO(tx.date);
      if (!isWithinInterval(d, { start: from, end: now })) continue;
      if (tx.source.type === "WALLET" && tx.source.id && map.has(tx.source.id)) {
        map.set(tx.source.id, (map.get(tx.source.id) ?? 0) + tx.usdValue);
      }
    }
    return wallets
      .map((w, idx) => ({
        id: w.id,
        name: w.name,
        value: map.get(w.id) ?? 0,
        color: normalizeColor(w.color, idx),
      }))
      .filter(e => e.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [wallets, transactions]);

  const txRank = useMemo(() => {
    const counts = new Map<string, number>();
    for (const w of wallets) counts.set(w.id, 0);
    for (const tx of transactions) {
      const ids = new Set<string>();
      if (tx.source.type === "WALLET" && tx.source.id) ids.add(tx.source.id);
      if (tx.destination.type === "WALLET" && tx.destination.id) ids.add(tx.destination.id);
      for (const id of ids) if (counts.has(id)) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return wallets
      .map((w, idx) => ({
        id: w.id,
        name: w.name,
        count: counts.get(w.id) ?? 0,
        color: normalizeColor(w.color, idx),
      }))
      .filter(e => e.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [wallets, transactions]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
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
        {variant === "inflows" && <InflowsOutflowsList entries={inflows6} type="inflows" />}
        {variant === "outflows" && <InflowsOutflowsList entries={outflows6} type="outflows" />}
        {variant === "transactions" && <TransactionsRankList entries={txRank} />}
      </div>
    </div>
  );
}
