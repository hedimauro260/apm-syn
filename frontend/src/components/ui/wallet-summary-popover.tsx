import { useMemo, useRef, useState } from "react";
import { WalletMinimal, TrendingUp, TrendingDown } from "lucide-react";
import { useWalletsQuery } from "@/features/wallets/api/wallet-queries";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { formatUSD } from "@/lib/formats";

export function WalletSummaryPopover() {
  const [hovered, setHovered] = useState(false);
  const closeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const walletsQuery = useWalletsQuery({ limit: 100 });
  const transactionsQuery = useTransactionsQuery({ limit: 100, sort: "-date" });

  const wallets = useMemo(() => walletsQuery.data?.data ?? [], [walletsQuery.data]);
  const transactions = useMemo(() => transactionsQuery.data?.data ?? [], [transactionsQuery.data]);

  const { totalBalance } = useWalletBalances(wallets, transactions);

  const { totalInflows, totalOutflows } = useMemo(() => {
    let totalInflows = 0;
    let totalOutflows = 0;
    for (const tx of transactions) {
      if (tx.destination.type === "WALLET") totalInflows += tx.usdValue;
      if (tx.source.type === "WALLET") totalOutflows += tx.usdValue;
    }
    return { totalInflows, totalOutflows };
  }, [transactions]);

  const isLoading = walletsQuery.isLoading || transactionsQuery.isLoading;

  function open() {
    if (closeRef.current) clearTimeout(closeRef.current);
    setHovered(true);
  }

  function scheduleClose() {
    closeRef.current = setTimeout(() => setHovered(false), 200);
  }

  return (
    <div
      className="relative"
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-label="Wallets"
        className="p-0 rounded-lg hover:bg-foreground/5 transition-colors"
      >
        <WalletMinimal className="text-foreground-muted hover:text-foreground transition-colors" />
      </button>

      {hovered && (
        <div className="absolute left-0 top-full z-50 mt-3 w-56 rounded-xl border border-border bg-surface shadow-lg p-4">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-foreground-muted">
              Portfolio
            </span>
            <div className="flex items-center gap-2">

              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <WalletMinimal className="h-3.5 w-3.5 text-primary" />
              </span>
              {!isLoading && (
                <span className="text-lg font-bold tabular-nums text-foreground tracking-tight leading-tight">
                  {formatUSD(totalBalance)}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold tabular-nums text-success">
              <TrendingUp className="h-3 w-3" />
              {formatUSD(totalInflows)}
            </span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5 text-xs font-semibold tabular-nums text-destructive">
              <TrendingDown className="h-3 w-3" />
              {formatUSD(totalOutflows)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}