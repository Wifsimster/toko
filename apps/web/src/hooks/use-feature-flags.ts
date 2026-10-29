import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { FeatureFlagKey } from "@focusflow/validators";

type ResolvedFlags = Record<FeatureFlagKey, unknown>;

const featureFlagsKeys = {
  all: () => ["feature-flags"] as const,
};

export function useFeatureFlags() {
  return useQuery<ResolvedFlags>({
    queryKey: featureFlagsKeys.all(),
    queryFn: () => api.get<ResolvedFlags>("/feature-flags"),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
}

