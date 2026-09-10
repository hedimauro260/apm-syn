export type AssetMetadata = {
  externalId: string;
  symbol: string;
  name: string;
};

export type PriceSnapshot = {
  externalId: string;
  priceUsd: number;
  updatedAt: Date;
};

export type ConversionResult = {
  externalId: string;
  quantity: number;
  priceUsd: number;
  usdValue: number;
};

export type PriceMap = Record<string, PriceSnapshot>;

export type TickerQuote = {
  externalId: string;
  symbol: string;
  name: string;
  currentPrice: number;
  changePercentage24h: number | null;
};
