import { cva } from "class-variance-authority";

export const calloutVariants = cva(
  "flex gap-3 rounded-lg border px-4 py-3 text-sm leading-relaxed",
  {
    variants: {
      variant: {
        info: "border-info-border bg-info-surface text-info-foreground",
        tip: "border-info-border bg-info-surface text-info-foreground",
        warning: "border-warning-border bg-warning-surface text-warning-foreground",
        success: "border-success-border bg-success-surface text-success-foreground",
        danger: "border-danger-border bg-danger-surface text-danger-foreground",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);
