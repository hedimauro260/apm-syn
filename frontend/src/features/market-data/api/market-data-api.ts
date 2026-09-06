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

export async function searchAssets(token: string, q: string): Promise<{ data: MarketAsset[] }> {
  const path = `/market-data/assets/search?q=${encodeURIComponent(q)}`;
  return apiClient<{ data: MarketAsset[] }>(path, { token });
}

export async function convertToUsd(token: string, assetId: string, quantity: number): Promise<{ data: ConvertResult }> {
  const path = `/market-data/convert?assetId=${encodeURIComponent(assetId)}&quantity=${encodeURIComponent(String(quantity))}`;
  return apiClient<{ data: ConvertResult }>(path, { token });
}
