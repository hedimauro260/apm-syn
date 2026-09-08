import { List, Wallet, Globe } from "lucide-react";
import type { ActivitiesScope } from "./activities-utils";

const OPTIONS: { value: ActivitiesScope; label: string; icon: typeof List }[] = [
  { value: "all", label: "All", icon: List },
  { value: "wallets", label: "Wallets", icon: Wallet },
  { value: "websites", label: "Websites", icon: Globe },
];

export function ActivitiesScopeTabs({
  value,
  onChange,
}: {
  value: ActivitiesScope;
  onChange: (value: ActivitiesScope) => void;
}) {
  return (
    <div className="mb-4 flex w-fit items-center overflow-hidden rounded-lg border border-border divide-x divide-border">
      {OPTIONS.map(option => {
        const Icon = option.icon;
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium transition-colors ${
              isActive
                ? "bg-surface-elevated text-foreground"
                : "text-foreground-muted hover:text-foreground hover:bg-surface-elevated/50"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}