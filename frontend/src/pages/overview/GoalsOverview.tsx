import { useMemo, useState } from "react";
import { ArrowUpRight, Target, TrendingUp, Flame, CalendarRange, WalletMinimal, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useGoalsQuery, useGoalProgressQuery } from "@/features/goals/api/goal-queries";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { goalStatusMeta } from "../goals/goals-utils";
import { formatUSD, formatPercentage } from "@/lib/formats";
import type { Goal } from "@/features/goals/types/goal.types";

function formatPeriod(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

interface GoalCardProps {
  goal: Goal;
}

function GoalCard({ goal }: GoalCardProps) {
  const progressQuery = useGoalProgressQuery(goal.id);
  const p = progressQuery.data;

  const walletCount = goal.wallets.length;
  const overallPercentage = p?.percentage ?? 0;
  const statusMeta = goalStatusMeta(p?.status ?? "not_started");

  const msPerDay = 1000 * 60 * 60 * 24;
  const [now] = useState(() => Date.now());
  const daysElapsed = Math.min(7, Math.max(1, Math.ceil((now - new Date(goal.createdAt).getTime()) / msPerDay)));

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-elevated p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="truncate text-sm font-semibold text-foreground">{goal.name}</span>
        <Badge variant={statusMeta.variant} size="sm">
          {statusMeta.label}
        </Badge>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] text-foreground-muted">
          <WalletMinimal className="h-3 w-3 shrink-0" />
          <span>
            {walletCount} {walletCount === 1 ? "wallet" : "wallets"} · Weekly: {formatUSD(goal.totalWeeklyGoal)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-foreground-muted">
          <CalendarRange className="h-3 w-3 shrink-0" />
          <span>{formatPeriod(goal.startDate)}</span>
          <span>→</span>
          <span>{formatPeriod(goal.endDate)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-medium text-foreground-muted">Progress</span>
          <span className="text-xs font-semibold tabular-nums text-foreground shrink-0">
            {formatPercentage(overallPercentage)}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-border-subtle overflow-hidden">
          <div
            className="h-full rounded-full bg-success/70"
            style={{ width: `${Math.min(100, overallPercentage)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px]">
          <div className="flex flex-col gap-1">
            <span className="text-foreground-secondary">Weekly Goal</span>
            <span className="font-medium tabular-nums text-foreground">{formatUSD(p?.totalWeeklyGoal ?? goal.totalWeeklyGoal)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-foreground-secondary">Progress</span>
            <span className="font-medium tabular-nums text-success">{formatUSD(p?.totalWeeklyProgress ?? 0)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-foreground-secondary">Remaining</span>
            <span className={`font-medium tabular-nums ${p && p.remaining <= 0 ? "text-success" : "text-warning"}`}>
              {formatUSD(p?.remaining ?? 0)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] border-t border-border pt-2">
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-foreground-muted" />
            <span className="text-foreground-secondary">Days</span>
            <span className="font-medium tabular-nums text-foreground">{daysElapsed} {daysElapsed === 1 ? "day" : "days"}</span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="flex h-4 w-4 items-center justify-center rounded-full border border-border">
                {i < daysElapsed ? (
                  <Check className="h-2.5 w-2.5 text-success" />
                ) : (
                  <X className="h-2.5 w-2.5 text-foreground-muted" />
                )}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-info" />
            <span className="text-foreground-secondary">Deposits</span>
            <span className="font-medium tabular-nums text-foreground">{p?.deposits ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GoalsOverview() {
  const navigate = useNavigate();
  const activeGoalsQuery = useGoalsQuery({ status: "active", limit: 100, sort: "-startDate" });

  const isLoading = activeGoalsQuery.isLoading;
  const isError = activeGoalsQuery.isError;

  const goals: Goal[] = useMemo(() => activeGoalsQuery.data?.data ?? [], [activeGoalsQuery.data]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Goals Overview</h2>
        <LoadingState>Loading goals...</LoadingState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Goals Overview</h2>
        <ErrorState
          title="Unable to load goals"
          description="Something went wrong while loading goals overview."
          action={
            <Button variant="outline" size="sm" onClick={() => activeGoalsQuery.refetch()}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Goals Overview</h2>
          <Button variant="ghost" size="sm" className="text-xs h-7 px-2 gap-1" onClick={() => navigate("/app/goals")}>
            View Goals
            <ArrowUpRight className="h-3 w-3" />
          </Button>
        </div>
        <EmptyState
          icon={<Target className="h-12 w-12" />}
          title="No active goals"
          description="Create a weekly savings goal to track your progress."
          action={
            <Button variant="primary" size="sm" className="text-xs" onClick={() => navigate("/app/goals")}>
              Create Goal
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Goals Overview</h2>
        <Button variant="ghost" size="sm" className="text-xs h-7 px-2 gap-1" onClick={() => navigate("/app/goals")}>
          View Goals
          <ArrowUpRight className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {goals.slice(0, 2).map(goal => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      {goals.length > 2 && (
        <div className="text-center text-[10px] text-foreground-muted">
          +{goals.length - 2} more active goal{goals.length - 2 > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
