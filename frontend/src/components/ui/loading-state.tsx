import { type ReactNode } from "react";
import { clsx } from "clsx";
import { Spinner } from "./spinner";

export interface LoadingStateProps {
  children?: ReactNode;
  className?: string;
}

function LoadingState({ children, className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        "flex flex-col items-center justify-center gap-3 py-12 text-foreground-secondary",
        className
      )}
    >
      <Spinner size="lg" />
      {children && <p className="text-sm">{children}</p>}
    </div>
  );
}

export { LoadingState };
