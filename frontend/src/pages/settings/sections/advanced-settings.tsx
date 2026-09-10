import {
  HardDrive,
  Trash2,
  Bug,
  Clock,
  Globe,
  Zap,
} from "lucide-react";
import { SettingsSection, SettingsGroup, SettingsRow } from "../settings-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { env } from "@/config/env";
import {
  APP_VERSION,
  API_VERSION,
  SCHEMA_VERSION,
} from "@/features/settings/types/settings.types";

interface AdvancedSettingsProps {
  onClearCache?: () => void;
}

function StatusDot({ status }: { status: "ok" | "warning" | "error" }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${
        status === "ok"
          ? "bg-success"
          : status === "warning"
          ? "bg-warning"
          : "bg-danger"
      }`}
    />
  );
}

export function AdvancedSettings({ onClearCache }: AdvancedSettingsProps) {
  return (
    <SettingsSection
      title="Advanced"
      description="Technical information and debug tools. Visible to developers and support."
    >
      <SettingsGroup title="API Status">
        <SettingsRow label="API connection" description="Backend API reachability.">
          <div className="flex items-center gap-2">
            <StatusDot status="ok" />
            <Badge variant="success">Connected</Badge>
          </div>
        </SettingsRow>

        <SettingsRow label="API endpoint" description="Configured backend URL.">
          <code className="text-xs font-mono text-foreground-secondary bg-background px-2 py-1 rounded border border-border">
            {env.apiUrl}
          </code>
        </SettingsRow>

        <SettingsRow label="Last synchronization" description="Most recent data sync.">
          <span className="text-sm text-foreground-secondary flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Just now
          </span>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Market Data Status">
        <SettingsRow label="Provider" description="Market data source.">
          <Badge variant="info">
            <Globe className="h-3 w-3" />
            CoinGecko
          </Badge>
        </SettingsRow>

        <SettingsRow label="Service status" description="CoinGecko API availability.">
          <div className="flex items-center gap-2">
            <StatusDot status="ok" />
            <Badge variant="success">Operational</Badge>
          </div>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Cache">
        <SettingsRow
          label="Cache status"
          description="Local browser cache for API responses."
        >
          <Badge variant="default">
            <HardDrive className="h-3 w-3" />
            Active
          </Badge>
        </SettingsRow>

        <SettingsRow
          label="Clear cache"
          description="Purge all cached API responses and force fresh data."
        >
          <Button variant="outline" size="sm" className="text-xs" onClick={onClearCache}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear cache
          </Button>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="System Information">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-muted">Application</span>
              <span className="text-sm font-medium text-foreground">APM SYN</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-muted">Version</span>
              <Badge variant="default">{APP_VERSION}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-muted">API version</span>
              <Badge variant="default">{API_VERSION}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-muted">Environment</span>
              <Badge variant={env.appEnv === "production" ? "success" : "warning"}>
                <Zap className="h-3 w-3" />
                {env.appEnv}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-muted">Schema version</span>
              <Badge variant="default">{SCHEMA_VERSION}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-muted">Runtime</span>
              <Badge variant="default">Browser</Badge>
            </div>
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Debug">
        <SettingsRow
          label="Debug mode"
          description="Enable verbose logging in the browser console."
        >
          <input
            type="checkbox"
            className="h-4 w-4 shrink-0 rounded border border-border bg-surface accent-primary"
          />
        </SettingsRow>

        <SettingsRow
          label="Error reporting"
          description="Send anonymous error reports to help improve the application."
        >
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 shrink-0 rounded border border-border bg-surface accent-primary"
          />
        </SettingsRow>

        <SettingsRow
          label="Export debug info"
          description="Download a JSON file with system and configuration details."
        >
          <Button variant="ghost" size="sm" className="text-xs">
            <Bug className="h-3.5 w-3.5" />
            Export debug file
          </Button>
        </SettingsRow>
      </SettingsGroup>
    </SettingsSection>
  );
}
