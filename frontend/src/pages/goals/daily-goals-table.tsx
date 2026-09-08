import { Wallet } from "lucide-react";
import { useGoals } from "./use-goals";
import { goalStatusMeta } from "./goals-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { formatUSD, formatPercentage } from "@/lib/formats";

const ICON_SIZE = 14;
const ICON_STROKE = 1;

const GRID_COLS_CLASS =
  "grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_repeat(7,minmax(0,0.7fr))_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.8fr)]";

function DayCell({
  goal,
  progress,
  highlighted,
}: {
  goal: number;
  progress: number;
  highlighted: boolean;
}) {
  const fill = goal > 0 && progress >= goal;
  const hasValue = progress > 0;
  const text =
    fill ? "text-success"
      : hasValue ? "text-foreground"
        : "text-foreground-muted";

  const title = goal > 0 ? `Goal ${formatUSD(goal)} · ${formatUSD(progress)} achieved` : "";

  return (
    <span
      className={`text-[11px] tabular-nums text-right ${text} ${highlighted ? "bg-primary/5 rounded px-1" : ""}`}
      title={title}
    >
      {hasValue || goal > 0 ? formatUSD(progress) : "—"}
    </span>
  );
}

export function DailyGoalsTable({ goalId }: { goalId: string }) {
  const { goal, rows, dayColumns, isLoading, isError, refetchAll } = useGoals(goalId);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <LoadingState>Loading daily goals...</LoadingState>
      </div>
    );
  }

  if (isError) {
    const handleRetry = refetchAll;
    return (
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState
          title="Unable to load daily goals"
          description="Something went wrong while loading the daily goals table."
          action={
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Daily Goals</h2>
        </div>
        <EmptyState title="No goal selected" description="Select a goal to see the daily table." />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Daily Goals</h2>
          <span className="text-[10px] text-foreground-muted tabular-nums">{goal.name}</span>
        </div>
        <EmptyState title="No wallets in this goal" description="Add wallets to the goal to build the daily table." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Daily Goals</h2>
          <p className="text-xs text-foreground-muted">{goal.name} · weekly target per wallet</p>
        </div>
        <span className="text-[10px] text-foreground-muted tabular-nums">
          {formatUSD(goal.totalWeeklyGoal)} total
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <div
          className={`grid ${GRID_COLS_CLASS} gap-3 px-4 py-2 bg-surface-elevated border-b border-border text-[10px] font-medium text-foreground-muted uppercase tracking-wide items-center min-w-max`}
        >
          <span>Wallet</span>
          <span className="text-right">Weekly Goal</span>
          {dayColumns.map(col => (
            <span
              key={col.date}
              className={`text-right ${col.isToday ? "text-primary font-semibold" : ""}`}
              title={col.isToday ? "Today" : undefined}
            >
              {col.label}
            </span>
          ))}
          <span className="text-right">Current</span>
          <span className="text-right">Progress</span>
          <span className="text-center">Status</span>
        </div>

        <ul className="flex flex-col divide-y divide-border-subtle">
          {rows.map(row => {
            const meta = goalStatusMeta(row.status);
            return (
              <li key={row.walletId}>
                <div
                  className={`grid ${GRID_COLS_CLASS} gap-3 px-4 py-3 min-w-max items-center hover:bg-surface-elevated/50 transition-colors`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border shrink-0">
                      <Wallet size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-foreground-muted" />
                    </span>
                    <span className="truncate text-xs font-medium text-foreground" title={row.walletName}>
                      {row.walletName}
                    </span>
                  </div>

                  <span className="text-xs font-semibold tabular-nums text-foreground text-right">
                    {formatUSD(row.weeklyGoal)}
                  </span>

                  {row.days.map(day => {
                    const col = dayColumns.find(c => c.date === day.date);
                    return (
                      <DayCell
                        key={day.date}
                        goal={day.goal}
                        progress={day.progress}
                        highlighted={col?.isToday ?? false}
                      />
                    );
                  })}

                  <span className="text-xs font-semibold tabular-nums text-foreground text-right">
                    {formatUSD(row.current)}
                  </span>

                  <span className="text-xs tabular-nums text-foreground-secondary text-right">
                    {formatPercentage(row.percentage)}
                  </span>

                  <div className="flex justify-center">
                    <Badge variant={meta.variant} size="sm">
                      {meta.label}
                    </Badge>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}