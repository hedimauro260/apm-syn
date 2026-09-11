import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { format } from "date-fns";
import { SquareChevronRight, Sun, Moon, CloudDownload } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { navigationSections } from "@/config/navigation";
import { useWalletList } from "@/hooks/use-wallet-list";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { formatUSD } from "@/lib/formats";
import { UserAvatar } from "@/components/ui/user-avatar";

interface HeaderMenuProps {
    onClose: () => void;
}

export function HeaderMenu({ onClose }: HeaderMenuProps) {
    const currentDate = format(new Date(), "MMM dd, yyyy");
    const allNavItems = navigationSections.flatMap((section) => section.items);

    const { user } = useUser();
    const { wallets, transactions } = useWalletList();
    const { totalBalance } = useWalletBalances(wallets, transactions);

    const userName = user?.fullName || user?.firstName || "User";
    const userEmail = user?.primaryEmailAddress?.emailAddress || "";

    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem("theme");
        if (saved) return saved === "dark";
        return document.documentElement.classList.contains("dark") ||
            window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(isDark ? "dark" : "light");
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <div className="flex flex-col w-full h-screen bg-background text-foreground">
            {/* TOP: Perfil + Data + Balance */}
            <div className="flex flex-col px-4 py-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col gap-3">
                        <UserAvatar size="md" />
                        <div className="flex flex-col">
                            <span className="text-lg font-medium text-foreground">
                                {userName}
                            </span>
                            <span className="text-xs font-medium text-foreground-muted">
                                {userEmail}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2"
                        aria-label="Close menu"
                    >
                        <SquareChevronRight strokeWidth={1.5} className="w-8 h-8 text-foreground-muted" />
                    </button>
                </div>

                <div className="flex flex-col px-3 py-4 rounded-lg bg-surface-elevated border border-border">
                    <div className="flex flex-col">
                        <span className="text-xs text-foreground-muted">{currentDate}</span>
                    </div>
                    <div className="flex flex-col mt-2">
                        <span className="text-sm text-foreground-muted">Total Balance</span>
                        <span className="text-lg font-semibold text-primary">{formatUSD(totalBalance)}</span>
                    </div>
                </div>
            </div>

            {/* MIDDLE: Nav items em grid de 3 */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-3 gap-0">
                    {allNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className="flex flex-col items-center justify-center gap-2 p-3"
                                onClick={onClose}
                            >
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-elevated border border-border">
                                    <Icon className="w-6 h-6 text-primary" />
                                </div>
                                <span className="text-xs text-center text-foreground-secondary">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* BOTTOM: Theme toggle + Backup */}
            <div className="flex justify-center p-4 border-t border-border">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface"
                        aria-label="Toggle theme"
                    >
                        <div className="relative w-6 h-6">
                            <Sun
                                className={clsx(
                                    "absolute inset-0 transition-all duration-300",
                                    isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
                                )}
                                style={{ color: "#3b82f6" }}
                            />
                            <Moon
                                className={clsx(
                                    "absolute inset-0 transition-all duration-300",
                                    isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
                                )}
                                style={{ color: "#3b82f6" }}
                            />
                        </div>
                        <span className="text-sm text-foreground-secondary">
                            {isDark ? "Light" : "Dark"} mode
                        </span>
                    </button>

                    <button
                        className="flex items-center justify-center p-3 rounded-xl border border-border bg-surface hover:bg-surface-elevated transition-colors"
                        aria-label="Backup"
                    >
                        <CloudDownload className="w-6 h-6 text-foreground-muted" />
                    </button>
                </div>
            </div>
        </div>
    );
}
