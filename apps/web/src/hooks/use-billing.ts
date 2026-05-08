import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export type BillingPlan = "monthly" | "annual";

interface BillingStatus {
  status: string;
  active: boolean;
  planId?: string;
  interval?: "month" | "year" | null;
  currentPeriodEnd?: string;
}

interface PauseResult {
  pausedUntil: string;
  monthsUsed: number;
  remaining: number;
}

export const billingKeys = {
  status: ["billing", "status"] as const,
};

export function useBillingStatus() {
  return useQuery({
    queryKey: billingKeys.status,
    queryFn: () => api.get<BillingStatus>("/billing/status"),
  });
}

// Landing toggle persists the parent's preferred interval here so the
// checkout call respects it after sign-up — even if the post-signup flow
// triggers checkout without an explicit plan argument.
const SELECTED_PLAN_STORAGE_KEY = "toko:selectedPlan";

function readStoredPlan(): BillingPlan | undefined {
  if (typeof localStorage === "undefined") return undefined;
  const raw = localStorage.getItem(SELECTED_PLAN_STORAGE_KEY);
  return raw === "monthly" || raw === "annual" ? raw : undefined;
}

export function persistSelectedPlan(plan: BillingPlan): void {
  try {
    localStorage.setItem(SELECTED_PLAN_STORAGE_KEY, plan);
  } catch {
    // storage unavailable — silently ignore, defaults still apply
  }
}

export function useCheckout() {
  return useMutation<{ url: string }, Error, BillingPlan | void>({
    mutationFn: (plan) => {
      const finalPlan = plan ?? readStoredPlan();
      return api.post<{ url: string }>(
        "/billing/checkout",
        finalPlan ? { plan: finalPlan } : {},
      );
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
}

export function usePortal() {
  return useMutation({
    mutationFn: () => api.post<{ url: string }>("/billing/portal", {}),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
}

// Business rule C3: free pause up to 3 months per calendar year.
// `months` must be 1, 2 or 3. Returns 409 when the annual quota is exhausted.
export function usePauseBilling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (months: 1 | 2 | 3) =>
      api.post<PauseResult>("/billing/pause", { months }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.status });
    },
  });
}
