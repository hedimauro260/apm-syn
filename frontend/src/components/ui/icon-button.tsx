import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { iconButtonVariants } from "@/lib/variants";
import { Spinner } from "./spinner";

const iconSizeMap: Record<string, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
};

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size = "md", asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;
    const iconPx = iconSizeMap[size ?? "md"];

    return (
      <Comp
        className={clsx(iconButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        {...props}
      >
        {loading ? (
          <Spinner size={size === "lg" ? "md" : "sm"} aria-hidden="true" />
        ) : (
          <span className="[&>svg]:h-[--icon-size] [&>svg]:w-[--icon-size]" style={{ "--icon-size": `${iconPx}px` } as React.CSSProperties}>
            {children}
          </span>
        )}
      </Comp>
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton };
