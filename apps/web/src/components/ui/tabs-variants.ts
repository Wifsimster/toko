import { cva } from "class-variance-authority"

export const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit max-w-full items-center justify-center overflow-x-auto rounded-lg p-[3px] text-muted-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden group-data-horizontal/tabs:h-10 md:group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
