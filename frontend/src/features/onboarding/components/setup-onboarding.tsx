import { useEffect, useMemo, useRef } from "react";
import {
  Circle,
  CircleCheck,
  ChevronRight,
  Globe,
  Target,
  Wallet,
  Rocket,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUserQuery, useUpdateUserMutation } from "@/features/user/api/user-queries";
import { useWalletsQuery } from "@/features/wallets/api/wallet-queries";
import { useWebsitesQuery } from "@/features/websites/api/website-queries";
import { useGoalsQuery } from "@/features/goals/api/goal-queries";
import { cn } from "@/lib/utils";

interface SetupOnboardingProps {
  onOpenWallet: () => void;
  onOpenWebsite: () => void;
  onOpenGoal: () => void;
}

interface SetupStep {
  id: string;
  label: string;
  description: string;
  icon: typeof Wallet;
  done: boolean;
  onOpen: () => void;
}

export function SetupOnboarding({
  onOpenWallet,
  onOpenWebsite,
  onOpenGoal,
}: SetupOnboardingProps) {
  const userQuery = useUserQuery();
  const updateUser = useUpdateUserMutation();
  const { toast } = useToast();

  const walletsQuery = useWalletsQuery({ limit: 100 });
  const websitesQuery = useWebsitesQuery({ limit: 100 });
  const goalsQuery = useGoalsQuery({ limit: 100 });

  const isEmptyLoading =
    walletsQuery.isPending || websitesQuery.isPending || goalsQuery.isPending;

  const steps = useMemo<SetupStep[]>(() => {
    const hasWallet = (walletsQuery.data?.data.length ?? 0) > 0;
    const hasWebsite = (websitesQuery.data?.data.length ?? 0) > 0;
    const hasGoal = (goalsQuery.data?.data.length ?? 0) > 0;

    return [
      {
        id: "wallet",
        label: "Add your first wallet",
        description: "Create a wallet to organize your assets.",
        icon: Wallet,
        done: hasWallet,
        onOpen: onOpenWallet,
      },
      {
        id: "website",
        label: "Add a website",
        description: "Track earnings and withdrawals from your sites.",
        icon: Globe,
        done: hasWebsite,
        onOpen: onOpenWebsite,
      },
      {
        id: "goal",
        label: "Create a financial goal",
        description: "Set a weekly savings goal to track your progress.",
        icon: Target,
        done: hasGoal,
        onOpen: onOpenGoal,
      },
    ];
  }, [
    walletsQuery.data,
    websitesQuery.data,
    goalsQuery.data,
    onOpenWallet,
    onOpenWebsite,
    onOpenGoal,
  ]);

  const completedCount = steps.filter(step => step.done).length;
  const allDone = !isEmptyLoading && completedCount === steps.length;

  const onboarding = userQuery.data?.onboarding;
  const isDismissed = onboarding?.completed || onboarding?.skipped;

  const autoCompletedRef = useRef(false);
  useEffect(() => {
    if (!userQuery.isSuccess || isDismissed || !allDone) return;
    if (autoCompletedRef.current) return;
    autoCompletedRef.current = true;
    updateUser.mutate(
      { onboarding: { completed: true } },
      {
        onError: () => {
          toast.error(
            "Couldn't save setup progress",
            "Your setup is complete, but we couldn't save the state.",
          );
        },
      },
    );
  }, [userQuery.isSuccess, isDismissed, allDone, updateUser, toast]);

  const handleSkip = () => {
    if (!userQuery.isSuccess) return;
    updateUser.mutate(
      { onboarding: { skipped: true } },
      {
        onError: () => {
          toast.error(
            "Couldn't skip setup",
            "An error occurred. Please try again later.",
          );
        },
      },
    );
  };

  if (userQuery.isPending) return null;
  if (userQuery.isSuccess && isDismissed) return null;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-6 pb-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0">
              <Rocket className="h-4 w-4 text-primary" />
            </span>
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              Set up your workspace
            </h3>
          </div>
          <p className="text-sm text-foreground-secondary">
            A few quick steps will help you get started with APM SYN. You can
            skip any step and do it later.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-xs"
          onClick={handleSkip}
          disabled={!userQuery.isSuccess}
        >
          Skip for now
        </Button>
      </div>

      <div className="p-6 pt-4 space-y-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-foreground-secondary">
              Setup progress
            </span>
            <span className="text-xs tabular-nums text-foreground-secondary">
              {completedCount} of {steps.length} completed
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <ul className="flex flex-col divide-y divide-border-subtle rounded-xl border border-border bg-surface-elevated/50">
          {steps.map(step => (
            <li key={step.id}>
              <button
                type="button"
                onClick={step.onOpen}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border shrink-0",
                    step.done
                      ? "bg-success/10 border-success/20 text-success"
                      : "bg-surface border-border text-foreground-muted",
                  )}
                >
                  <step.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="flex-1 min-w-0">
                  <span
                    className={cn(
                      "block text-sm font-medium text-foreground",
                      step.done && "text-foreground-secondary",
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="block truncate text-xs text-foreground-muted">
                    {step.description}
                  </span>
                </span>
                {step.done ? (
                  <CircleCheck
                    className="h-5 w-5 shrink-0 text-success"
                    aria-label="Completed"
                  />
                ) : (
                  <Circle
                    className="h-5 w-5 shrink-0 text-foreground-muted"
                    aria-label="Not completed"
                  />
                )}
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-foreground-muted"
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}