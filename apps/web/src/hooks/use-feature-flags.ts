import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { FeatureFlagKey } from "@focusflow/validators";

type ResolvedFlags = Record<FeatureFlagKey, unknown>;

export const featureFlagsKeys = {
  all: () => ["feature-flags"] as const,
};

// Single fetch per session. The resolver on the server is deterministic
// per (userId, flagKey) so re-fetching wouldn't yield different values
// during a session — staleTime: Infinity skips revalidation churn.
export function useFeatureFlags() {
  return useQuery<ResolvedFlags>({
    queryKey: featureFlagsKeys.all(),
    queryFn: () => api.get<ResolvedFlags>("/feature-flags"),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
}

export function useFeatureFlag<T>(key: FeatureFlagKey, fallback: T): T {
  const query = useFeatureFlags();
  const raw = query.data?.[key];
  return raw === undefined ? fallback : (raw as T);
}
