import { useEffect } from "react";
import { SettingsSection, SettingsGroup, SettingsRow } from "../settings-section";
import { Select } from "@/components/ui/select";
import { setTheme } from "@/lib/theme";
import type { Theme, Language, DateFormat, UserSettings } from "@/features/settings/types/settings.types";

interface GeneralSettingsProps {
  settings: UserSettings;
  onUpdate: (path: string, value: unknown) => void;
}

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "pt", label: "Portugues" },
  { value: "es", label: "Espanol" },
];

const DATE_FORMAT_OPTIONS: { value: DateFormat; label: string }[] = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
];

const TIMEZONE_OPTIONS = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "UTC",
];

export function GeneralSettings({ settings, onUpdate }: GeneralSettingsProps) {
  useEffect(() => {
    if (settings.general.theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      setTheme(mq.matches ? "dark" : "light");
    } else {
      setTheme(settings.general.theme);
    }
    localStorage.setItem("theme", settings.general.theme);
  }, [settings.general.theme]);

  return (
    <SettingsSection
      title="General"
      description="Customize the application appearance and regional preferences."
    >
      <SettingsGroup title="Appearance">
        <SettingsRow
          label="Theme"
          description="Choose between light, dark, or system theme."
        >
          <Select
            value={settings.general.theme}
            onChange={(e) => {
              const val = e.target.value as Theme;
              onUpdate("general.theme", val);
              if (val !== "system") {
                setTheme(val);
                localStorage.setItem("theme", val);
              }
            }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </Select>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Language">
        <SettingsRow
          label="Language"
          description="Select your preferred language."
        >
          <Select
            value={settings.general.language}
            onChange={(e) => onUpdate("general.language", e.target.value as Language)}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Regional Format">
        <SettingsRow
          label="Date format"
          description="How dates are displayed throughout the app."
        >
          <Select
            value={settings.general.dateFormat}
            onChange={(e) => onUpdate("general.dateFormat", e.target.value as DateFormat)}
          >
            {DATE_FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </SettingsRow>
        <SettingsRow
          label="Timezone"
          description="Used for scheduling and time display."
        >
          <Select
            value={settings.general.timezone}
            onChange={(e) => onUpdate("general.timezone", e.target.value)}
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace("_", " ")}
              </option>
            ))}
          </Select>
        </SettingsRow>
      </SettingsGroup>
    </SettingsSection>
  );
}
