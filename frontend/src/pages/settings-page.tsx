import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import {
  SettingsNav,
  type SettingsSection,
} from "./settings/settings-nav";
import { GeneralSettings } from "./settings/sections/general-settings";
import { FinancialSettings } from "./settings/sections/financial-settings";
import { NotificationsSettings } from "./settings/sections/notifications-settings";
import { AccountSettings } from "./settings/sections/account-settings";
import { DataSettings } from "./settings/sections/data-settings";
import { AdvancedSettings } from "./settings/sections/advanced-settings";
import {
  loadSettings,
  saveSettings,
  notifySettingsChanged,
} from "@/features/settings/storage";
import type { UserSettings } from "@/features/settings/types/settings.types";

const VALID_SECTIONS: SettingsSection[] = [
  "general",
  "financial",
  "notifications",
  "account",
  "data",
  "advanced",
];

function isSection(value: string | null): value is SettingsSection {
  return value !== null && (VALID_SECTIONS as string[]).includes(value);
}

type NestedRecord = Record<string, unknown>;

function setNestedValue(obj: UserSettings, path: string, value: unknown): UserSettings {
  const keys = path.split(".");
  const result: NestedRecord = { ...(obj as unknown as NestedRecord) };
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!;
    const child = current[key];
    current[key] = {
      ...(child !== null && typeof child === "object" && !Array.isArray(child)
        ? (child as NestedRecord)
        : {}),
    };
    current = current[key] as NestedRecord;
  }

  current[keys[keys.length - 1]!] = value;
  return result as unknown as UserSettings;
}

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const activeSection: SettingsSection = isSection(tabParam) ? tabParam : "general";
  const [settings, setSettings] = useState<UserSettings>(loadSettings);
  const { toast } = useToast();

  const handleSectionChange = useCallback(
    (section: SettingsSection) => {
      setSearchParams(section === "general" ? {} : { tab: section }, { replace: true });
    },
    [setSearchParams]
  );

  const handleUpdate = useCallback((path: string, value: unknown) => {
    setSettings((prev) => {
      const next = setNestedValue(prev, path, value);
      saveSettings(next);
      notifySettingsChanged();
      return next;
    });
  }, []);

  const handleClearCache = useCallback(() => {
    try {
      const keysToKeep = ["apm-syn-settings", "theme"];
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      }
      toast.success("Cache cleared", "Local cache has been cleared successfully.");
    } catch {
      toast.error("Failed to clear cache", "An error occurred while clearing the cache.");
    }
  }, [toast]);

  return (
    <div className="p-4">
      <PageHeader
        title="Settings"
        subtitle="Customize your APM SYN experience."
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 shrink-0">
          <SettingsNav active={activeSection} onChange={handleSectionChange} />
        </aside>

        <Separator orientation="vertical" className="hidden lg:block h-auto" />

        <main className="flex-1 min-w-0 max-w-3xl">
          {activeSection === "general" && (
            <GeneralSettings settings={settings} onUpdate={handleUpdate} />
          )}
          {activeSection === "financial" && (
            <FinancialSettings
              settings={settings}
              onUpdate={handleUpdate}
              onRefreshPrices={() =>
                toast.info("Refreshing prices", "Market data will update shortly.")
              }
            />
          )}
          {activeSection === "notifications" && (
            <NotificationsSettings settings={settings} onUpdate={handleUpdate} />
          )}
          {activeSection === "account" && (
            <AccountSettings settings={settings} onUpdate={handleUpdate} />
          )}
          {activeSection === "data" && (
            <DataSettings onClearCache={handleClearCache} />
          )}
          {activeSection === "advanced" && (
            <AdvancedSettings onClearCache={handleClearCache} />
          )}
        </main>
      </div>
    </div>
  );
}