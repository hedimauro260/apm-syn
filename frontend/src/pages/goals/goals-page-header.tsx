import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { List, Plus, Flag } from "lucide-react";

interface GoalsPageHeaderProps {
  onNewGoal: () => void;
  onManageGoals: () => void;
  onFinishWeek: () => void;
  canFinish?: boolean;
}

export function GoalsPageHeader({
  onNewGoal,
  onManageGoals,
  onFinishWeek,
  canFinish = false,
}: GoalsPageHeaderProps) {
  return (
    <PageHeader
      title="Goals"
      subtitle="Track your weekly savings goals."
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={onManageGoals}
          >
            <List className="h-4 w-4" />
            Manage
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={onFinishWeek}
            disabled={!canFinish}
          >
            <Flag className="h-4 w-4" />
            Finish Week
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="text-xs"
            onClick={onNewGoal}
          >
            <Plus className="h-4 w-4" />
            New Goal
          </Button>
        </>
      }
    />
  );
}