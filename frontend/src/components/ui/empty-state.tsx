import { type ReactNode } from "react";
import { clsx } from "clsx";
import { Inbox } from "lucide-react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-4 py-12 text-center",
        className
      )}
    >
      <div className="text-foreground-muted">
        {icon ?? <Inbox className="h-12 w-12" />}
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-foreground-secondary max-w-sm">{description}</p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}

export { EmptyState };
