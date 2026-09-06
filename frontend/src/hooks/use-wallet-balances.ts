import { useMemo } from "react";
import { normalizeColor } from "@/lib/wallet-utils";

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
  return useMemo(() => {
    const balances = new Map<string, number>();
    for (const w of wallets) balances.set(w.id, 0);
    for (const tx of transactions) {
      const destId = tx.destination.type === "WALLET" ? tx.destination.id : undefined;
      const srcId = tx.source.type === "WALLET" ? tx.source.id : undefined;
      if (destId && balances.has(destId)) balances.set(destId, (balances.get(destId) ?? 0) + tx.usdValue);
      if (srcId && balances.has(srcId)) balances.set(srcId, (balances.get(srcId) ?? 0) - tx.usdValue);
    }

    let negative = false;
    for (const v of balances.values()) if (v < 0) negative = true;

    let total = 0;
    for (const v of balances.values()) if (v > 0) total += v;
    if (total === 0) {
      let alt = 0;
      for (const tx of transactions) {
        if (tx.destination.type === "WALLET") alt += tx.usdValue;
        if (tx.source.type === "WALLET") alt -= tx.usdValue;
      }
      total = alt > 0 ? alt : 0;
    }

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

    return { rows: list, hasNegative: negative, totalBalance: total };
  }, [wallets, transactions]);
}
