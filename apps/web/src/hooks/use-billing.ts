import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface BillingStatus {
  status: string;
  active: boolean;
  planId?: string;
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

export function useCheckout() {
  return useMutation({
    mutationFn: () => api.post<{ url: string }>("/billing/checkout", {}),
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
