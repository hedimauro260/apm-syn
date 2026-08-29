import { useState, useRef } from "react";
import { Bell } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { useClickOutside } from "@/hooks/use-click-outside";

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useClickOutside(ref, () => setIsOpen(false));

    return (
        <div ref={ref} className="hidden md:flex relative">
            <IconButton
                variant="ghost"
                size="sm"
                aria-label="Notifications"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="w-4 h-4" />
            </IconButton>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-surface-elevated shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-border-subtle">
                        <p className="text-sm font-semibold text-foreground">Notifications</p>
                    </div>
                    <div className="px-4 py-3 text-sm text-foreground-muted">
                        No new notifications
                    </div>
                </div>
            )}
        </div>
    );
}