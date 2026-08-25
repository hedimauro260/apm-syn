import { forwardRef, type HTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { Info, CheckCircle, TriangleAlert, CircleAlert } from "lucide-react";
import { alertVariants } from "@/lib/variants";

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: TriangleAlert,
  danger: CircleAlert,
};

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", children, ...props }, ref) => {
    const Icon = iconMap[variant ?? "info"];

    return (
      <div
        ref={ref}
        role="alert"
        className={clsx(alertVariants({ variant }), className)}
        {...props}
      >
        <Icon className="h-5 w-5 shrink-0 mt-0.5 text-foreground-secondary" aria-hidden="true" />
        <div className="flex-1">{children}</div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={clsx("font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={clsx("text-sm text-foreground-secondary mt-1", className)}
      {...props}
    />
  )
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
