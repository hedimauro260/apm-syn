import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "./icon-button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={cn(
          "relative w-full max-w-lg max-h-[90vh] overflow-auto rounded-xl border border-border bg-surface shadow-lg flex flex-col",
          className,
        )}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-3 shrink-0">
          <div className="flex flex-col gap-1">
            <h2 id="dialog-title" className="text-lg font-semibold text-foreground tracking-tight">
              {title}
            </h2>
            {description && <p className="text-xs text-foreground-muted">{description}</p>}
          </div>
          <IconButton variant="ghost" size="sm" aria-label="Close dialog" onClick={onClose} className="shrink-0">
            <X />
          </IconButton>
        </div>
        <div className="px-6 pb-6 flex-1 overflow-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
