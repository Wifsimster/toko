import { db, barkleyBehaviors, barkleyRewards } from "@focusflow/db";

// Starter pack — seeded on child creation so the Barkley token board is
// usable out of the box. Parents can edit / delete / extend after.
const DEFAULT_BEHAVIORS: {
  name: string;
  icon: string;
  sortOrder: number;
}[] = [
  { name: "Je me brosse les dents", icon: "🪥", sortOrder: 0 },
  { name: "Je fais mes devoirs", icon: "📚", sortOrder: 1 },
  { name: "Je range mes affaires", icon: "🎒", sortOrder: 2 },
  { name: "J'écoute les consignes", icon: "👂", sortOrder: 3 },
  { name: "Je reste calme", icon: "🧘", sortOrder: 4 },
];

const DEFAULT_REWARDS: {
  name: string;
  icon: string;
  starsRequired: number;
  sortOrder: number;
}[] = [
  { name: "Choisir l'histoire du soir", icon: "📖", starsRequired: 5, sortOrder: 0 },
  { name: "Temps d'écran bonus", icon: "🎮", starsRequired: 15, sortOrder: 1 },
  { name: "Sortie spéciale", icon: "🎉", starsRequired: 40, sortOrder: 2 },
];

export async function seedBarkleyStarterPack(childId: string): Promise<void> {
  await db.insert(barkleyBehaviors).values(
    DEFAULT_BEHAVIORS.map((b) => ({ ...b, childId, points: 1, active: true }))
  );
  await db.insert(barkleyRewards).values(
    DEFAULT_REWARDS.map((r) => ({ ...r, childId }))
  );
}
