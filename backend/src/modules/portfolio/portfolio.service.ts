import mongoose from "mongoose";
import * as walletRepository from "../../repositories/wallet.repository.js";
import * as transactionRepository from "../../repositories/transaction.repository.js";
import * as marketDataService from "../../modules/market-data/market-data.service.js";
import type { PortfolioResponse, AssetHolding, WalletHolding } from "./portfolio.types.js";

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function getPortfolio(userId: string): Promise<PortfolioResponse> {
  const wallets = await walletRepository.findAllPaginated(
    { userId: new mongoose.Types.ObjectId(userId) },
    { page: 1, limit: 1000, sort: { name: 1 } }
  );

  if (wallets.data.length === 0) {
    return {
      totalUsdValue: 0,
      assets: [],
      wallets: [],
    };
  }

  const transactions = await transactionRepository.findAllByUser(userId);

  const _walletIds = new Set(wallets.data.map(w => String(w._id)));

  const walletAssetMap = new Map<string, Map<string, { quantity: number; externalId: string; symbol: string; name: string }>>();

  for (const wallet of wallets.data) {
    walletAssetMap.set(String(wallet._id), new Map());
  }

  for (const tx of transactions) {
    const sourceId = tx.source?.id ? String(tx.source.id) : null;
    const destId = tx.destination?.id ? String(tx.destination.id) : null;
    const assetKey = tx.asset.externalId;
    const qty = tx.quantity;

    if (sourceId && walletAssetMap.has(sourceId)) {
      const assets = walletAssetMap.get(sourceId)!;
      const current = assets.get(assetKey) || { quantity: 0, externalId: tx.asset.externalId, symbol: tx.asset.symbol, name: tx.asset.name };
      current.quantity -= qty;
      assets.set(assetKey, current);
    }

    if (destId && walletAssetMap.has(destId)) {
      const assets = walletAssetMap.get(destId)!;
      const current = assets.get(assetKey) || { quantity: 0, externalId: tx.asset.externalId, symbol: tx.asset.symbol, name: tx.asset.name };
      current.quantity += qty;
      assets.set(assetKey, current);
    }
  }

  const uniqueAssets = new Map<string, { externalId: string; symbol: string; name: string }>();
  const walletResults: WalletHolding[] = [];

  for (const wallet of wallets.data) {
    const walletId = String(wallet._id);
    const assets = walletAssetMap.get(walletId) ?? new Map();
    const positiveAssets = Array.from(assets.values()).filter(a => a.quantity > 0);

    const walletHolding: WalletHolding = {
      walletId,
      walletName: wallet.name,
      usdValue: 0,
      percentage: 0,
    };

    for (const asset of positiveAssets) {
      uniqueAssets.set(asset.externalId, { externalId: asset.externalId, symbol: asset.symbol, name: asset.name });
    }

    walletResults.push(walletHolding);
  }

  const prices = await marketDataService.getPrices(Array.from(uniqueAssets.keys()));

  const assetMap = new Map<string, AssetHolding>();

  for (const [externalId, assetInfo] of uniqueAssets) {
    const price = prices.data[externalId];
    if (!price) continue;

    const existing = assetMap.get(externalId) || {
      externalId: assetInfo.externalId,
      symbol: assetInfo.symbol,
      name: assetInfo.name,
      quantity: 0,
      usdValue: 0,
      percentage: 0,
    };

    for (const wallet of wallets.data) {
      const walletId = String(wallet._id);
      const assets = walletAssetMap.get(walletId) ?? new Map();
      const asset = assets.get(externalId);
      if (asset && asset.quantity > 0) {
        existing.quantity = roundToTwo(existing.quantity + asset.quantity);
        existing.usdValue = roundToTwo(existing.usdValue + asset.quantity * price.priceUsd);
      }
    }

    assetMap.set(externalId, existing);
  }

  let totalUsdValue = 0;

  for (const holding of walletResults) {
    let walletUsdValue = 0;
    const walletId = holding.walletId;
    const assets = walletAssetMap.get(walletId) ?? new Map();

    for (const [externalId, asset] of assets) {
      if (asset.quantity <= 0) continue;
      const price = prices.data[externalId];
      if (price) {
        walletUsdValue = roundToTwo(walletUsdValue + asset.quantity * price.priceUsd);
      }
    }

    holding.usdValue = walletUsdValue;
    totalUsdValue = roundToTwo(totalUsdValue + walletUsdValue);
  }

  for (const holding of assetMap.values()) {
    if (totalUsdValue > 0) {
      holding.percentage = roundToTwo((holding.usdValue / totalUsdValue) * 100);
    } else {
      holding.percentage = 0;
    }
  }

  for (const holding of walletResults) {
    if (totalUsdValue > 0) {
      holding.percentage = roundToTwo((holding.usdValue / totalUsdValue) * 100);
    } else {
      holding.percentage = 0;
    }
  }

  const sortedAssets = Array.from(assetMap.values()).sort((a, b) => b.usdValue - a.usdValue);
  const sortedWallets = walletResults.sort((a, b) => b.usdValue - a.usdValue);

  return {
    totalUsdValue,
    assets: sortedAssets,
    wallets: sortedWallets,
  };
}
