import { useState } from "react";
import {
  Download,
  Upload,
  FileJson,
  FileText,
  Trash2,
  Database,
  Wallet,
  Globe,
  Target,
  User,
} from "lucide-react";
import { SettingsSection, SettingsGroup, SettingsRow } from "../settings-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SCHEMA_VERSION } from "@/features/settings/types/settings.types";

interface DataSettingsProps {
  onClearCache?: () => void;
}

interface ExportItem {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  format: "json" | "csv";
  action: () => void;
}

export function DataSettings({ onClearCache }: DataSettingsProps) {
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");

  const handleExport = (type: string) => {
    console.log(`Export ${type} as ${exportFormat}`);
  };

  const exportItems: ExportItem[] = [
    {
      label: "Wallets",
      description: "All wallets and their configurations",
      icon: Wallet,
      format: exportFormat,
      action: () => handleExport("wallets"),
    },
    {
      label: "Transactions",
      description: "Complete transaction history",
      icon: FileText,
      format: exportFormat,
      action: () => handleExport("transactions"),
    },
    {
      label: "Websites",
      description: "Tracked websites and earnings data",
      icon: Globe,
      format: exportFormat,
      action: () => handleExport("websites"),
    },
    {
      label: "Goals",
      description: "Savings goals and progress",
      icon: Target,
      format: exportFormat,
      action: () => handleExport("goals"),
    },
    {
      label: "Full account data",
      description: "Everything in your account",
      icon: User,
      format: exportFormat,
      action: () => handleExport("all"),
    },
  ];

  return (
    <SettingsSection
      title="Data"
      description="Export, import, and manage your application data."
    >
      <SettingsGroup title="Export data">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-foreground-muted">Format:</span>
            <div className="flex gap-1">
              <Button
                variant={exportFormat === "json" ? "primary" : "ghost"}
                size="xs"
                onClick={() => setExportFormat("json")}
              >
                <FileJson className="h-3.5 w-3.5" />
                JSON
              </Button>
              <Button
                variant={exportFormat === "csv" ? "primary" : "ghost"}
                size="xs"
                onClick={() => setExportFormat("csv")}
              >
                <FileText className="h-3.5 w-3.5" />
                CSV
              </Button>
            </div>
          </div>

          {exportItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center justify-between gap-4 py-3 ${
                  i < exportItems.length - 1 ? "border-b border-border-subtle" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4 w-4 shrink-0 text-foreground-muted" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-foreground-muted">{item.description}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs shrink-0"
                  onClick={item.action}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            );
          })}
        </div>
      </SettingsGroup>

      <SettingsGroup title="Import data">
        <SettingsRow
          label="Import from file"
          description="Restore data from a previously exported JSON or CSV file."
        >
          <Button variant="outline" size="sm" className="text-xs">
            <Upload className="h-3.5 w-3.5" />
            Import
          </Button>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Cache">
        <SettingsRow
          label="Clear local cache"
          description="Remove cached data to free up space. This will not delete your saved data."
        >
          <Button variant="outline" size="sm" className="text-xs" onClick={onClearCache}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear cache
          </Button>
        </SettingsRow>

        <SettingsRow
          label="Reset preferences"
          description="Reset all application preferences to their default values."
        >
          <Button variant="danger" size="sm" className="text-xs">
            <Trash2 className="h-3.5 w-3.5" />
            Reset
          </Button>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Data version">
        <SettingsRow
          label="Schema version"
          description="Current data schema version. Used for future migrations."
        >
          <Badge variant="default">
            <Database className="h-3 w-3" />
            {SCHEMA_VERSION}
          </Badge>
        </SettingsRow>
      </SettingsGroup>
    </SettingsSection>
  );
}
