import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { User, Settings, Info, LogOut, ChevronDown } from "lucide-react";
import { useClickOutside } from "@/hooks/use-click-outside";

const profileMenuItems = [
    { label: "Profile", icon: User, href: "/app/settings" },
    { label: "Settings", icon: Settings, href: "/app/settings" },
    { label: "About", icon: Info, href: "#about" },
    { label: "Logout", icon: LogOut, href: "#logout", danger: true },
];

export function ProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useClickOutside(ref, () => setIsOpen(false));

    // TODO: Substituir por dados reais do Clerk/Auth
    const userName = "John Doe";
    const userEmail = "john@example.com";
    const userInitials = "JD";

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-surface-elevated transition-colors"
            >
                <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {userInitials}
                </div>
                <ChevronDown className="hidden md:block w-4 h-4 text-foreground-muted" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-surface-elevated shadow-lg py-2 z-50">
                    {/* Info do Usuário */}
                    <div className="flex items-center gap-3 px-4 pb-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                            {userInitials}
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-medium text-foreground leading-tight">
                                {userName}
                            </span>
                            <span className="text-xs text-foreground-muted leading-tight">
                                {userEmail}
                            </span>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="w-full h-px bg-border" />

                    {/* Itens do Menu */}
                    <div className="py-1">
                        {profileMenuItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.href}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                                    item.danger
                                        ? "text-danger hover:bg-danger/10"
                                        : "text-foreground-secondary hover:bg-surface hover:text-foreground"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}