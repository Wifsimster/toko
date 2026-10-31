import { crisisIconNameFor, type CrisisIconName } from "@focusflow/mo/crisis-icons";
import { ITEM_ICON_COMPONENTS, itemIconKeyFor } from "@/lib/item-icons";
import {
  Bath,
  BookOpen,
  Candy,
  Footprints,
  Gamepad2,
  HandHeart,
  Headphones,
  Heart,
  HeartHandshake,
  Moon,
  Music,
  Palette,
  PawPrint,
  Pencil,
  Puzzle,
  Rabbit,
  Rainbow,
  Smile,
  Sparkles,
  Star,
  Tent,
  TreeDeciduous,
  Tv,
  Volleyball,
  Wind,
  type LucideIcon,
} from "lucide-react";

export const CRISIS_ICONS: Record<CrisisIconName, LucideIcon> = {
  Bath,
  BookOpen,
  Candy,
  Footprints,
  Gamepad2,
  HandHeart,
  Headphones,
  Heart,
  HeartHandshake,
  Moon,
  Music,
  Palette,
  PawPrint,
  Pencil,
  Puzzle,
  Rabbit,
  Rainbow,
  Smile,
  Sparkles,
  Star,
  Tent,
  TreeDeciduous,
  Tv,
  Volleyball,
  Wind,
};

export function iconFor({ emoji }: { emoji?: string | null }): LucideIcon {
  return CRISIS_ICONS[crisisIconNameFor(emoji)];
}

export function itemIconFor(value: string | null | undefined): LucideIcon {
  const key = itemIconKeyFor(value);
  return key ? ITEM_ICON_COMPONENTS[key] : iconFor({ emoji: value });
}
