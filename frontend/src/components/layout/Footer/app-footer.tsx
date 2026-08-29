import { Heart } from "lucide-react";


export function AppFooter() {
    const currentYear = new Date().getFullYear();

    const footorItems = [
        { label: "About", to: "/about" },
        { label: "Terms", to: "/terms" },
        { label: "Support", to: "/support" },
    ];

    return (
        <footer className="space-y-2 px-6 py-6 border-t border-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <p className="order-2 md:order-1 flex items-center text-[10px] text-text-muted">
                    © {currentYear} - Made <Heart color="#ef4444" fill="#ef4444" className="h-4 w-4 mx-1" /> <span className=" text-text-primary font-medium"> by Kubo Labs</span>
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