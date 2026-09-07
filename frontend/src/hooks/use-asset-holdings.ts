import { useMemo } from "react";
import { useAssetPrices } from "@/features/market-data/hooks/use-asset-prices";

export interface HeldAsset {
  externalId: string;
  symbol: string;
  name: string;
  quantity: number;
  perWallet: Map<string, number>;
  negativeWallets: Set<string>;
  priceUsd: number | undefined;
  valueUsd: number;
}

export function useAssetHoldings(transactions: any[]): Map<string, HeldAsset> {
  const assetIds = useMemo(() => {
    const ids = new Set<string>();
    for (const tx of transactions) {
      if (tx.asset?.externalId) ids.add(tx.asset.externalId);
    }
    return Array.from(ids);
  }, [transactions]);

  const priceMap = useAssetPrices(assetIds);

  return useMemo(() => {
    const assetMap = new Map<string, {
      symbol: string;
      name: string;
      rawQuantity: number;
      perWallet: Map<string, number>;
    }>();

    for (const tx of transactions) {
      const asset = tx.asset;
      if (!asset || !asset.externalId) continue;

      const destId = tx.destination?.type === "WALLET" ? tx.destination.id : undefined;
      const srcId = tx.source?.type === "WALLET" ? tx.source.id : undefined;

      let entry = assetMap.get(asset.externalId);
      if (!entry) {
        entry = {
          symbol: asset.symbol,
          name: asset.name,
          rawQuantity: 0,
          perWallet: new Map<string, number>(),
        };
        assetMap.set(asset.externalId, entry);
      }

      if (destId) {
        entry.rawQuantity += tx.quantity;
        const walletQty = (entry.perWallet.get(destId) ?? 0) + tx.quantity;
        entry.perWallet.set(destId, walletQty);
      }
      if (srcId) {
        entry.rawQuantity -= tx.quantity;
        const walletQty = (entry.perWallet.get(srcId) ?? 0) - tx.quantity;
        entry.perWallet.set(srcId, walletQty);
      }
    }

    const result = new Map<string, HeldAsset>();
    for (const [externalId, data] of assetMap) {
      const quantity = Math.max(0, data.rawQuantity);

      const perWallet = new Map<string, number>();
      const negativeWallets = new Set<string>();
      for (const [walletId, walletQty] of data.perWallet) {
        if (walletQty > 0) perWallet.set(walletId, walletQty);
        if (walletQty < 0) negativeWallets.add(walletId);
      }

      const priceUsd = priceMap.get(externalId);
      const valueUsd = priceUsd != null ? quantity * priceUsd : 0;

      result.set(externalId, {
        externalId,
        symbol: data.symbol,
        name: data.name,
        quantity,
        perWallet,
        negativeWallets,
        priceUsd,
        valueUsd,
      });
    }
    return result;
  }, [transactions, priceMap]);
}