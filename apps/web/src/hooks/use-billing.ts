import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface BillingStatus {
  status: string;
  active: boolean;
  planId?: string;
  currentPeriodEnd?: string;
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
