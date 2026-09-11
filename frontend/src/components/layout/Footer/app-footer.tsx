import { Heart } from "lucide-react";
import { clsx } from "clsx";

interface AppFooterProps {
    isLandingPage?: boolean;
}

export function AppFooter({ isLandingPage = false }: AppFooterProps) {
    const currentYear = new Date().getFullYear();

    const footorItems = [
        { label: "About", to: "/app/about" },
        { label: "Terms", to: "/app/terms" },
        { label: "Support", to: "/app/support" },
    ];

    return (
        <footer className={clsx("space-y-2 px-6 py-6 border-t border-border", isLandingPage ? "bg-background mt-auto" : "")}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <p className="order-2 md:order-1 flex items-center text-[10px] text-foreground">
                    © {currentYear} - Made <Heart color="#ef4444" fill="#ef4444" className="h-4 w-4 mx-1" /> <span className="text-foreground font-medium"> by Kubo Labs</span>
                </p>
                <div className="order-1 md:order-2 flex items-center gap-6 md:gap-2">
                    {footorItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.to}
                            className="md:text-xs text-sm text-foreground-muted hover:text-foreground transition-colors"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    )
}