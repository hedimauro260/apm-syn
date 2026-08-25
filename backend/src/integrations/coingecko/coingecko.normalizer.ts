import type { AssetMetadata, PriceSnapshot, ConversionResult } from "./coingecko.types.js";

import type { z } from "zod";
import type {
  searchAssetsSchema,
  assetDetailSchema,
  priceDetailSchema,
} from "./coingecko.schemas.js";

export function normalizeSearchResponse(
  raw: z.infer<typeof searchAssetsSchema>
): AssetMetadata[] {
  return raw.coins.map(coin => ({
    externalId: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
  }));
}

export function normalizeAssetDetail(
  raw: z.infer<typeof assetDetailSchema>
): AssetMetadata {
  return {
    externalId: raw.id,
    symbol: raw.symbol.toUpperCase(),
    name: raw.name,
  };
}

export function normalizePriceResponse(
  raw: z.infer<typeof priceDetailSchema>,
  externalId: string
): PriceSnapshot {
  const priceData = raw[externalId];
  if (!priceData || typeof priceData.usd !== "number") {
    throw new Error(`Invalid price response for ${externalId}`);
  }
  return {
    externalId,
    priceUsd: priceData.usd,
    updatedAt: new Date(),
  };
}

export function normalizeConversion(
  externalId: string,
  quantity: number,
  priceSnapshot: PriceSnapshot
): ConversionResult {
  return {
    externalId,
    quantity,
    priceUsd: priceSnapshot.priceUsd,
    usdValue: quantity * priceSnapshot.priceUsd,
  };
}