export const symptomsQueryKey = (childId: string) =>
  ["symptoms", childId] as const;

export const calmMinutesQueryKey = (childId: string) =>
  ["calm-minutes", childId] as const;

export const symptomMutationKeys = {
  create: ["symptoms", "create"] as const,
  update: ["symptoms", "update"] as const,
  delete: ["symptoms", "delete"] as const,
};
