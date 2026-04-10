import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Lightbulb, AlertTriangle, CheckCircle2, Info, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const calloutVariants = cva(
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

const defaultIcons: Record<NonNullable<VariantProps<typeof calloutVariants>["variant"]>, LucideIcon> = {
  info: Info,
  tip: Lightbulb,
  warning: AlertTriangle,
  success: CheckCircle2,
  danger: AlertTriangle,
};

type CalloutProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof calloutVariants> & {
    icon?: LucideIcon | false;
  };

function Callout({ className, variant, icon, children, ...props }: CalloutProps) {
  const resolved = variant ?? "info";
  const Icon = icon === false ? null : (icon ?? defaultIcons[resolved]);

  return (
    <div className={cn(calloutVariants({ variant }), className)} {...props}>
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0" />}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export { Callout, calloutVariants };
