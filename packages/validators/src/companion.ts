import { z } from "zod";

// Recording a companion discovery. `animalId` is a stable key from the
// frontend critter catalog (e.g. "fox"); the API stores it verbatim and
// never needs to know its meaning, so a bounded string is enough.
export const recordCompanionDiscoverySchema = z.object({
  childId: z
    .string()
    .uuid({ message: "L'identifiant de l'enfant est invalide" }),
  animalId: z
    .string()
    .min(1, { message: "L'identifiant du compagnon est requis" })
    .max(64, {
      message: "L'identifiant du compagnon ne peut pas dépasser 64 caractères",
    }),
});

export const companionDiscoverySchema = z.object({
  id: z.string().uuid(),
  childId: z.string().uuid(),
  animalId: z.string(),
  discoveredAt: z.string().datetime(),
});

export type RecordCompanionDiscovery = z.infer<
  typeof recordCompanionDiscoverySchema
>;
export type CompanionDiscovery = z.infer<typeof companionDiscoverySchema>;
