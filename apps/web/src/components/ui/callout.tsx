import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Lightbulb, AlertTriangle, CheckCircle2, Info, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { calloutVariants } from "./callout-variants";

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
      {Icon && <Icon className="mt-0.5 size-4 shrink-0" />}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export { Callout };
