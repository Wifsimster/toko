import type {
  BarkleyReward,
} from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

const keys = {
  rewards: (childId: string) => ["barkley-rewards", childId] as const,
  stars: (childId: string) => ["barkley-stars", childId] as const,
};

/** List rewards for a child, ordered by sortOrder. */
export function useRewards(childId: string) {
  return useQuery({
    queryKey: keys.rewards(childId),
    queryFn: () => api.get<BarkleyReward[]>(`/barkley/rewards/${childId}`),
    enabled: !!childId,
  });
}

/** Claim a reward — deducts starsRequired from the child's available balance.
 *  Returns 422 when the child does not have enough stars. */
export function useClaimReward(childId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rewardId: string) =>
      api.post<BarkleyReward>(`/barkley/rewards/${rewardId}/claim`, {}),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.rewards(childId) });
      // Invalidate the star balance used by BarkleyScreen.
      qc.invalidateQueries({ queryKey: keys.stars(childId) });
    },
  });
}
