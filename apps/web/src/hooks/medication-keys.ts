export const medicationKeys = {
  all: (childId: string) => ["medications", childId] as const,
  adherence: (childId: string) =>
    ["medications", childId, "adherence"] as const,
};
