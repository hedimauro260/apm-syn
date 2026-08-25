import { type ReactNode } from "react";
import { clsx } from "clsx";
import { TriangleAlert } from "lucide-react";

export interface ErrorStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

function ErrorState({ icon, title, description, action, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={clsx(
        "flex flex-col items-center justify-center gap-4 py-12 text-center",
        className
      )}
    >
      <div className="text-danger">
        {icon ?? <TriangleAlert className="h-12 w-12" />}
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

export { ErrorState };
