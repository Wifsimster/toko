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

export function formatChildAge(birthDate: string): string {
  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) return ""

  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()

  if (now.getDate() < birth.getDate()) months--
  if (months < 0) {
    years--
    months += 12
  }

  if (years < 1) return months <= 1 ? "1 mois" : `${months} mois`
  if (years === 1 && months === 0) return "1 an"
  if (years < 2) return `${12 + months} mois`
  return `${years} ans`
}
