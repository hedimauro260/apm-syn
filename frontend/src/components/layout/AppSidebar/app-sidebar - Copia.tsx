import { LucideProvider, WalletMinimal, CalendarCheck, LogOut } from "lucide-react";

export function AppSidebar() {
  return (
    <div className="fixed left-0 top-16 bottom-0 w-16 h-[calc(100vh-4rem)] ml-3 py-3 flex flex-col items-center">
      <LucideProvider strokeWidth={1} className="w-5 h-5">
        {/* section top: only icons: calendar, wallet */}
        <div className="flex flex-col items-center space-y-4 p-0">
          <CalendarCheck className="text-foreground-muted" />
          <WalletMinimal className="text-foreground-muted" />
        </div>
        {/* section center: navbar: only icons with tooltips */}
        <div className="flex-1"></div>
        {/* section bottom: theme switcher and icon logout */}
        <div className="">
          {/* TODO: theme switcher: vertical, minimalist */}
          <div className=""></div>
          <LogOut className="text-foreground-muted" />
        </div>
      </LucideProvider>
    </div>

  );
}