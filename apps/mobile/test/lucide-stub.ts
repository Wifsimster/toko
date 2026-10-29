// Faux `lucide-react-native` pour les tests (vitest.config.mts) : chaque
// icône importée devient un composant nommé, comparable par identité.
const icon = (name: string) => Object.assign(() => null, { displayName: name });

export const Bath = icon("Bath");
export const BookOpen = icon("BookOpen");
export const Candy = icon("Candy");
export const Footprints = icon("Footprints");
export const Gamepad2 = icon("Gamepad2");
export const HandHeart = icon("HandHeart");
export const Headphones = icon("Headphones");
export const Heart = icon("Heart");
export const HeartHandshake = icon("HeartHandshake");
export const Moon = icon("Moon");
export const Music = icon("Music");
export const Palette = icon("Palette");
export const PawPrint = icon("PawPrint");
export const Pencil = icon("Pencil");
export const Puzzle = icon("Puzzle");
export const Rainbow = icon("Rainbow");
export const Smile = icon("Smile");
export const Sparkles = icon("Sparkles");
export const Star = icon("Star");
export const Tent = icon("Tent");
export const ToyBrick = icon("ToyBrick");
export const TreeDeciduous = icon("TreeDeciduous");
export const Tv = icon("Tv");
export const Volleyball = icon("Volleyball");
export const Wind = icon("Wind");
export type LucideIcon = ReturnType<typeof icon>;
