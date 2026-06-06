/** Centralised query/mutation keys shared by hooks and the persisted
 * mutation defaults (src/lib/mutations.ts), so offline-queued mutations and
 * the hooks that fire them always agree. */
export const symptomsQueryKey = (childId: string) =>
  ["symptoms", childId] as const;

export const statsQueryKey = (childId: string) => ["stats", childId] as const;

export const symptomMutationKeys = {
  create: ["symptoms", "create"] as const,
  update: ["symptoms", "update"] as const,
};
