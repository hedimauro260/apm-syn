import { cache, TTL_MS } from "../../services/cache.service.js";
import * as coingeckoService from "../../integrations/coingecko/coingecko.service.js";
import { CoinGeckoClientError } from "../../integrations/coingecko/coingecko.client.js";
import type { AssetMetadata, PriceSnapshot, ConversionResult, PriceMap } from "../../integrations/coingecko/coingecko.types.js";

interface MarketDataError extends Error {
  code: string;
}

function createMarketDataError(code: string, message: string): MarketDataError {
  const error = new Error(message) as MarketDataError;
  error.code = code;
  return error;
}

function isZodError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { name?: string }).name === "ZodError"
  );
}

export async function searchAssets(
  query: string
): Promise<{ data: AssetMetadata[] }> {
  const cacheKey = `search:${query.toLowerCase()}`;

  const cached = cache.get<AssetMetadata[]>(cacheKey);
  if (cached) {
    return { data: cached };
  }

  try {
    const results = await coingeckoService.searchAssets(query);
    cache.set(cacheKey, results, TTL_MS.SEARCH);
    return { data: results };
  } catch (err) {
    if (err instanceof CoinGeckoClientError) {
      throw createMarketDataError("MARKET_DATA_UNAVAILABLE", err.message);
    }
    if (isZodError(err)) {
      throw createMarketDataError(
        "MARKET_DATA_INVALID_RESPONSE",
        "Invalid search response from CoinGecko"
      );
    }
    throw createMarketDataError(
      "MARKET_DATA_UNAVAILABLE",
      err instanceof Error ? err.message : "Unknown market data error"
    );
  }
}

export async function getAsset(
  externalId: string
): Promise<{ data: AssetMetadata }> {
  const cacheKey = `asset:${externalId.toLowerCase()}`;

  const cached = cache.get<AssetMetadata>(cacheKey);
  if (cached) {
    return { data: cached };
  }

  try {
    const asset = await coingeckoService.getAsset(externalId);
    cache.set(cacheKey, asset, TTL_MS.ASSET);
    return { data: asset };
  } catch (err) {
    if (err instanceof CoinGeckoClientError) {
      if (err.statusCode === 404 || err.message.toLowerCase().includes("not found")) {
        throw createMarketDataError("MARKET_DATA_NOT_FOUND", `Asset not found: ${externalId}`);
      }
      throw createMarketDataError("MARKET_DATA_UNAVAILABLE", err.message);
    }
    if (isZodError(err)) {
      throw createMarketDataError(
        "MARKET_DATA_INVALID_RESPONSE",
        `Invalid asset detail response from CoinGecko: ${externalId}`
      );
    }
    throw createMarketDataError(
      "MARKET_DATA_UNAVAILABLE",
      err instanceof Error ? err.message : "Unknown market data error"
    );
  }
}

export async function getPrice(
  externalId: string
): Promise<{ data: PriceSnapshot }> {
  const cacheKey = `price:${externalId.toLowerCase()}`;

  const cached = cache.get<PriceSnapshot>(cacheKey);
  if (cached) {
    return { data: cached };
  }

  try {
    const price = await coingeckoService.getPrice(externalId);
    cache.set(cacheKey, price, TTL_MS.PRICE);
    return { data: price };
  } catch (err) {
    if (err instanceof CoinGeckoClientError) {
      if (err.statusCode === 429 || err.message.toLowerCase().includes("rate limit")) {
        throw createMarketDataError("MARKET_DATA_RATE_LIMITED", "CoinGecko rate limit exceeded");
      }
      if (err.statusCode === 404 || err.message.toLowerCase().includes("not found")) {
        throw createMarketDataError("MARKET_DATA_NOT_FOUND", `Price not found for: ${externalId}`);
      }
      throw createMarketDataError("MARKET_DATA_UNAVAILABLE", err.message);
    }
    if (isZodError(err)) {
      throw createMarketDataError(
        "MARKET_DATA_INVALID_RESPONSE",
        `Invalid price response from CoinGecko: ${externalId}`
      );
    }
    throw createMarketDataError(
      "MARKET_DATA_UNAVAILABLE",
      err instanceof Error ? err.message : "Unknown market data error"
    );
  }
}

export async function getPrices(
  externalIds: string[]
): Promise<{ data: PriceMap }> {
  const uniqueIds = Array.from(new Set(externalIds)).filter(id => id.trim().length > 0);

  const cachedEntries: Record<string, PriceSnapshot> = {};
  const missingIds: string[] = [];

  for (const id of uniqueIds) {
    const cached = cache.get<PriceSnapshot>(`price:${id.toLowerCase()}`);
    if (cached) {
      cachedEntries[id] = cached;
    } else {
      missingIds.push(id);
    }
  }

  if (missingIds.length > 0) {
    try {
      const prices = await coingeckoService.getPrices(missingIds);

      for (const [externalId, price] of Object.entries(prices) as [string, PriceSnapshot][]) {
        cache.set(`price:${externalId.toLowerCase()}`, price, TTL_MS.PRICE);
        cachedEntries[externalId] = price;
      }
    } catch (err) {
      if (err instanceof CoinGeckoClientError) {
        if (err.statusCode === 429 || err.message.toLowerCase().includes("rate limit")) {
          throw createMarketDataError("MARKET_DATA_RATE_LIMITED", "CoinGecko rate limit exceeded");
        }
        throw createMarketDataError("MARKET_DATA_UNAVAILABLE", err.message);
      }
      if (isZodError(err)) {
        throw createMarketDataError(
          "MARKET_DATA_INVALID_RESPONSE",
          "Invalid batch price response from CoinGecko"
        );
      }
      throw createMarketDataError(
        "MARKET_DATA_UNAVAILABLE",
        err instanceof Error ? err.message : "Unknown market data error"
      );
    }
  }

  return { data: cachedEntries };
}

export async function convertToUsd(
  externalId: string,
  quantity: number
): Promise<{ data: ConversionResult }> {
  const cacheKey = `price:${externalId.toLowerCase()}`;

  let priceSnapshot: PriceSnapshot;

  const cached = cache.get<PriceSnapshot>(cacheKey);
  if (cached) {
    priceSnapshot = cached;
  } else {
    try {
      priceSnapshot = await coingeckoService.getPrice(externalId);
      cache.set(cacheKey, priceSnapshot, TTL_MS.PRICE);
    } catch (err) {
      if (err instanceof CoinGeckoClientError) {
        if (err.statusCode === 429 || err.message.toLowerCase().includes("rate limit")) {
          throw createMarketDataError("MARKET_DATA_RATE_LIMITED", "CoinGecko rate limit exceeded");
        }
        if (err.statusCode === 404 || err.message.toLowerCase().includes("not found")) {
          throw createMarketDataError("MARKET_DATA_NOT_FOUND", `Asset not found: ${externalId}`);
        }
        throw createMarketDataError("MARKET_DATA_UNAVAILABLE", err.message);
      }
      if (isZodError(err)) {
        throw createMarketDataError(
          "MARKET_DATA_INVALID_RESPONSE",
          `Invalid price response from CoinGecko: ${externalId}`
        );
      }
      throw createMarketDataError(
        "MARKET_DATA_UNAVAILABLE",
        err instanceof Error ? err.message : "Unknown market data error"
      );
    }
  }

  const result: ConversionResult = {
    externalId,
    quantity,
    priceUsd: priceSnapshot.priceUsd,
    usdValue: quantity * priceSnapshot.priceUsd,
  };

  return { data: result };
}
