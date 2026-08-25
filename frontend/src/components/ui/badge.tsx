import { forwardRef, type HTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { badgeVariants } from "@/lib/variants";

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {dot && (
          <span
            className={clsx(
              "h-1.5 w-1.5 rounded-full",
              variant === "primary" && "bg-primary",
              variant === "success" && "bg-success",
              variant === "warning" && "bg-warning",
              variant === "danger" && "bg-danger",
              variant === "info" && "bg-info",
              variant === "default" && "bg-foreground-muted"
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
