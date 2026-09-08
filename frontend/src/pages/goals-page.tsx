import { useState, type ReactNode } from "react";
import { GoalsPageHeader } from "./goals/goals-page-header";
import { SummaryGoals } from "./goals/summary-goals";
import { GoalsAnalysis } from "./goals/goals-analysis";
import { RecentGoalActivity } from "./goals/recent-goal-activity";
import { DailyGoalsTable } from "./goals/daily-goals-table";
import { NewGoalModal } from "./goals/new-goal-modal";
import { GoalListModal } from "./goals/goal-list-modal";
import { GoalDetailModal } from "./goals/goal-detail-modal";
import { FinishWeekModal } from "./goals/finish-week-modal";
import { useGoalsQuery } from "@/features/goals/api/goal-queries";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { Target, Plus, List } from "lucide-react";
import type { Goal } from "@/features/goals/types/goal.types";

export function GoalsPage() {
  const activeGoalsQuery = useGoalsQuery({ status: "active", limit: 100, sort: "-startDate" });
  const activeGoals = activeGoalsQuery.data?.data ?? [];

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null);
  const [finishOpen, setFinishOpen] = useState(false);

  const effectiveGoalId = selectedGoalId ?? activeGoals[0]?.id ?? null;

  const canFinish =
    effectiveGoalId !== null && activeGoals.some(g => g.id === effectiveGoalId);

  let body: ReactNode;

  if (activeGoalsQuery.isLoading) {
    body = (
      <div className="rounded-xl border border-border bg-surface p-4">
        <LoadingState>Loading goals...</LoadingState>
      </div>
    );
  } else if (activeGoalsQuery.isError) {
    body = (
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState
          title="Unable to load goals"
          description="Something went wrong while loading your goals."
          action={
            <Button variant="outline" size="sm" onClick={() => activeGoalsQuery.refetch()}>
              Try again
            </Button>
          }
        />
      </div>
    );
  } else if (effectiveGoalId === null) {
    body = (
      <div className="rounded-xl border border-border bg-surface p-4">
        <EmptyState
          icon={<Target className="h-12 w-12" />}
          title="No active goals"
          description="Create a weekly savings goal and distribute it across your wallets."
          action={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setListOpen(true)}>
                <List className="h-4 w-4" />
                Manage
              </Button>
              <Button variant="primary" size="sm" className="text-xs" onClick={() => setNewGoalOpen(true)}>
                <Plus className="h-4 w-4" />
                New Goal
              </Button>
            </div>
          }
        />
      </div>
    );
  } else {
    body = (
      <>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SummaryGoals goalId={effectiveGoalId} />
              <GoalsAnalysis goalId={effectiveGoalId} />
            </div>
          </div>
          <div className="lg:w-100 shrink-0">
            <RecentGoalActivity goalId={effectiveGoalId} />
          </div>
        </div>
        <div className="mt-4">
          <DailyGoalsTable goalId={effectiveGoalId} />
        </div>
      </>
    );
  }

  return (
    <div className="p-4">
      <GoalsPageHeader
        onNewGoal={() => setNewGoalOpen(true)}
        onManageGoals={() => setListOpen(true)}
        onFinishWeek={() => setFinishOpen(true)}
        canFinish={canFinish}
      />
      {body}

      <NewGoalModal
        open={newGoalOpen}
        onClose={() => setNewGoalOpen(false)}
        onCreated={goal => setSelectedGoalId(goal.id)}
      />
      <GoalListModal
        open={listOpen}
        onClose={() => setListOpen(false)}
        onSelect={goal => {
          setSelectedGoalId(goal.id);
          setListOpen(false);
        }}
        onViewDetail={goal => {
          setDetailGoal(goal);
          setListOpen(false);
        }}
      />
      <GoalDetailModal
        open={!!detailGoal}
        goal={detailGoal}
        onClose={() => setDetailGoal(null)}
      />
      <FinishWeekModal
        open={finishOpen}
        goalId={effectiveGoalId}
        onClose={() => setFinishOpen(false)}
        onFinished={() => {
          setFinishOpen(false);
          setSelectedGoalId(null);
        }}
      />
    </div>
  );
}