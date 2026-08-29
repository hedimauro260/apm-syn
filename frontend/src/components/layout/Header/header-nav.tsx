import { Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { navigationSections } from "@/config/navigation";

interface HeaderNavProps {
    items: typeof navigationSections[number]["items"];
}

export function HeaderNav({ items }: HeaderNavProps) {
    const location = useLocation();

    return (
        <nav className="flex items-center gap-1 mr-3">
            {items.map((item) => {
                const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                return (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={clsx(
                            "px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors",
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
    );
}