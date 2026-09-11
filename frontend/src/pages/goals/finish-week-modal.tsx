import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { useGoalQuery, useGoalProgressQuery, useArchiveGoalMutation } from "@/features/goals/api/goal-queries";
import { formatUSD, formatPercentage } from "@/lib/formats";
import { ApiError } from "@/services/api/errors";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface FinishWeekModalProps {
  open: boolean;
  goalId: string | null;
  onClose: () => void;
  onFinished?: () => void;
}

export function FinishWeekModal({ open, goalId, onClose, onFinished }: FinishWeekModalProps) {
  const { toast } = useToast();
  const [finished, setFinished] = useState(false);

  const goalQuery = useGoalQuery(goalId ?? "");
  const progressQuery = useGoalProgressQuery(goalId ?? "");
  const archiveMutation = useArchiveGoalMutation();

  const goal = goalQuery.data;
  const progress = progressQuery.data;

  const handleClose = () => {
    if (archiveMutation.isPending) return;
    setFinished(false);
    onClose();
  };

  const handleFinish = async () => {
    if (!goalId) return;
    try {
      await archiveMutation.mutateAsync(goalId);
      setFinished(true);
      toast.success("Week finished", `"${goal?.name ?? "Goal"}" was archived.`);
      onFinished?.();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Could not finish week", err.message || "Failed to archive the goal.");
      } else {
        toast.error("Could not finish week", "Unexpected error. Try again.");
      }
    }
  };

  const summary = progress
    ? `${formatUSD(progress.totalWeeklyProgress)} of ${formatUSD(progress.totalWeeklyGoal)} · ${formatPercentage(progress.percentage)}`
    : "—";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Finish Week"
      description={
        goal
          ? `Archive "${goal.name}" so the next weekly goal can start.`
          : "Archive the current weekly goal."
      }
    >
      <div className="flex flex-col gap-4">
        {finished ? (
          <Alert variant="success">
            <AlertDescription>Goal archived. Its snapshot is now locked and saved.</AlertDescription>
          </Alert>
        ) : goalQuery.isLoading || progressQuery.isLoading ? (
          <LoadingState>Loading goal...</LoadingState>
        ) : goalQuery.isError || progressQuery.isError ? (
          <ErrorState
            title="Unable to load goal"
            description="Something went wrong while loading the goal."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (goalQuery.isError) goalQuery.refetch();
                  if (progressQuery.isError) progressQuery.refetch();
                }}
              >
                Try again
              </Button>
            }
          />
        ) : goal ? (
          <>
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-elevated p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Progress</span>
                <span className="font-medium tabular-nums text-foreground">{summary}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Deposits</span>
                <span className="font-medium tabular-nums text-foreground">
                  {progress ? String(progress.deposits) : "—"}
                </span>
              </div>
              {progress && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">Remaining</span>
                  <span className="font-medium tabular-nums text-foreground">{formatUSD(progress.remaining)}</span>
                </div>
              )}
            </div>

            <Alert variant="warning">
              <AlertDescription>
                Finishing the week archives the goal and keeps a snapshot of its final numbers. This action cannot be undone.
              </AlertDescription>
            </Alert>
          </>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={archiveMutation.isPending}>
            Cancel
          </Button>
          <Button type="button" variant="danger" size="sm" loading={archiveMutation.isPending} onClick={handleFinish} disabled={!goalId}>
            Finish Week
          </Button>
        </div>
      </div>
    </Dialog>
  );
}