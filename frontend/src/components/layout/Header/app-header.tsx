import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { CloudDownload, Menu } from 'lucide-react';
import { navigationSections } from "@/config/navigation";
import { HeaderMenu } from "@/components/layout/Header/header-menu";
import { IconButton } from "@/components/ui/icon-button";

import { HeaderLogo } from "@/components/layout/Header/header-logo";
import { HeaderNav } from "@/components/layout/Header/header-nav";
import { NotificationDropdown } from "@/components/layout/Header/notification-dropdown";
import { ProfileDropdown } from "@/components/layout/Header/profile-dropdown";
import { useScroll } from "@/hooks/use-scroll";


export function AppHeader() {
    const scrolled = useScroll(0);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [shouldAnimateIn, setShouldAnimateIn] = useState(false);
    const location = useLocation();

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

    ];

    return (
        <header
            className={clsx(
                "flex items-center justify-between fixed top-0 left-0 right-0 h-16 px-2 md:px-6 z-50 transition-all duration-200",
                scrolled
                    ? "bg-surface/80 backdrop-blur-md border-b border-border shadow-sm"
                    : "bg-transparent border-none border-transparent"
            )}
        >
            {/* Left: Logo */}
            <HeaderLogo />

            {/* Mobile Header: Total Balance */}
            <div className="flex items-center justify-center py-1.5 px-5 rounded-md bg-background border border-border md:hidden">
                <p className="text-lg font-semibold text-foreground">
                    $15.000,00
                </p>
            </div>

            {/* Mobile Header: Menu Icon */}
            <button
                onClick={openMenu}
                className="md:hidden">
                <IconButton variant="ghost" size="sm" aria-label="Menu">
                    <Menu strokeWidth={1.5} className="w-8 h-8" />
                </IconButton>
            </button>

            {/* Right: Navigation and Actions */}
            <div className="hidden md:flex items-center gap-1">

                {/* Main Navigation */}
                <HeaderNav items={headerNavItems} />

                {/* Ações: Backup e Notificações */}
                <div className="flex items-center gap-1">
                    <IconButton variant="ghost" size="sm" aria-label="Backup">
                        <CloudDownload className="w-4 h-4" />
                    </IconButton>

                    <NotificationDropdown />
                </div>

                {/* Separator */}
                <div className="w-px h-8 bg-border mx-2" />

                {/* Profile of the User */}
                <ProfileDropdown />
            </div>
            {/* Mobile Menu Overlay */}
            {mounted && (
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