import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-primary",
        secondary:
          "bg-surface-elevated text-foreground border border-border hover:bg-surface-elevated/80 focus-visible:ring-border",
        outline:
          "border border-border text-foreground bg-transparent hover:bg-surface-elevated focus-visible:ring-border",
        ghost:
          "text-foreground bg-transparent hover:bg-surface-elevated focus-visible:ring-border",
        danger:
          "bg-danger text-danger-foreground hover:bg-danger-hover focus-visible:ring-danger",
      },
      size: {
        xs: "h-6 px-2 text-xs",
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-primary",
        secondary:
          "bg-surface-elevated text-foreground border border-border hover:bg-surface-elevated/80 focus-visible:ring-border",
        outline:
          "border border-border text-foreground bg-transparent hover:bg-surface-elevated focus-visible:ring-border",
        ghost:
          "text-foreground bg-transparent hover:bg-surface-elevated focus-visible:ring-border",
        danger:
          "bg-danger text-danger-foreground hover:bg-danger-hover focus-visible:ring-danger",
      },
      size: {
        xs: "h-6 w-6",
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-surface-elevated text-foreground-secondary border border-border",
        primary:
          "bg-primary/10 text-primary border border-primary/20",
        success:
          "bg-success/10 text-success border border-success/20",
        warning:
          "bg-warning/10 text-warning border border-warning/20",
        danger:
          "bg-danger/10 text-danger border border-danger/20",
        info:
          "bg-info/10 text-info border border-info/20",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export const alertVariants = cva(
  "relative w-full rounded-xl border p-4 flex gap-3",
  {
    variants: {
      variant: {
        info: "bg-info/10 border-info/20 text-foreground",
        success: "bg-success/10 border-success/20 text-foreground",
        warning: "bg-warning/10 border-warning/20 text-foreground",
        danger: "bg-danger/10 border-danger/20 text-foreground",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);
