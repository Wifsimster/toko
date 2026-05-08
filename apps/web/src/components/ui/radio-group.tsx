import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";

import { cn } from "@/lib/utils";

// Thin shadcn-style wrapper around base-ui's RadioGroup. We expose the
// behavior (arrow-key navigation, focus management, controlled value)
// without prescribing the visual — the dialog using it renders the items
// as button-cards rather than the classic dot-radio. Default styles only
// add the focus-visible ring; consumers add their own selected/idle look.

function RadioGroup<Value = string>({
  className,
  ...props
}: RadioGroupPrimitive.Props<Value>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid gap-2", className)}
      {...props}
    />
  );
}

interface RadioGroupItemProps extends RadioPrimitive.Root.Props {
  /** Visual content rendered inside the item (label, icon, etc.) */
  children?: React.ReactNode;
}

function RadioGroupItem({
  className,
  children,
  ...props
}: RadioGroupItemProps) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "relative cursor-pointer select-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
