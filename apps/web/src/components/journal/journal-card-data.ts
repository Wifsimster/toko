import type { JournalTag } from "@focusflow/validators";

export const tagConfig: Record<
  JournalTag,
  { labelKey: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  school: { labelKey: "tags.school", variant: "default" },
  victory: { labelKey: "tags.victory", variant: "default" },
  crisis: { labelKey: "tags.crisis", variant: "destructive" },
  medication: { labelKey: "tags.medication", variant: "secondary" },
  sleep: { labelKey: "tags.sleep", variant: "secondary" },
  sport: { labelKey: "tags.sport", variant: "outline" },
  therapy: { labelKey: "tags.therapy", variant: "outline" },
};
