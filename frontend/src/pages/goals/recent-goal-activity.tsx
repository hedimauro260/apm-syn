import { useMemo } from "react";
import { ArrowDownToLine, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGoals } from "./use-goals";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { formatUSD } from "@/lib/formats";

const ICON_SIZE = 12;
const ICON_STROKE = 1;
const RECENT_COUNT = 9;

const ROW_COLS_CLASS =
  "grid-cols-[26px_minmax(0,2fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]";

export function RecentGoalActivity({ goalId }: { goalId: string }) {
  const navigate = useNavigate();
  const { goal, eligibleTransactions, isLoading, isError, refetchAll } = useGoals(goalId);

  const recent = useMemo(
    () => eligibleTransactions.slice(0, RECENT_COUNT),
    [eligibleTransactions],
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <LoadingState>Loading goal activity...</LoadingState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState
          title="Unable to load recent goal activity"
          description="Something went wrong while loading recent goal activity."
          action={
            <Button variant="outline" size="sm" onClick={refetchAll}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const walletNameFor = (txId: string): string => {
    const tx = eligibleTransactions.find(t => t.id === txId);
    if (!tx?.destination.id) return "";
    const wallet = goal?.wallets.find(w => w.walletId === tx.destination.id);
    return wallet?.walletName ?? "";
  };

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Recent Goal Activity</h2>
        <span className="text-[10px] text-foreground-muted tabular-nums">last {RECENT_COUNT}</span>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          title="No activity for this goal"
          description="Deposits that count toward the goal will appear here."
          className="py-8"
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border-subtle">
          {recent.map(tx => (
            <li key={tx.id} className={`grid ${ROW_COLS_CLASS} gap-2 items-center py-2 min-w-0`}>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-elevated border border-border shrink-0">
                <ArrowDownToLine size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-success" />
              </span>
              <span className="truncate text-xs font-medium text-foreground">
                {walletNameFor(tx.id) || "Wallet deposit"}
              </span>
              <span className="truncate text-[10px] text-foreground-muted">{tx.asset.symbol}</span>
              <span className="truncate text-[10px] tabular-nums text-foreground-muted">{tx.quantity.toLocaleString()}</span>
              <span className="text-xs font-semibold tabular-nums text-success text-right">
                +{formatUSD(tx.usdValue)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
        <span className="flex flex-1 items-center justify-center text-[10px] text-foreground-muted">
          {eligibleTransactions.length} total eligible deposit{eligibleTransactions.length === 1 ? "" : "s"}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => navigate("/app/activities")}
        >
          <Wallet className="h-3.5 w-3.5" />
          Activities
        </Button>
      </div>
    </div>
  );
}