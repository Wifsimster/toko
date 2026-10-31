import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type AgeRange = "0-5" | "6-8" | "9-11" | "12-14" | "15-17"

export function formatAgeRange(ageRange: AgeRange | null | undefined): string {
  if (!ageRange) return ""
  return `${ageRange} ans`
}
