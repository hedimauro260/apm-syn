import { Wallet, TrendingUp, PieChart, CircleDollarSign } from "lucide-react";
import { formatUSD } from "@/lib/formats";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { useWalletList } from "@/hooks/use-wallet-list";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { useWalletAssets } from "@/hooks/use-wallet-assets";

interface KPICardProps {
  icon: React.ElementType;
  iconClassName?: string;
  label: string;
  value: string;
  secondaryText: string;
}

function KPICard({ icon: Icon, iconClassName, label, value, secondaryText }: KPICardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated border border-border">
          <Icon className={`h-4 w-4 ${iconClassName ?? "text-foreground-muted"}`} />
        </span>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] font-medium text-foreground-muted truncate">{label}</span>
          <span className="text-base font-semibold tabular-nums text-foreground tracking-tight truncate">{value}</span>
        </div>
      </div>
      <span className="text-[10px] text-foreground-secondary truncate">{secondaryText}</span>
    </div>
  );
}

export function OverviewKPIs() {
  const { isLoading, isError, wallets, transactions, refetchAll } = useWalletList();
  const { rows, totalBalance } = useWalletBalances(wallets, transactions);
  const { getAssetCount } = useWalletAssets(transactions);

  let totalAssets = 0;
  for (const w of wallets) {
    totalAssets += getAssetCount(w.id);
  }

  const walletCount = wallets.length;
  const largestWallet = rows.length > 0 ? rows[0] : null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-xl border border-border bg-surface p-4">
            <LoadingState>Loading...</LoadingState>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="col-span-full rounded-xl border border-border bg-surface">
          <ErrorState
            title="Unable to load KPIs"
            description="Something went wrong while loading portfolio metrics."
            action={
              <button className="text-xs text-primary underline" onClick={refetchAll}>Try again</button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <KPICard
        icon={Wallet}
        iconClassName="text-primary"
        label="Total Portfolio"
        value={formatUSD(totalBalance)}
        secondaryText="Across all wallets"
      />
      <KPICard
        icon={TrendingUp}
        iconClassName="text-success"
        label="Wallets"
        value={String(walletCount)}
        secondaryText={walletCount === 1 ? "1 wallet" : `${walletCount} wallets`}
      />
      <KPICard
        icon={PieChart}
        iconClassName="text-info"
        label="Assets"
        value={String(totalAssets)}
        secondaryText={totalAssets === 1 ? "1 asset" : `${totalAssets} assets`}
      />
      <KPICard
        icon={CircleDollarSign}
        iconClassName="text-warning"
        label="Largest Wallet"
        value={largestWallet ? formatUSD(largestWallet.balance) : formatUSD(0)}
        secondaryText={largestWallet ? largestWallet.name : "No wallets"}
      />
    </div>
  );
}