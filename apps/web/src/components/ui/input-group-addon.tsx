"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { inputGroupAddonVariants } from "./input-group-addon-variants"

export function InputGroupAddon({
  className,
  align = "inline-start",
  onClick,
  onKeyDown,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) {
      return
    }
    e.currentTarget.parentElement?.querySelector("input")?.focus()
    onClick?.(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.currentTarget.parentElement?.querySelector("input")?.focus()
    }
    onKeyDown?.(e)
  }

  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
}
