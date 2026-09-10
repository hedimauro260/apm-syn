import { SettingsSection, SettingsGroup, SettingsRow } from "../settings-section";
import type { UserSettings } from "@/features/settings/types/settings.types";

interface NotificationsSettingsProps {
  settings: UserSettings;
  onUpdate: (path: string, value: unknown) => void;
}

export function NotificationsSettings({ settings, onUpdate }: NotificationsSettingsProps) {
  const { notifications } = settings;

  const toggleOptions: {
    key: keyof typeof notifications;
    label: string;
    description: string;
  }[] = [
    {
      key: "priceAlerts",
      label: "Price alerts",
      description: "Get notified when assets reach your target prices.",
    },
    {
      key: "goalReminders",
      label: "Goal reminders",
      description: "Reminders to contribute to your active savings goals.",
    },
    {
      key: "weeklyReport",
      label: "Weekly report",
      description: "Receive a weekly summary of your portfolio performance.",
    },
    {
      key: "systemNotifications",
      label: "System notifications",
      description: "Important updates about the application and your account.",
    },
  ];

  return (
    <SettingsSection
      title="Notifications"
      description="Control which notifications you receive."
    >
      <SettingsGroup>
        {toggleOptions.map((opt, i) => (
          <SettingsRow
            key={opt.key}
            label={opt.label}
            description={opt.description}
            className={i < toggleOptions.length - 1 ? "pb-4 border-b border-border-subtle" : ""}
          >
            <input
              type="checkbox"
              checked={notifications[opt.key] as boolean}
              onChange={(e) => onUpdate(`notifications.${opt.key}`, e.target.checked)}
              className="h-4 w-4 shrink-0 rounded border border-border bg-surface accent-primary"
            />
          </SettingsRow>
        ))}
      </SettingsGroup>
    </SettingsSection>
  );
}
