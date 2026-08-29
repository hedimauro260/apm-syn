import {
  LayoutDashboard,
  ChartNoAxesCombined,
  Globe,
  WalletCards,
  ArrowLeftRight,
  Target,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

export const navigationSections: NavigationSection[] = [
  {
    label: "Main",
    items: [
      { label: "Overview", to: "/app/overview", icon: LayoutDashboard },
      { label: "Portfolio", to: "/app/portfolio", icon: ChartNoAxesCombined },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Websites", to: "/app/websites", icon: Globe },
      { label: "Wallets", to: "/app/wallets", icon: WalletCards },
      { label: "Activities", to: "/app/activities", icon: ArrowLeftRight },
      { label: "Goals", to: "/app/goals", icon: Target },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", to: "/app/settings", icon: Settings }],
  },
];
