import {
  Settings,
  DollarSign,
  Bell,
  User,
  Database,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SettingsSection =
  | "general"
  | "financial"
  | "notifications"
  | "account"
  | "data"
  | "advanced";

interface NavItem {
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "general", label: "General", icon: Settings },
  { id: "financial", label: "Financial", icon: DollarSign },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: User },
  { id: "data", label: "Data", icon: Database },
  { id: "advanced", label: "Advanced", icon: Terminal },
];

interface SettingsNavProps {
  active: SettingsSection;
  onChange: (section: SettingsSection) => void;
}

export function SettingsNav({ active, onChange }: SettingsNavProps) {
  return (
    <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible p-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-foreground-secondary hover:text-foreground hover:bg-surface-elevated"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
