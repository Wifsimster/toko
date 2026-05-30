import type { FeatureFlagKey } from "@focusflow/validators";
import { useFeatureFlags } from "./use-feature-flags";

export function useFeatureFlag<T>(key: FeatureFlagKey, fallback: T): T {
  const query = useFeatureFlags();
  const raw = query.data?.[key];
  return raw === undefined ? fallback : (raw as T);
}
