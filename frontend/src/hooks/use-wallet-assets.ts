import { useMemo } from "react";
import { useAssetHoldings } from "./use-asset-holdings";

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
  const holdings = useAssetHoldings(transactions);

  return useMemo(() => {
    const getWalletAssets = (walletId: string): WalletAsset[] => {
      const list: WalletAsset[] = [];
      for (const held of holdings.values()) {
        const quantity = held.perWallet.get(walletId);
        if (quantity == null || quantity <= 0) continue;
        list.push({
          externalId: held.externalId,
          symbol: held.symbol,
          name: held.name,
          quantity,
          currentValueUSD: held.priceUsd != null ? quantity * held.priceUsd : 0,
        });
      }
      return list;
    };

    const getAssetCount = (walletId: string): number => {
      let count = 0;
      for (const held of holdings.values()) {
        const quantity = held.perWallet.get(walletId);
        if (quantity != null && quantity > 0) count++;
      }
      return count;
    };

    return { getWalletAssets, getAssetCount };
  }, [holdings]);
}