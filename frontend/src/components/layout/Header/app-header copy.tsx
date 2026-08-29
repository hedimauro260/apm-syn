import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import logo from "@/assets/images/logo_transparent.webp";
import { IconButton } from "@/components/ui/icon-button";
import { navigationSections } from "@/config/navigation";
import {
    User,
    Settings,
    Info,
    LogOut,
    Database,
    Bell,
    ChevronDown,
} from "lucide-react";

export function AppHeader() {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleScroll() {
            setScrolled(window.scrollY > 0);
        }

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Extrai itens específicos para o header (Dashboard, Wallets, Transactions, Portfolio)
    const navItems = [
        navigationSections[0].items[0], // Dashboard
        navigationSections[1].items[0], // Websites
        navigationSections[1].items[1], // Wallets
        navigationSections[1].items[2], // Transactions
        navigationSections[0].items[1], // Portfolio
    ];

    const profileMenuItems = [
        { label: "Profile", icon: User, href: "/app/settings" },
        { label: "Settings", icon: Settings, href: "/app/settings" },
        { label: "About", icon: Info, href: "#about" },
        { label: "Logout", icon: LogOut, href: "#logout", danger: true },
    ];

    return (
        <header
            className={clsx(
                "flex items-center justify-between fixed top-0 left-0 right-0 h-16 px-6 z-50 transition-colors",
                scrolled
                    ? "bg-surface/80 backdrop-blur-md border-b border-border"
                    : "bg-transparent border- border-transparent"
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10">
                    <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
                </div>
                <div className="flex flex-col">
                    <span className="font-mono text-lg font-bold text-foreground leading-tight">
                        APM SYN
                    </span>
                    <span className="text-[10px] text-foreground-muted leading-tight">
                        Asset Portfolio Manager
                    </span>
                </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-1">
                {/* Navigation bar - usando navigationSections */}
                <nav className="flex items-center gap-1 mr-3">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={clsx(
                                    "px-2.5 py-1.5 text-xs font-size-lg rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary text-white"
                                        : "text-foreground-secondary hover:bg-surface-elevated hover:text-foreground"
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Actions: backup e notifications */}
                <div className="flex items-center gap-1">
                    <IconButton variant="ghost" size="sm" aria-label="Backup">
                        <Database className="w-4 h-4" />
                    </IconButton>

                    <div ref={notificationsRef} className="relative">
                        <IconButton
                            variant="ghost"
                            size="sm"
                            aria-label="Notifications"
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        >
                            <Bell className="w-4 h-4" />
                        </IconButton>
                        {isNotificationsOpen && (
                            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-surface-elevated shadow-lg py-2 z-50">
                                <div className="px-4 py-2 border-b border-border-subtle">
                                    <p className="text-sm font-semibold text-foreground">
                                        Notifications
                                    </p>
                                </div>
                                <div className="px-4 py-3 text-sm text-foreground-muted">
                                    No new notifications
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Separator */}
                <div className="w-px h-6 bg-border mx-2" />

                {/* Profile */}
                <div ref={profileRef} className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-surface-elevated transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                            JD
                        </div>
                        <ChevronDown className="w-4 h-4 text-foreground-muted" />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 px-4 py-5 mt-2 w-56 rounded-xl border border-border bg-surface-elevated shadow-lg z-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                                    JD
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium text-foreground leading-tight">
                                        John Doe
                                    </span>
                                    <span className="text-xs text-foreground-muted leading-tight">
                                        john@example.com
                                    </span>
                                </div>
                            </div>
                            <div className="w-full h-px bg-border mb-3" />
                            {profileMenuItems.map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.href}
                                    className={clsx(
                                        "flex items-center gap-3 px-2 py-2 text-sm transition-colors",
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
                    )}
                </div>
            </div>
        </header>
    );
}