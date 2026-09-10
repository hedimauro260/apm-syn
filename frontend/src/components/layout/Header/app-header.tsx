import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { clsx } from "clsx";
import { Menu } from 'lucide-react';
import { navigationSections } from "@/config/navigation";
import { HeaderMenu } from "@/components/layout/Header/header-menu";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";

import { HeaderLogo } from "@/components/layout/Header/header-logo";
import { HeaderNav } from "@/components/layout/Header/header-nav";
import { NotificationDropdown } from "@/components/layout/Header/notification-dropdown";
import { ProfileDropdown } from "@/components/layout/Header/profile-dropdown";
import { useScroll } from "@/hooks/use-scroll";
import { useWalletList } from "@/hooks/use-wallet-list";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { formatUSD } from "@/lib/formats";

interface AppHeaderProps {
    isLandingPage?: boolean;
}

export function AppHeader({ isLandingPage = false }: AppHeaderProps) {
    const scrolled = useScroll(0);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [shouldAnimateIn, setShouldAnimateIn] = useState(false);
    const location = useLocation();
    const { wallets, transactions } = useWalletList();
    const { totalBalance } = useWalletBalances(wallets, transactions);

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            setShouldAnimateIn(false);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setShouldAnimateIn(true);
                });
            });
        } else {
            setShouldAnimateIn(false);
            const timer = setTimeout(() => setMounted(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const openMenu = () => setIsOpen(true);
    const closeMenu = () => setIsOpen(false);

    // Extrai itens específicos para o header
    const headerNavItems = [
        navigationSections[0].items[0], // Overview
        navigationSections[0].items[1], // Portfolio
        navigationSections[1].items[0], // Websites
        navigationSections[1].items[1], // Wallets
        navigationSections[1].items[2], // Transactions
        navigationSections[1].items[3], // Goals
    ];

    return (
        <header
            className={clsx(
                "flex items-center justify-between fixed top-0 left-0 right-0 h-16 px-2 md:px-6 z-50 transition-all duration-200",
                scrolled
                    ? "bg-surface/80 backdrop-blur-md border-b border-border shadow-sm"
                    : "bg-transparent border-none border-transparent",
                isLandingPage && !scrolled && "bg-background/80 backdrop-blur-md border-b border-border/40"
            )}
        >
            {/* Left: Logo */}
            <HeaderLogo />

            {/* Mobile Header: Total Balance (Only if NOT landing page) */}
            {!isLandingPage && (
                <div className="flex items-center justify-center py-1.5 px-5 rounded-md bg-background border border-border md:hidden">
                    <p className="text-lg font-semibold text-foreground">
                        {formatUSD(totalBalance)}
                    </p>
                </div>
            )}

            {/* Mobile Header: Menu Icon */}
            {!isLandingPage && (
                <button
                    onClick={openMenu}
                    className="md:hidden">
                    <IconButton variant="ghost" size="sm" aria-label="Menu">
                        <Menu strokeWidth={1.5} className="w-8 h-8" />
                    </IconButton>
                </button>
            )}

            {/* Right: Navigation and Actions */}
            <div className={clsx("items-center gap-1", isLandingPage ? "flex" : "hidden md:flex")}>
                {isLandingPage ? (
                    <div className="flex items-center gap-4">
                        <Link to="/sign-in" className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors hidden sm:block">
                            Log in
                        </Link>
                        <Link to="/sign-up">
                            <Button size="sm" className="rounded-full px-5 font-medium shadow-sm">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Main Navigation */}
                        <HeaderNav items={headerNavItems} />

                        {/* Ações: Notificações */}

                        <NotificationDropdown />

                        {/* Separator */}
                        <div className="w-px h-8 bg-border mx-2" />

                        {/* Profile of the User */}
                        <ProfileDropdown />
                    </>
                )}
            </div>

            {/* Mobile Menu Overlay */}
            {!isLandingPage && mounted && (
                <div
                    className={clsx(
                        "md:hidden fixed inset-0 z-40 transition-opacity duration-300",
                        shouldAnimateIn ? "opacity-100" : "opacity-0"
                    )}
                >
                    <div
                        className={clsx(
                            "absolute inset-0 bg-black/50 transition-opacity duration-300",
                            shouldAnimateIn ? "opacity-100" : "opacity-0"
                        )}
                        onClick={closeMenu}
                    />
                    <div className={clsx(
                        "absolute inset-y-0 right-0 w-full h-screen bg-background transform transition-transform duration-300 ease-in-out",
                        shouldAnimateIn ? "translate-x-0" : "translate-x-full"
                    )}>
                        <HeaderMenu onClose={closeMenu} />
                    </div>
                </div>
            )}
        </header>
    );
}