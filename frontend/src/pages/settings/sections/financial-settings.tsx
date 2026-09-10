import { RefreshCw } from "lucide-react";
import { SettingsSection, SettingsGroup, SettingsRow } from "../settings-section";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  Currency,
  NumberFormat,
  MarketRefreshInterval,
  PriceChangePeriod,
  UserSettings,
} from "@/features/settings/types/settings.types";

interface FinancialSettingsProps {
  settings: UserSettings;
  onUpdate: (path: string, value: unknown) => void;
  onRefreshPrices?: () => void;
  lastUpdated?: string | null;
}

const CURRENCY_OPTIONS: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "BRL", label: "Brazilian Real", symbol: "R$" },
  { value: "EUR", label: "Euro", symbol: "\u20AC" },
  { value: "GBP", label: "British Pound", symbol: "\u00A3" },
  { value: "JPY", label: "Japanese Yen", symbol: "\u00A5" },
];

const NUMBER_FORMAT_OPTIONS: { value: NumberFormat; label: string; example: string }[] = [
  { value: "dot-comma", label: "1,234.56", example: "1,234.56" },
  { value: "comma-dot", label: "1.234,56", example: "1.234,56" },
  { value: "space-comma", label: "1 234,56", example: "1 234,56" },
];

const REFRESH_INTERVAL_OPTIONS: { value: MarketRefreshInterval; label: string }[] = [
  { value: "1", label: "1 minute" },
  { value: "5", label: "5 minutes" },
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "manual", label: "Manual only" },
];

const PRICE_CHANGE_OPTIONS: { value: PriceChangePeriod; label: string }[] = [
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

export function FinancialSettings({
  settings,
  onUpdate,
  onRefreshPrices,
  lastUpdated,
}: FinancialSettingsProps) {
  const { marketData } = settings.financial;

  return (
    <SettingsSection
      title="Financial"
      description="Configure currency display, number formatting, and market data settings."
    >
      <SettingsGroup title="Currency">
        <SettingsRow
          label="Preferred currency"
          description="Used for displaying values throughout the app."
        >
          <Select
            value={settings.financial.currency}
            onChange={(e) => onUpdate("financial.currency", e.target.value as Currency)}
          >
            {CURRENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.symbol} {opt.label}
              </option>
            ))}
          </Select>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Number Format">
        <SettingsRow
          label="Number format"
          description="How numbers are displayed (thousands and decimal separators)."
        >
          <Select
            value={settings.financial.numberFormat}
            onChange={(e) => onUpdate("financial.numberFormat", e.target.value as NumberFormat)}
          >
            {NUMBER_FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Market Data">
        <SettingsRow
          label="Provider"
          description="Market data source for cryptocurrency prices."
        >
          <Badge variant="info">{marketData.provider}</Badge>
        </SettingsRow>

        <SettingsRow
          label="Refresh interval"
          description="How often prices are updated automatically."
        >
          <Select
            value={marketData.refreshInterval}
            onChange={(e) =>
              onUpdate("financial.marketData.refreshInterval", e.target.value as MarketRefreshInterval)
            }
          >
            {REFRESH_INTERVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </SettingsRow>

        <SettingsRow
          label="Auto-refresh prices"
          description="Automatically fetch new prices at the configured interval."
        >
          <input
            type="checkbox"
            checked={marketData.autoRefresh}
            onChange={(e) => onUpdate("financial.marketData.autoRefresh", e.target.checked)}
            className="h-4 w-4 shrink-0 rounded border border-border bg-surface accent-primary"
          />
        </SettingsRow>

        <SettingsRow
          label="Show market price in assets"
          description="Display current USD price on asset cards."
        >
          <input
            type="checkbox"
            checked={marketData.showMarketPrice}
            onChange={(e) => onUpdate("financial.marketData.showMarketPrice", e.target.checked)}
            className="h-4 w-4 shrink-0 rounded border border-border bg-surface accent-primary"
          />
        </SettingsRow>

        <SettingsRow
          label="Price change period"
          description="Default period for showing price variation."
        >
          <Select
            value={marketData.showPriceChange}
            onChange={(e) =>
              onUpdate("financial.marketData.showPriceChange", e.target.value as PriceChangePeriod)
            }
          >
            {PRICE_CHANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </SettingsRow>

        <div className="pt-2 border-t border-border-subtle">
          <SettingsRow
            label="Last updated"
            description={lastUpdated ? new Date(lastUpdated).toLocaleString() : "Never"}
          >
            {onRefreshPrices && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefreshPrices}
                className="text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh now
              </Button>
            )}
          </SettingsRow>
        </div>
      </SettingsGroup>
    </SettingsSection>
  );
}
