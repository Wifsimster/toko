import { trackEvent } from "@/lib/analytics";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/lib/i18n";
import { api } from "@/lib/api-client";

export type BillingPlan = "monthly" | "annual";

interface BillingStatus {
  status: string;
  active: boolean;
  granted?: boolean;
  paused?: boolean;
  pausedUntil?: string | null;
  cancelAtPeriodEnd?: boolean;
  planId?: string;
  interval?: "month" | "year" | null;
  currentPeriodEnd?: string;
  ownsFormation?: boolean;
  formationUpsellEligible?: boolean;
}

interface PauseResult {
  pausedUntil: string;
  monthsUsed: number;
  remaining: number;
}

interface ResumeResult {
  cancelAtPeriodEnd: boolean;
  status: string;
  pausedUntil: null;
}

const billingKeys = {
  status: ["billing", "status"] as const,
};

export function useBillingStatus() {
  return useQuery({
    queryKey: billingKeys.status,
    queryFn: () => api.get<BillingStatus>("/billing/status"),
  });
}

const SELECTED_PLAN_STORAGE_KEY = "toko:selectedPlan";

function readStoredPlan(): BillingPlan | undefined {
  try {
    const raw = localStorage.getItem(SELECTED_PLAN_STORAGE_KEY);
    return raw === "monthly" || raw === "annual" ? raw : undefined;
  } catch {
    return undefined;
  }
}

export function persistSelectedPlan(plan: BillingPlan): void {
  try {
    localStorage.setItem(SELECTED_PLAN_STORAGE_KEY, plan);
  } catch {
  }
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation<{ url: string }, Error, BillingPlan | void>({
    mutationFn: (plan) => {
      const finalPlan = plan ?? readStoredPlan();
      const body: Record<string, unknown> = {
        locale: i18n.resolvedLanguage ?? "fr",
      };
      if (finalPlan) body.plan = finalPlan;
      trackEvent("checkout_started", { product: finalPlan ?? "famille" });
      return api.post<{ url: string }>("/billing/checkout", body);
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: billingKeys.status });
      window.location.href = data.url;
    },
    onError: () => {
      toast.error(i18n.t("account.checkoutError"));
    },
  });
}

export function useFormationCheckout() {
  const queryClient = useQueryClient();
  return useMutation<{ url: string }, Error, void>({
    mutationFn: () => {
      trackEvent("checkout_started", { product: "formation" });
      return api.post<{ url: string }>("/billing/checkout/formation", {
        locale: i18n.resolvedLanguage ?? "fr",
      });
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: billingKeys.status });
      window.location.href = data.url;
    },
    onError: (err) => {
      const code = (err as { code?: string })?.code;
      if (code === "FORMATION_ALREADY_OWNED") {
        void queryClient.invalidateQueries({ queryKey: billingKeys.status });
        return;
      }
      toast.error(
        code === "FORMATION_UNAVAILABLE"
          ? i18n.t("formationLock.unavailable")
          : i18n.t("account.checkoutError"),
      );
    },
  });
}

export function usePortal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ url: string }>("/billing/portal", {}),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: billingKeys.status });
      window.location.href = data.url;
    },
    onError: () => {
      toast.error(i18n.t("account.portalError"));
    },
  });
}

export function usePauseBilling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (months: 1 | 2 | 3) =>
      api.post<PauseResult>("/billing/pause", { months }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingKeys.status });
    },
  });
}

export function useCancelBilling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ ok: true }>("/billing/cancel", {}),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingKeys.status });
      toast.success(i18n.t("account.cancelSuccess"));
    },
    onError: () => {
      toast.error(i18n.t("account.cancelError"));
    },
  });
}

export function useResumeBilling() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<ResumeResult>("/billing/resume", {}),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingKeys.status });
    },
    onError: () => {
      toast.error(i18n.t("account.resumeError"));
    },
  });
}
