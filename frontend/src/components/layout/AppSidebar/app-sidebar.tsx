import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CalendarCheck,
  WalletMinimal,
  LogOut,
  Sun,
  Moon,
  LucideProvider,
} from "lucide-react";
import { navigationSections } from "@/config/navigation";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  TooltipPortal,
} from "@/components/ui/custom-tooltip";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      return saved === "dark";
    }
    return document.documentElement.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const allNavItems = navigationSections.flatMap((section) => section.items);

  const topIcons = [
    { icon: CalendarCheck, label: "Calendar" },
    { icon: WalletMinimal, label: "Wallets" },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <LucideProvider strokeWidth={1} className="w-4.5 h-4.5">
        <aside className="fixed -left-18 top-16 bottom-0 w-16 h-[calc(100vh-4rem)] ml-3 py-6 flex flex-col items-center md:left-0 transition-all duration-200">
          <div className="flex flex-col h-full items-center">
            {/* TOP: Ícones fixos */}
            <div className="flex flex-col items-center space-y-4 pb-4 border-b border-border/50">
              {topIcons.map(({ icon: Icon, label }) => (
                <TooltipRoot key={label}>
                  <TooltipTrigger asChild>
                    <button className="p-0 rounded-lg hover:bg-foreground/5 transition-colors">
                      <Icon className="text-foreground-muted hover:text-foreground transition-colors" />
                    </button>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent side="right" className="flex items-center gap-1">
                      <span>{label}</span>
                      <span className="text-foreground-muted/50 text-[10px]">⌘</span>
                    </TooltipContent>
                  </TooltipPortal>
                </TooltipRoot>
              ))}
            </div>

            {/* CENTER: Navegação com tooltips */}
            <nav className="flex-1 flex flex-col items-center justify-center space-y-2 py-4">
              {allNavItems.map((item) => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;

                return (
                  <TooltipRoot key={item.to}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.to}
                        className={cn(
                          "relative p-2 rounded-lg transition-all duration-200",
                          "hover:bg-foreground/5",
                          isActive
                            ? "text-foreground bg-foreground/5"
                            : "text-foreground-muted hover:text-foreground"
                        )}
                      >
                        {isActive && (
                          <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-primary" />
                        )}
                        <Icon />
                      </Link>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent side="right" className="flex items-center gap-1">
                        <span>{item.label}</span>
                        <span className="text-foreground-muted/50 text-[10px]">
                          ⌘{item.label[0]}
                        </span>
                      </TooltipContent>
                    </TooltipPortal>
                  </TooltipRoot>
                );
              })}
            </nav>

            {/* BOTTOM: Theme Switcher + Logout */}
            <div className="flex flex-col items-center space-y-4 pt-4 border-t border-border/50">
              {/* Theme Switcher */}
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleTheme}
                    className={cn(
                      "relative w-8 h-8 rounded-lg transition-all duration-300",
                      "hover:bg-foreground/5",
                      "flex items-center justify-center"
                    )}
                    aria-label="Toggle theme"
                  >

                    {/* Ícones: Sol e Lua */}
                    <div className="relative w-6 h-6">
                      <Sun
                        className={cn(
                          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300",
                          isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
                        )}
                        style={{ color: "#3b82f6" }}
                      />
                      <Moon
                        className={cn(
                          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300",
                          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
                        )}
                        style={{ color: "#3b82f6" }}
                      />
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent side="right">
                    <span>{isDark ? "Light" : "Dark"} mode</span>
                  </TooltipContent>
                </TooltipPortal>
              </TooltipRoot>

              {/* Logout */}
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <button className="p-0 rounded-lg hover:bg-destructive/10 transition-colors group">
                    <LogOut className="text-foreground-muted group-hover:text-destructive transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent side="right" className="bg-destructive text-destructive-foreground">
                    <span>Sign out</span>
                  </TooltipContent>
                </TooltipPortal>
              </TooltipRoot>
            </div>
          </div>
        </aside>
      </LucideProvider>
    </TooltipProvider>
  );
}