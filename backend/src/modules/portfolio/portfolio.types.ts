export type AssetHolding = {
  externalId: string;
  symbol: string;
  name: string;
  quantity: number;
  usdValue: number;
  percentage: number;
};

export type WalletHolding = {
  walletId: string;
  walletName: string;
  usdValue: number;
  percentage: number;
};

export type PortfolioResponse = {
  totalUsdValue: number;
  assets: AssetHolding[];
  wallets: WalletHolding[];
};
