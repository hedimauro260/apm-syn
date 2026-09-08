import { useMemo, useState } from "react";
import { Ellipsis } from "lucide-react";
import { useActivities } from "./use-activities";
import {
  ACTIVITY_TYPE_COLORS,
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPE_ORDER,
  type ActivitiesScope,
} from "./activities-utils";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatUSD } from "@/lib/formats";
import type { TransactionType } from "@/features/transactions/types/transaction.types";

type Variant = "volume" | "count";

const VARIANT_LABEL: Record<Variant, string> = {
  volume: "Activity by volume",
  count: "Activity by count",
};

const VARIANT_DESC: Record<Variant, string> = {
  volume: "USD volume of each transaction type in this history.",
  count: "How often each transaction type appears in this history.",
};

interface TypeEntry {
  type: TransactionType;
  label: string;
  amount: number;
  count: number;
  color: string;
}

export function ActivitiesAnalysis({ scope }: { scope: ActivitiesScope }) {
  const [variant, setVariant] = useState<Variant>("volume");
  const [open, setOpen] = useState(false);
  const { scopedTransactions, isLoading, isError, refetchAll } = useActivities(scope);

  const entries = useMemo<TypeEntry[]>(() => {
    const map = new Map<TransactionType, { amount: number; count: number }>();
    for (const tx of scopedTransactions) {
      const entry = map.get(tx.type) ?? { amount: 0, count: 0 };
      entry.amount += tx.usdValue;
      entry.count += 1;
      map.set(tx.type, entry);
    }
    return ACTIVITY_TYPE_ORDER.filter(type => map.has(type)).map(type => {
      const value = map.get(type)!;
      return {
        type,
        label: ACTIVITY_TYPE_LABELS[type],
        amount: value.amount,
        count: value.count,
        color: ACTIVITY_TYPE_COLORS[type],
      };
    });
  }, [scopedTransactions]);

  const sorted = useMemo(() => {
    const metric = (e: TypeEntry) => (variant === "volume" ? e.amount : e.count);
    return [...entries].sort((a, b) => metric(b) - metric(a));
  }, [entries, variant]);

  const total = useMemo(
    () => sorted.reduce((sum, e) => sum + (variant === "volume" ? e.amount : e.count), 0),
    [sorted, variant],
  );

  const max = sorted.length > 0 ? (variant === "volume" ? sorted[0]!.amount : sorted[0]!.count) : 1;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <LoadingState>Loading analysis...</LoadingState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState
          title="Unable to load activity analysis"
          description="Something went wrong while loading the activity analysis."
          action={
            <Button variant="outline" size="sm" onClick={refetchAll}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">{VARIANT_LABEL[variant]}</h2>
          <p className="text-xs text-foreground-muted leading-snug">{VARIANT_DESC[variant]}</p>
        </div>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            aria-label="Change analysis view"
            onClick={() => setOpen(v => !v)}
          >
            <Ellipsis className="h-4 w-4" />
          </Button>
          {open && (
            <div className="absolute right-0 top-8 z-20 w-48 rounded-lg border border-border bg-surface shadow-md overflow-hidden">
              <div className="flex flex-col py-1">
                {(Object.keys(VARIANT_LABEL) as Variant[]).map(v => (
                  <button
                    key={v}
                    type="button"
                    className={`text-left px-3 py-2 text-xs hover:bg-surface-elevated transition-colors ${
                      variant === v ? "text-primary font-medium bg-primary/5" : "text-foreground-secondary"
                    }`}
                    onClick={() => {
                      setVariant(v);
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

      <div className="mt-4">
        {sorted.length === 0 ? (
          <EmptyState title="No activity breakdown" description="Create transactions to see the breakdown by type." className="py-8" />
        ) : (
          <ul className="flex flex-col gap-3">
            {sorted.map(e => {
              const value = variant === "volume" ? e.amount : e.count;
              const width = max > 0 ? (value / max) * 100 : 0;
              const formatted = variant === "volume" ? formatUSD(e.amount) : String(e.count);
              return (
                <li key={e.type} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: e.color }} />
                      <span className="truncate text-xs font-medium text-foreground">{e.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs tabular-nums text-foreground-secondary">{formatted}</span>
                      <span className="text-[10px] tabular-nums text-foreground-muted w-8 text-right">
                        {total > 0 ? `${((value / total) * 100).toFixed(0)}%` : "-"}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-border-subtle overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${width}%`, background: e.color }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}