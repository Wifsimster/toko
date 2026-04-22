import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getChildEmoji(gender?: "male" | "female" | "other" | null): string {
  if (gender === "male") return "👦"
  if (gender === "female") return "👧"
  return "👶"
}

export type AgeRange = "0-5" | "6-8" | "9-11" | "12-14" | "15-17"

export function formatAgeRange(ageRange: AgeRange | null | undefined): string {
  if (!ageRange) return ""
  return `${ageRange} ans`
}
