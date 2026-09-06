import { useMemo } from "react";

export interface WalletAsset {
  externalId: string;
  symbol: string;
  name: string;
  quantity: number;
  currentValueUSD: number;
}

export interface WalletAssetsMap {
  getWalletAssets: (walletId: string) => WalletAsset[];
  getAssetCount: (walletId: string) => number;
}

export function useWalletAssets(transactions: any[]): WalletAssetsMap {
  return useMemo(() => {
    const assetsByWallet = new Map<string, Map<string, WalletAsset>>();

    for (const tx of transactions) {
      if (!tx.asset) continue;

      const destId = tx.destination?.type === "WALLET" ? tx.destination.id : undefined;
      const srcId = tx.source?.type === "WALLET" ? tx.source.id : undefined;

      if (destId) {
        if (!assetsByWallet.has(destId)) {
          assetsByWallet.set(destId, new Map());
        }
        const walletAssets = assetsByWallet.get(destId)!;
        const existing = walletAssets.get(tx.asset.symbol);
        if (existing) {
          existing.quantity += tx.quantity;
          existing.currentValueUSD += tx.usdValue;
        } else {
          walletAssets.set(tx.asset.symbol, {
            externalId: tx.asset.externalId,
            symbol: tx.asset.symbol,
            name: tx.asset.name,
            quantity: tx.quantity,
            currentValueUSD: tx.usdValue,
          });
        }
      }

      if (srcId) {
        if (!assetsByWallet.has(srcId)) {
          assetsByWallet.set(srcId, new Map());
        }
        const walletAssets = assetsByWallet.get(srcId)!;
        const existing = walletAssets.get(tx.asset.symbol);
        if (existing) {
          existing.quantity -= tx.quantity;
          existing.currentValueUSD -= tx.usdValue;
        } else {
          walletAssets.set(tx.asset.symbol, {
            externalId: tx.asset.externalId,
            symbol: tx.asset.symbol,
            name: tx.asset.name,
            quantity: -tx.quantity,
            currentValueUSD: -tx.usdValue,
          });
        }
      }
    }

    return {
      getWalletAssets: (walletId: string): WalletAsset[] => {
        const walletAssets = assetsByWallet.get(walletId);
        if (!walletAssets) return [];
        return Array.from(walletAssets.values()).filter(a => a.quantity > 0);
      },
      getAssetCount: (walletId: string): number => {
        const walletAssets = assetsByWallet.get(walletId);
        if (!walletAssets) return 0;
        return Array.from(walletAssets.values()).filter(a => a.quantity > 0).length;
      },
    };
  }, [transactions]);
}
