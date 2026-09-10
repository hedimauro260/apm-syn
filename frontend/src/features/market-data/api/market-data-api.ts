import { apiClient } from "@/services/api/client";

export interface MarketAsset {
  externalId: string;
  symbol: string;
  name: string;
  image?: string;
  currentPrice?: number;
}

export interface ConvertResult {
  externalId: string;
  quantity: number;
  priceUsd: number;
  usdValue: number;
}

export interface TickerQuote {
  externalId: string;
  symbol: string;
  name: string;
  currentPrice: number;
  changePercentage24h: number | null;
}

export async function searchAssets(token: string, q: string): Promise<{ data: MarketAsset[] }> {
  const path = `/market-data/assets/search?q=${encodeURIComponent(q)}`;
  return apiClient<{ data: MarketAsset[] }>(path, { token });
}

export async function getTicker(token: string, ids: string[]): Promise<{ data: TickerQuote[] }> {
  const path = `/market-data/assets/ticker?ids=${encodeURIComponent(ids.join(","))}`;
  return apiClient<{ data: TickerQuote[] }>(path, { token });
}

export async function convertToUsd(token: string, assetId: string, quantity: number): Promise<{ data: ConvertResult }> {
  const path = `/market-data/convert?assetId=${encodeURIComponent(assetId)}&quantity=${encodeURIComponent(String(quantity))}`;
  return apiClient<{ data: ConvertResult }>(path, { token });
}
