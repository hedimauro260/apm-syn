import { useState, type ElementType } from "react";
import { Target, TrendingUp, Hourglass, Flame, Check, X } from "lucide-react";
import { useGoals } from "./use-goals";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { formatUSD, formatPercentage } from "@/lib/formats";

interface SummaryCardProps {
  icon: ElementType;
  iconClassName?: string;
  label: string;
  value: string;
  secondaryText?: string;
}

function SummaryCard({
  icon: Icon,
  iconClassName,
  label,
  value,
  secondaryText,
}: SummaryCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated border border-border">
          <Icon className={`h-4 w-4 ${iconClassName ?? "text-foreground-muted"}`} />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium text-foreground-muted">{label}</span>
          <span className="text-base font-semibold tabular-nums text-foreground tracking-tight">
            {value}
          </span>
        </div>
      </div>
      <p className="text-[10px] text-foreground-secondary min-h-3">{secondaryText}</p>
    </div>
  );
}

function DaysElapsedCard({ createdAt }: { createdAt: string }) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const [now] = useState(() => Date.now());
  const diffMs = now - new Date(createdAt).getTime();
  const daysElapsed = Math.min(7, Math.max(1, Math.ceil(diffMs / msPerDay)));

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated border border-border">
          <Flame className="h-4 w-4 text-foreground-muted" />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium text-foreground-muted">Days Elapsed</span>
          <span className="text-base font-semibold tabular-nums text-foreground tracking-tight">
            {daysElapsed} {daysElapsed === 1 ? "day" : "days"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: 7 }, (_, i) => (
          <span
            key={i}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border"
          >
            {i < daysElapsed ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <X className="h-3 w-3 text-foreground-muted" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SummaryGoals({ goalId }: { goalId: string }) {
  const { goal, progress, isLoading, isError, refetchAll } = useGoals(goalId);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-2">
        <LoadingState>Loading summary...</LoadingState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState
          title="Unable to load goal summary"
          description="Something went wrong while loading the goal summary."
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
        <ErrorState
          title="No goal selected"
          description="Select a goal to see its summary."
        />
      </div>
    );
  }

  const p = progress;
  const walletCount = goal.wallets.length;

  return (
    <div className="flex flex-col gap-3">
      <SummaryCard
        icon={Target}
        iconClassName="text-primary"
        label="Weekly Goal"
        value={formatUSD(p?.totalWeeklyGoal ?? goal.totalWeeklyGoal)}
        secondaryText={`${p?.totalWeeklyProgress !== undefined ? `${formatUSD(p.totalWeeklyProgress)} reached · ` : ""}across ${walletCount} ${walletCount === 1 ? "wallet" : "wallets"}`}
      />
      <SummaryCard
        icon={TrendingUp}
        iconClassName="text-success"
        label="Weekly Progress"
        value={formatUSD(p?.totalWeeklyProgress ?? 0)}
        secondaryText={
          p
            ? `${formatUSD(p.totalWeeklyGoal)} | ${formatPercentage(p.percentage)} of weekly goal`
            : "No progress yet"
        }
      />
      <SummaryCard
        icon={Hourglass}
        iconClassName={p && p.remaining <= 0 ? "text-success" : "text-warning"}
        label="Remaining"
        value={formatUSD(p?.remaining ?? 0)}
        secondaryText={
          p && p.remaining <= 0
            ? "weekly goal reached"
            : "left to reach the weekly goal"
        }
      />
      <DaysElapsedCard createdAt={goal.createdAt} />
    </div>
  );
}