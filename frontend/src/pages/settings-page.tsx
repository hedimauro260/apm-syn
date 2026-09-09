import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ComponentType, type ReactNode } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Bell, Check, ChevronRight, CircleAlert, CloudDownload, Code2, Database, Download, FileJson, Globe2, HardDrive, Import, Languages, Monitor, Moon, Paintbrush, RefreshCw, RotateCcw, Save, Server, ShieldCheck, Sun, Trash2, Upload, UserRound, WalletCards } from "lucide-react";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Select } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { setTheme } from "@/lib/theme";
import { apiClient } from "@/services/api/client";
import type { PaginatedResponse } from "@/services/api/types";

type SectionId = "general" | "financial" | "notifications" | "account" | "data" | "advanced";
type Appearance = "light" | "dark" | "system";
type Language = "en" | "pt-BR";
type Region = "en-US" | "pt-BR" | "en-GB";
type Currency = "USD" | "EUR" | "BRL" | "GBP";
type NumberFormat = "standard" | "compact";
type PriceInterval = "1" | "5" | "15" | "30" | "manual";
type MarketVariation = "24h" | "7d" | "30d";
type ExportFormat = "json" | "csv";
type ExportScope = "preferences" | "full-account" | "transactions" | "wallets" | "websites" | "goals" | "debug-information";
type MarketStatus = "connected" | "refreshing";
type CacheStatus = "ready" | "cleared";

type Preferences = {
  appearance: Appearance;
  language: Language;
  region: Region;
  currency: Currency;
  numberFormat: NumberFormat;
  priceInterval: PriceInterval;
  autoRefresh: boolean;
  showMarketPrice: boolean;
  marketVariation: MarketVariation;
  productUpdates: boolean;
  priceAlerts: boolean;
  weeklyReport: boolean;
  goalReminders: boolean;
};

type Section = {
  id: SectionId;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

type AppearanceOption = {
  value: Appearance;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

type ExportCollection = PaginatedResponse<unknown>;

type ExportPayload = {
  schemaVersion: string;
  exportedAt: string;
  scope: ExportScope;
  profile: {
    id: string | null;
    name: string | null;
    email: string | null;
  };
  preferences: Preferences;
  data: Record<string, unknown>;
};

const PREFERENCES_KEY = "apm-syn.preferences";
const MARKET_UPDATE_KEY = "apm-syn.market-data.updated-at";
const SCHEMA_VERSION = "1.0.0";
const APPLICATION_VERSION = "1.0.0";
const API_VERSION = "v1";
const MARKET_PROVIDER = "CoinGecko";

const APPEARANCE_VALUES = ["light", "dark", "system"] as const;
const LANGUAGE_VALUES = ["en", "pt-BR"] as const;
const REGION_VALUES = ["en-US", "pt-BR", "en-GB"] as const;
const CURRENCY_VALUES = ["USD", "EUR", "BRL", "GBP"] as const;
const NUMBER_FORMAT_VALUES = ["standard", "compact"] as const;
const PRICE_INTERVAL_VALUES = ["1", "5", "15", "30", "manual"] as const;
const MARKET_VARIATION_VALUES = ["24h", "7d", "30d"] as const;

const defaults: Preferences = {
  appearance: "system",
  language: "en",
  region: "en-US",
  currency: "USD",
  numberFormat: "standard",
  priceInterval: "5",
  autoRefresh: true,
  showMarketPrice: true,
  marketVariation: "24h",
  productUpdates: true,
  priceAlerts: true,
  weeklyReport: false,
  goalReminders: true,
};

const sections: Section[] = [
  { id: "general", label: "General", description: "Appearance and regional options", icon: Paintbrush },
];
