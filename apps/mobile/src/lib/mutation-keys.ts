/** Centralised query/mutation keys shared by hooks and the persisted
 * mutation defaults (src/lib/mutations.ts), so offline-queued mutations and
 * the hooks that fire them always agree. */
export const symptomsQueryKey = (childId: string) =>
  ["symptoms", childId] as const;

// Prefix of the calm-minutes queries (one per period). Invalidating the
// prefix refreshes every period after a check-in. Matches the web key.
export const calmMinutesQueryKey = (childId: string) =>
  ["calm-minutes", childId] as const;

export const symptomMutationKeys = {
  create: ["symptoms", "create"] as const,
  update: ["symptoms", "update"] as const,
  delete: ["symptoms", "delete"] as const,
};
