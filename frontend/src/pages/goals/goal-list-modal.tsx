import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Flag, Eye } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useGoalsQuery } from "@/features/goals/api/goal-queries";
import type { Goal } from "@/features/goals/types/goal.types";
import { formatUSD, formatPercentage } from "@/lib/formats";

interface GoalListModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (goal: Goal) => void;
  onViewDetail: (goal: Goal) => void;
}

function formatRange(goal: Goal): string {
  const start = format(parseISO(goal.startDate), "MMM d");
  const end = format(parseISO(goal.endDate), "MMM d, yyyy");
  return `${start} – ${end}`;
}

export function GoalListModal({
  open,
  onClose,
  onSelect,
  onViewDetail,
}: GoalListModalProps) {
  const goalsQuery = useGoalsQuery({ limit: 100, sort: "-startDate" });

  const goals = useMemo(() => goalsQuery.data?.data ?? [], [goalsQuery.data]);
  const activeCount = useMemo(() => goals.filter(g => g.status === "active").length, [goals]);

  if (goalsQuery.isLoading) {
    return (
      <Dialog open={open} onClose={onClose} title="Goals" description="All your weekly goals.">
        <LoadingState>Loading goals...</LoadingState>
      </Dialog>
    );
  }

  if (goalsQuery.isError) {
    return (
      <Dialog open={open} onClose={onClose} title="Goals" description="All your weekly goals.">
        <ErrorState
          title="Unable to load goals"
          description="Something went wrong while loading your goals."
          action={
            <Button variant="outline" size="sm" onClick={() => goalsQuery.refetch()}>
              Try again
            </Button>
          }
        />
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title="Goals" description={`${activeCount} active · ${goals.length - activeCount} archived`}>
      <div className="flex flex-col gap-2">
        {goals.length === 0 ? (
          <EmptyState title="No goals yet" description="Create your first weekly goal to get started." className="py-8" />
        ) : (
          <ul className="flex flex-col divide-y divide-border-subtle rounded-lg border border-border">
            {goals.map(goal => {
              const isActive = goal.status === "active";
              const percentage = isActive
                ? null
                : goal.snapshot
                  ? goal.snapshot.percentage
                  : null;
              return (
                <li key={goal.id} className="flex items-center gap-3 px-3 py-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 ${
                      isActive ? "bg-success/10 border-success/20" : "bg-surface-elevated border-border"
                    }`}
                  >
                    <Flag className={`h-4 w-4 ${isActive ? "text-success" : "text-foreground-muted"}`} />
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate text-xs font-medium text-foreground">{goal.name}</span>
                      <Badge variant={isActive ? "success" : "default"} size="sm">
                        {isActive ? "Active" : "Archived"}
                      </Badge>
                    </div>
                    <span className="truncate text-[10px] text-foreground-muted tabular-nums">
                      {formatRange(goal)} · {formatUSD(goal.totalWeeklyGoal)}/week
                      {percentage !== null ? ` · ${formatPercentage(percentage)}` : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isActive && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                        onClick={() => onSelect(goal)}
                      >
                        Select
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label={`View details of ${goal.name}`}
                      onClick={() => onViewDetail(goal)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Dialog>
  );
}