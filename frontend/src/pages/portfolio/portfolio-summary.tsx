import { Wallet, TrendingUp } from "lucide-react";
import { formatUSD } from "@/lib/formats";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { useWalletList } from "@/hooks/use-wallet-list";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { useWalletAssets } from "@/hooks/use-wallet-assets";

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  secondaryText: string;
}

function SummaryCard({ icon: Icon, label, value, secondaryText }: SummaryCardProps) {
  return (
    <div className="flex justify-between gap-2 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated border border-border">
            <Icon className="h-4 w-4 text-foreground-muted" />
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-foreground-muted">{label}</span>
            <span className="text-base font-semibold tabular-nums text-foreground tracking-tight">{value}</span>
          </div>
        </div>
        <div className="mt-0">
          <span className="text-[10px] text-foreground-secondary">{secondaryText}</span>
        </div>
      </div>
    </div>
  );
}

export function PortfolioSummary() {
  const { isLoading, isError, wallets, transactions, refetchAll } = useWalletList();
  const { rows, totalBalance } = useWalletBalances(wallets, transactions);
  const { getAssetCount } = useWalletAssets(transactions);

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
          title="Unable to load summary"
          description="Something went wrong while loading portfolio summary."
          action={
            <Button variant="outline" size="sm" onClick={refetchAll}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const walletCount = wallets.length;
  const largestWallet = rows.length > 0 ? rows[0] : null;

  let totalAssets = 0;
  for (const w of wallets) {
    totalAssets += getAssetCount(w.id);
  }

  return (
    <div className="flex flex-col gap-3">
      <SummaryCard
        icon={Wallet}
        label="Total Portfolio Value"
        value={formatUSD(totalBalance)}
        secondaryText="Across all wallets"
      />
      <SummaryCard
        icon={TrendingUp}
        label="Wallets"
        value={String(walletCount)}
        secondaryText={walletCount === 1 ? "1 wallet" : `${walletCount} wallets`}
      />
      <SummaryCard
        icon={TrendingUp}
        label="Assets"
        value={String(totalAssets)}
        secondaryText={totalAssets === 1 ? "1 asset" : `${totalAssets} assets`}
      />
      <SummaryCard
        icon={Wallet}
        label="Largest Wallet"
        value={largestWallet ? formatUSD(largestWallet.balance) : formatUSD(0)}
        secondaryText={largestWallet ? largestWallet.name : "No wallets"}
      />
    </div>
  );
}
