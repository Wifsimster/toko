import * as React from "react"

import { cn } from "@/lib/utils"

// The base layout is a flex row so the common "icon + short text" label lines
// up on one baseline. A label that wraps a full sentence (or any inline
// markup: links, <strong>, <Trans/>) must override it with `block`, otherwise
// every text run and element becomes a separate flex column and the sentence
// is rendered as unreadable side-by-side blocks.
function Label({ className, htmlFor, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      htmlFor={htmlFor}
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
