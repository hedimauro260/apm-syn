import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { useGoalProgressQuery } from "@/features/goals/api/goal-queries";
import type { Goal } from "@/features/goals/types/goal.types";
import type { GoalProgress } from "@/features/goals/types/goal.types";
import { goalStatusMeta } from "./goals-utils";
import { formatUSD, formatPercentage } from "@/lib/formats";

interface GoalDetailModalProps {
  open: boolean;
  goal: Goal | null;
  onClose: () => void;
}

function formatRange(goal: Goal): string {
  const start = format(parseISO(goal.startDate), "MMM d");
  const end = format(parseISO(goal.endDate), "MMM d, yyyy");
  return `${start} – ${end}`;
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-3">
      <span className="block text-[10px] font-medium text-foreground-muted">{label}</span>
      <span className="mt-1 block text-sm font-semibold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export function GoalDetailModal({ open, goal, onClose }: GoalDetailModalProps) {
  const progressQuery = useGoalProgressQuery(goal?.id ?? "");

  const progress: GoalProgress | undefined = useMemo(() => {
    if (!goal) return undefined;
    if (goal.status === "active") return progressQuery.data;
    return goal.snapshot ?? undefined;
  }, [goal, progressQuery.data]);

  if (!goal) {
    return (
      <Dialog open={open} onClose={onClose} title="Goal Details">
        <EmptyDetail />
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={goal.name}
      description={`${formatRange(goal)} · ${goal.distributionType === "same" ? "Equal split" : "Custom split"}`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Badge variant={goal.status === "active" ? "success" : "default"} size="sm">
            {goal.status === "active" ? "Active" : "Archived"}
          </Badge>
          {progress && (
            <Badge variant={goalStatusMeta(progress.status).variant} size="sm">
              {goalStatusMeta(progress.status).label}
            </Badge>
          )}
        </div>

        {progressQuery.isLoading && goal.status === "active" && !progress ? (
          <LoadingState>Loading goal detail...</LoadingState>
        ) : progressQuery.isError && goal.status === "active" && !progress ? (
          <ErrorState
            title="Unable to load goal"
            description="Something went wrong while loading this goal."
            action={
              <Button variant="outline" size="sm" onClick={() => progressQuery.refetch()}>
                Try again
              </Button>
            }
          />
        ) : progress ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <StatBlock label="Weekly Goal" value={formatUSD(progress.totalWeeklyGoal)} />
              <StatBlock label="Progress" value={formatUSD(progress.totalWeeklyProgress)} />
              <StatBlock label="Remaining" value={formatUSD(progress.remaining)} />
              <StatBlock label="Achieved" value={formatPercentage(progress.percentage)} />
              <StatBlock label="Current Streak" value={`${progress.streak} ${progress.streak === 1 ? "day" : "days"}`} />
              <StatBlock label="Deposits" value={String(progress.deposits)} />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-foreground tracking-tight">Wallets</h3>
              <ul className="flex flex-col divide-y divide-border-subtle rounded-lg border border-border">
                {progress.walletProgress.map(wp => {
                  const meta = goalStatusMeta(wp.status);
                  const wallet = goal.wallets.find(w => w.walletId === wp.walletId);
                  return (
                    <li key={wp.walletId} className="flex items-center gap-3 px-3 py-2.5">
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                        {wp.walletName}
                      </span>
                      <span className="text-xs tabular-nums text-foreground-secondary">
                        {formatUSD(wp.weeklyProgress)} / {formatUSD(wp.weeklyGoal)}
                      </span>
                      <span className="w-16 text-right text-xs tabular-nums text-foreground">
                        {formatPercentage(wp.percentage)}
                      </span>
                      <Badge variant={meta.variant} size="sm">
                        {meta.label}
                      </Badge>
                      {wallet && (
                        <span className="hidden sm:block text-[10px] text-foreground-muted tabular-nums">
                          {wallet.days.length} days
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-foreground tracking-tight">Daily breakdown</h3>
              {progress.days.length === 0 ? (
                <p className="text-xs text-foreground-muted">No daily targets scheduled.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {progress.days.map(day => {
                    const meta = goalStatusMeta(day.status);
                    return (
                      <li key={day.date} className="flex items-center gap-3 text-xs">
                        <span className="w-24 shrink-0 capitalize text-foreground-secondary">
                          {format(parseISO(day.date), "EEE, MMM d")}
                        </span>
                        <span className="flex-1 tabular-nums text-foreground-muted truncate">
                          {formatUSD(day.goal)} goal
                        </span>
                        <span className="tabular-nums text-foreground">{formatUSD(day.progress)}</span>
                        <span className="w-16 text-right tabular-nums text-foreground-secondary">
                          {formatPercentage(day.percentage)}
                        </span>
                        <Badge variant={meta.variant} size="sm">
                          {meta.label}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        ) : null}
      </div>
    </Dialog>
  );
}

function EmptyDetail() {
  return <p className="text-xs text-foreground-muted">No goal selected.</p>;
}