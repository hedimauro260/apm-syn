import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface AuthCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ icon: Icon, title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full rounded-2xl border border-border bg-surface shadow-2xl shadow-foreground/10 overflow-hidden">
      <div className="px-6 pt-8 pb-7 sm:px-9">
        <div className="mb-6 flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </span>
          <div className="min-w-0">
            <h1 className="font-space-grotesk text-xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-foreground-secondary">{subtitle}</p>
            )}
          </div>
        </div>

        {children}
      </div>

      {footer && (
        <div className="border-t border-border bg-surface-elevated/40 px-6 py-4 text-center text-sm sm:px-9">
          {footer}
        </div>
      )}
    </div>
  );
}