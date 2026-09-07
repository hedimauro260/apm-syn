import { useMemo } from "react";
import { normalizeColor } from "@/lib/wallet-utils";
import { useAssetHoldings } from "./use-asset-holdings";

interface WalletRow {
  id: string;
  name: string;
  type: string;
  balance: number;
  assetsLabel: string;
  participation: number;
  color: string;
}

interface UseWalletBalancesResult {
  rows: WalletRow[];
  hasNegative: boolean;
  totalBalance: number;
}

export function useWalletBalances(
  wallets: any[],
  transactions: any[],
): UseWalletBalancesResult {
  const holdings = useAssetHoldings(transactions);

  return useMemo(() => {
    const balances = new Map<string, number>();
    for (const w of wallets) balances.set(w.id, 0);

    const negativeWallets = new Set<string>();
    for (const held of holdings.values()) {
      for (const walletId of held.negativeWallets) {
        if (balances.has(walletId)) negativeWallets.add(walletId);
      }
      for (const [walletId, quantity] of held.perWallet) {
        if (!balances.has(walletId)) continue;
        const value = held.priceUsd != null ? quantity * held.priceUsd : 0;
        balances.set(walletId, (balances.get(walletId) ?? 0) + value);
      }
    }

    let total = 0;
    for (const v of balances.values()) if (v > 0) total += v;

    const list: WalletRow[] = wallets
      .map((w, idx) => {
        const bal = balances.get(w.id) ?? 0;
        const pct = total > 0 && bal > 0 ? (bal / total) * 100 : 0;
        return {
          id: w.id,
          name: w.name,
          type: w.type,
          balance: bal,
          assetsLabel: "0 assets",
          participation: pct,
          color: normalizeColor(w.color, idx),
        };
      })
      .sort((a, b) => b.balance - a.balance);

    return { rows: list, hasNegative: negativeWallets.size > 0, totalBalance: total };
  }, [wallets, holdings]);
}