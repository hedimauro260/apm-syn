export type Theme = "dark" | "light" | "system";
export type Language = "en" | "pt" | "es";
export type Currency = "USD" | "BRL" | "EUR" | "GBP" | "JPY";
export type NumberFormat = "dot-comma" | "comma-dot" | "space-comma";
export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
export type MarketRefreshInterval = "1" | "5" | "15" | "30" | "manual";
export type PriceChangePeriod = "24h" | "7d" | "30d";
export type AvatarId =
  | "initials"
  | "rocket"
  | "planet"
  | "sparkles"
  | "zap"
  | "shield"
  | "crown"
  | "moon"
  | "flame";

export interface UserSettings {
  general: {
    theme: Theme;
    language: Language;
    dateFormat: DateFormat;
    timezone: string;
  };
  financial: {
    currency: Currency;
    numberFormat: NumberFormat;
    marketData: {
      provider: string;
      refreshInterval: MarketRefreshInterval;
      autoRefresh: boolean;
      showMarketPrice: boolean;
      showPriceChange: PriceChangePeriod;
    };
  };
  notifications: {
    priceAlerts: boolean;
    goalReminders: boolean;
    weeklyReport: boolean;
    systemNotifications: boolean;
  };
  account: {
    avatar: AvatarId;
  };
}

export const DEFAULT_SETTINGS: UserSettings = {
  general: {
    theme: "system",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  financial: {
    currency: "USD",
    numberFormat: "dot-comma",
    marketData: {
      provider: "CoinGecko",
      refreshInterval: "5",
      autoRefresh: true,
      showMarketPrice: true,
      showPriceChange: "24h",
    },
  },
  notifications: {
    priceAlerts: true,
    goalReminders: true,
    weeklyReport: false,
    systemNotifications: true,
  },
  account: {
    avatar: "initials",
  },
};

export const APP_VERSION = "0.10.0";
export const API_VERSION = "v1";
export const SCHEMA_VERSION = "1.0.0";
