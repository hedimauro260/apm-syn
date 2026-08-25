import { z } from "zod";
import { coinGeckoGet, CoinGeckoClientError } from "./coingecko.client.js";
import {
  searchAssetsSchema,
  assetDetailSchema,
  priceDetailSchema,
} from "./coingecko.schemas.js";
import {
  normalizeSearchResponse,
  normalizeAssetDetail,
  normalizePriceResponse,
} from "./coingecko.normalizer.js";
import type { AssetMetadata, PriceSnapshot, ConversionResult, PriceMap } from "./coingecko.types.js";

export type CoinGeckoRawSearchResponse = z.infer<typeof searchAssetsSchema>;
export type CoinGeckoRawAssetResponse = z.infer<typeof assetDetailSchema>;
export type CoinGeckoRawPriceResponse = z.infer<typeof priceDetailSchema>;

export async function searchAssets(query: string): Promise<AssetMetadata[]> {
  if (!query || query.trim() === "") {
    return [];
  }

  try {
    const raw = await coinGeckoGet<CoinGeckoRawSearchResponse>("/search", { q: query });
    const parsed = searchAssetsSchema.parse(raw);
    return normalizeSearchResponse(parsed);
  } catch (err) {
    if (err instanceof CoinGeckoClientError) {
      throw err;
    }
    throw new CoinGeckoClientError(
      err instanceof Error ? err.message : "Invalid search response from CoinGecko"
    );
  }
}

export async function getAsset(externalId: string): Promise<AssetMetadata> {
  if (!externalId) {
    throw new CoinGeckoClientError("externalId is required");
  }

  try {
    const raw = await coinGeckoGet<unknown>(`/coins/${externalId}`, { localization: "false" });
    const parsed = assetDetailSchema.parse({
      id: (raw as { id: string }).id,
      symbol: (raw as { symbol: string }).symbol,
      name: (raw as { name: string }).name,
    });
    return normalizeAssetDetail(parsed);
  } catch (err) {
    if (err instanceof CoinGeckoClientError) {
      throw err;
    }
    if (err instanceof Error && (err.message.includes("not found") || err.message.includes("404"))) {
      throw new CoinGeckoClientError(`Asset not found: ${externalId}`, 404, false);
    }
    throw new CoinGeckoClientError(
      err instanceof Error ? err.message : "Invalid asset detail response from CoinGecko"
    );
  }
}

export async function getPrice(externalId: string): Promise<PriceSnapshot> {
  if (!externalId) {
    throw new CoinGeckoClientError("externalId is required");
  }

  try {
    const raw = await coinGeckoGet<CoinGeckoRawPriceResponse>("/simple/price", {
      ids: externalId,
      vs_currencies: "usd",
    });

    const parsed = priceDetailSchema.parse(raw);

    if (!parsed[externalId]) {
      throw new CoinGeckoClientError(`Price not found for ${externalId}`, 404, false);
    }

    return normalizePriceResponse(parsed, externalId);
  } catch (err) {
    if (err instanceof CoinGeckoClientError) {
      throw err;
    }
    if (err instanceof Error && err.message.includes("not found")) {
      throw new CoinGeckoClientError(`Price not found for: ${externalId}`, 404, false);
    }
    throw new CoinGeckoClientError(
      err instanceof Error ? err.message : "Invalid price response from CoinGecko"
    );
  }
}

export async function getPrices(externalIds: string[]): Promise<PriceMap> {
  if (!externalIds.length) {
    return {};
  }

  const ids = externalIds.join(",");

  try {
    const raw = await coinGeckoGet<CoinGeckoRawPriceResponse>("/simple/price", {
      ids,
      vs_currencies: "usd",
    });

    const parsed = priceDetailSchema.parse(raw);
    const result: PriceMap = {};

    for (const externalId of externalIds) {
      if (parsed[externalId]) {
        result[externalId] = normalizePriceResponse(parsed, externalId);
      }
    }

    return result;
  } catch (err) {
    if (err instanceof CoinGeckoClientError) {
      throw err;
    }
    throw new CoinGeckoClientError(
      err instanceof Error ? err.message : "Invalid batch price response from CoinGecko"
    );
  }
}

export async function convertToUsd(
  externalId: string,
  quantity: number
): Promise<ConversionResult> {
  const price = await getPrice(externalId);
  return {
    externalId,
    quantity,
    priceUsd: price.priceUsd,
    usdValue: quantity * price.priceUsd,
  };
}
