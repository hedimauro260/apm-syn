import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}

export function DropdownMenu({ trigger, children, align = "right" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={clsx(
            "absolute z-50 mt-1 min-w-35 rounded-lg border border-border bg-surface py-1 shadow-lg",
            align === "right" ? "right-0" : "left-0"
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger";
}

export function DropdownMenuItem({ children, onClick, variant = "default" }: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      className={clsx(
        "w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-surface-elevated",
        variant === "danger" ? "text-danger" : "text-foreground"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
