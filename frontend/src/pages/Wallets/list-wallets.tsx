import { Wallet, ArrowDownRight, ArrowUpRight, ArrowLeftRight, SlidersHorizontal } from "lucide-react";
import { useWalletList } from "@/hooks/useWalletList";
import { useWalletBalances } from "@/hooks/useWalletBalances";
import { formatUSD } from "@/lib/formats";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { Button } from "@/components/ui/button";

const ICON_SIZE = 14;
const ICON_STROKE = 1;

export function ListWallets() {
  const { isLoading, isError, wallets, transactions, refetchAll } = useWalletList();
  const { rows, hasNegative, totalBalance } = useWalletBalances(wallets, transactions);

  const headerActions = (
    <div className="flex items-center gap-1">
      <SimpleTooltip label="Deposit" side="top">
        <IconButton variant="ghost" size="xs" aria-label="Deposit" onClick={() => console.log("Deposit")}>
          <ArrowDownRight size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </IconButton>
      </SimpleTooltip>
      <SimpleTooltip label="Withdraw" side="top">
        <IconButton variant="ghost" size="xs" aria-label="Withdraw" onClick={() => console.log("Withdraw")}>
          <ArrowUpRight size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </IconButton>
      </SimpleTooltip>
      <SimpleTooltip label="Transfer" side="top">
        <IconButton variant="ghost" size="xs" aria-label="Transfer" onClick={() => console.log("Transfer")}>
          <ArrowLeftRight size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </IconButton>
      </SimpleTooltip>
      <SimpleTooltip label="Adjust" side="top">
        <IconButton variant="ghost" size="xs" aria-label="Adjust" onClick={() => console.log("Adjust")}>
          <SlidersHorizontal size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </IconButton>
      </SimpleTooltip>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 w-full lg:w-120 border border-border bg-surface rounded-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Wallets</h2>
        </div>
        <LoadingState>Loading wallets...</LoadingState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4 p-4 w-full lg:w-120 border border-border bg-surface rounded-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Wallets</h2>
        </div>
        <ErrorState
          title="Unable to load wallets"
          description="Something went wrong while loading wallets."
          action={
            <Button variant="outline" size="xs" onClick={refetchAll}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (hasNegative) {
    return (
      <div className="flex flex-col gap-4 p-4 w-full lg:w-120 border border-border bg-surface rounded-xl">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Wallets</h2>
          {headerActions}
        </div>
        <ErrorState
          title="Negative balance detected"
          description={`One or more wallets have negative balance (total ${formatUSD(totalBalance)}). This should not happen.`}
          action={
            <Button variant="outline" size="xs" onClick={refetchAll}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-4 w-full lg:w-120 border border-border bg-surface rounded-xl">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Wallets</h2>
          {headerActions}
        </div>
        <EmptyState title="No wallets yet" description="Create your first wallet to get started." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 w-full lg:w-120 border border-border bg-surface rounded-xl">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Wallets</h2>
        {headerActions}
      </div>

      <ul className="flex flex-col divide-y divide-border-subtle">
        {rows.map(row => (
          <li key={row.id} className="grid grid-cols-[32px_1fr_auto_96px] gap-3 items-center py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border shrink-0">
              <Wallet size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-foreground-muted" />
            </span>

            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-medium text-foreground" title={row.name}>
                {row.name}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-foreground-muted truncate">{row.type}</span>
            </div>

            <div className="flex flex-col items-end min-w-0">
              <span className="text-xs font-semibold tabular-nums text-foreground tracking-tight">{formatUSD(row.balance)}</span>
              <span className="text-[10px] text-foreground-muted">{row.assetsLabel}</span>
            </div>

            <div className="flex flex-col gap-1 w-24">
              <span className="text-[10px] tabular-nums text-foreground-secondary text-right">
                {row.participation.toFixed(1)}%
              </span>
              <div className="h-1.5 w-full rounded-full bg-border-subtle overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, row.participation)}%`, background: row.color }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
