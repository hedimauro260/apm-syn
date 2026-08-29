import { cn } from "@/lib/utils";

interface SimpleTooltipProps {
    children: React.ReactNode;
    label: string;
    shortcut?: string;
    side?: "right" | "left" | "top" | "bottom";
    className?: string;
}

export function SimpleTooltip({
    children,
    label,
    shortcut,
    side = "right",
    className
}: SimpleTooltipProps) {
    return (
        <div className="relative inline-block group">
            {children}
            <div className={cn(
                "absolute z-50 px-2 py-1 text-xs rounded-md pointer-events-none",
                "bg-foreground text-background shadow-lg",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                "whitespace-nowrap",
                // Posicionamento
                side === "right" && "left-full top-1/2 -translate-y-1/2 ml-2",
                side === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
                side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
                side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
                className
            )}>
                {label}
                {shortcut && (
                    <span className="ml-2 text-foreground-muted/50 text-[10px]">
                        {shortcut}
                    </span>
                )}
                {/* Seta/Arrow com CSS puro */}
                <div className={cn(
                    "absolute w-2 h-2 bg-foreground rotate-45",
                    side === "right" && "-left-1 top-1/2 -translate-y-1/2",
                    side === "left" && "-right-1 top-1/2 -translate-y-1/2",
                    side === "top" && "-bottom-1 left-1/2 -translate-x-1/2",
                    side === "bottom" && "-top-1 left-1/2 -translate-x-1/2",
                )} />
            </div>
        </div>
    );
}