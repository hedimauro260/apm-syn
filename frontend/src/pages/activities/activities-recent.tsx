import { useMemo } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  CircleDollarSign,
  Wallet,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActivities } from "./use-activities";
import {
  ACTIVITY_TYPE_LABELS,
  isTxInbound,
  isTxOutbound,
  type ActivitiesScope,
} from "./activities-utils";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { formatUSD } from "@/lib/formats";
import type { Transaction } from "@/features/transactions/types/transaction.types";

const ICON_SIZE = 12;
const ICON_STROKE = 1;
const RECENT_COUNT = 9

const ROW_COLS_CLASS =
  "grid-cols-[26px_minmax(0,2fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,0.8fr)]";

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  const isCurrentYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-US", isCurrentYear
    ? { month: "short", day: "numeric" }
    : { month: "short", day: "numeric", year: "numeric" });
}

function ActivityIcon({ tx, scope }: { tx: Transaction; scope: ActivitiesScope }) {
  const inbound = isTxInbound(tx, scope);
  switch (tx.type) {
    case "WALLET_DEPOSIT":
    case "WEBSITE_EARNING":
      return <ArrowDownToLine size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-success" />;
    case "WALLET_WITHDRAWAL":
      return <ArrowUpFromLine size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-danger" />;
    case "WEBSITE_WITHDRAWAL":
      return inbound ? (
        <ArrowDownToLine size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-success" />
      ) : (
        <ArrowUpFromLine size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-danger" />
      );
    case "WALLET_TRANSFER":
      return <ArrowLeftRight size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-info" />;
    case "WALLET_ADJUSTMENT":
      return <CircleDollarSign size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-warning" />;
    default:
      return <CircleDollarSign size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-foreground-muted" />;
  }
}

export function ActivitiesRecent({ scope }: { scope: ActivitiesScope }) {
  const navigate = useNavigate();
  const { scopedTransactions, isLoading, isError, refetchAll } = useActivities(scope);

  const recent = useMemo(
    () =>
      [...scopedTransactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, RECENT_COUNT),
    [scopedTransactions],
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <LoadingState>Loading recent activity...</LoadingState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState
          title="Unable to load recent activity"
          description="Something went wrong while loading recent activity."
          action={
            <Button variant="outline" size="sm" onClick={refetchAll}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Recent Activity</h2>
        <span className="text-[10px] text-foreground-muted tabular-nums">last {RECENT_COUNT}</span>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          title="No recent activity"
          description="Your latest transactions will appear here."
          className="py-8"
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border-subtle">
          {recent.map(tx => {
            const inbound = isTxInbound(tx, scope);
            const outbound = isTxOutbound(tx, scope);
            const signed = inbound && !outbound ? "+" : outbound && !inbound ? "-" : "";
            const amountClass =
              inbound && !outbound
                ? "text-success"
                : outbound && !inbound
                  ? "text-danger"
                  : "text-foreground";

            return (
              <li
                key={tx.id}
                className={`grid ${ROW_COLS_CLASS} gap-2 items-center py-2 min-w-0`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-elevated border border-border shrink-0">
                  <ActivityIcon tx={tx} scope={scope} />
                </span>
                <span className="truncate text-xs font-medium text-foreground">
                  {ACTIVITY_TYPE_LABELS[tx.type]}
                </span>
                <span className="truncate text-xs font-medium text-foreground">
                  {tx.asset.symbol}
                </span>
                <span className={`text-xs font-semibold tabular-nums text-right ${amountClass}`}>
                  {signed}
                  {formatUSD(tx.usdValue)}
                </span>
                <span className="truncate text-[10px] text-foreground-muted tabular-nums text-right">
                  {formatShortDate(tx.date)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => navigate("/app/wallets")}
        >
          <Wallet className="h-3.5 w-3.5" />
          Wallets
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => navigate("/app/websites")}
        >
          <Globe className="h-3.5 w-3.5" />
          Websites
        </Button>
      </div>
    </div>
  );
}