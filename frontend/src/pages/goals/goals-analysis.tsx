import { useState, useMemo } from "react";
import { Ellipsis, Trophy, Target, ArrowRight } from "lucide-react";
import { useGoals } from "./use-goals";
import { goalStatusMeta } from "./goals-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { formatUSD, formatPercentage } from "@/lib/formats";

type Variant = "status" | "days" | "best";

const VARIANT_LABEL: Record<Variant, string> = {
  status: "Status breakdown",
  days: "Daily breakdown",
  best: "Best wallet",
};

const VARIANT_DESC: Record<Variant, string> = {
  status: "Overall status and each wallet progress to the weekly goal.",
  days: "Daily target vs. achieved across the week.",
  best: "Wallet with the highest progress in this goal.",
};

export function GoalsAnalysis({ goalId }: { goalId: string }) {
  const [variant, setVariant] = useState<Variant>("status");
  const [open, setOpen] = useState(false);
  const { goal, progress, rows, isLoading, isError, refetchAll } = useGoals(goalId);

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => b.percentage - a.percentage),
    [rows],
  );

  const daysAggregate = useMemo(() => {
    const days = progress?.days ?? [];
    const max = Math.max(...days.map(d => d.percentage), 1);
    return { days, max };
  }, [progress]);

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
          title="Unable to load goal analysis"
          description="Something went wrong while loading the goal analysis."
          action={
            <Button variant="outline" size="sm" onClick={refetchAll}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState title="No goal selected" description="Select a goal to see its analysis." />
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
        {variant === "status" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-elevated p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium text-foreground-muted">Overall status</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {progress ? formatPercentage(progress.percentage) : "—"}
                </span>
              </div>
              <Badge variant={goalStatusMeta(progress?.status ?? "not_started").variant} size="sm">
                {goalStatusMeta(progress?.status ?? "not_started").label}
              </Badge>
            </div>

            {sortedRows.length === 0 ? (
              <EmptyState title="No wallets in this goal" description="Add wallets to the goal to see status." className="py-8" />
            ) : (
              <ul className="flex flex-col gap-3">
                {sortedRows.map(row => {
                  const meta = goalStatusMeta(row.status);
                  const width = Math.min(100, row.percentage);
                  return (
                    <li key={row.walletId} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate text-xs font-medium text-foreground">{row.walletName}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs tabular-nums text-foreground-secondary">{formatPercentage(row.percentage)}</span>
                          <Badge variant={meta.variant} size="sm">
                            {meta.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-border-subtle overflow-hidden">
                        <div
                          className="h-full rounded-full bg-success/70"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {variant === "days" && (
          <div className="flex flex-col gap-3">
            {progress && progress.days.length === 0 ? (
              <EmptyState title="No scheduled days" description="This goal has no daily targets yet." className="py-8" />
            ) : (
              daysAggregate.days.map(day => {
                const meta = goalStatusMeta(day.status);
                const width = Math.min(100, day.percentage);
                return (
                  <li key={day.date} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-foreground capitalize">
                        {new Date(`${day.date}T12:00:00`).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] tabular-nums text-foreground-muted">
                          {formatUSD(day.goal)} goal
                        </span>
                        <span className="text-xs tabular-nums text-foreground-secondary">
                          {formatUSD(day.progress)} · {formatPercentage(day.percentage)}
                        </span>
                        <Badge variant={meta.variant} size="sm">
                          {meta.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-border-subtle overflow-hidden">
                      <div
                        className={`h-full rounded-full ${day.percentage >= 100 ? "bg-success" : "bg-info"}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </li>
                );
              })
            )}
          </div>
        )}

        {variant === "best" && (
          <div className="flex flex-col gap-3">
            {progress && progress.bestWallet ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 border border-success/20">
                  <Trophy className="h-4 w-4 text-success" />
                </span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="truncate text-sm font-semibold text-foreground">{progress.bestWallet.walletName}</span>
                  <span className="text-xs tabular-nums text-foreground-secondary">
                    {formatUSD(progress.bestWallet.progress)} · {formatPercentage(progress.bestWallet.percentage)}
                  </span>
                </div>
              </div>
            ) : (
              <EmptyState title="No best wallet yet" description="Start earning toward the goal to see highlights." className="py-8" />
            )}

            {progress && (
              <ul className="flex flex-col gap-2">
                <li className="flex items-center justify-between text-xs">
                  <span className="text-foreground-muted flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" /> Deposits toward goal
                  </span>
                  <span className="tabular-nums text-foreground font-medium">{progress.deposits}</span>
                </li>
                <li className="flex items-center justify-between text-xs">
                  <span className="text-foreground-muted flex items-center gap-1.5">
                    <ArrowRight className="h-3.5 w-3.5" /> Remaining
                  </span>
                  <span className="tabular-nums text-foreground font-medium">{formatUSD(progress.remaining)}</span>
                </li>
                <li className="flex items-center justify-between text-xs">
                  <span className="text-foreground-muted flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5" /> Streak
                  </span>
                  <span className="tabular-nums text-foreground font-medium">
                    {progress.streak} {progress.streak === 1 ? "day" : "days"}
                  </span>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}