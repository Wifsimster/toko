import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/lib/i18n";
import { api } from "@/lib/api-client";

export type BillingPlan = "monthly" | "annual";

interface BillingStatus {
  // Stripe-mirrored status, or "granted" when an admin gave complimentary
  // access with no subscription, or "none" when the user is on the free plan.
  status: string;
  active: boolean;
  // True when premium access was granted by an administrator.
  granted?: boolean;
  paused?: boolean;
  pausedUntil?: string | null;
  // Mirrored from Stripe: true while the user is still inside their paid
  // period after hitting /cancel but before the subscription actually
  // lapses. Drives the "Annulation programmée — Réactiver" UI branch.
  cancelAtPeriodEnd?: boolean;
  planId?: string;
  interval?: "month" | "year" | null;
  currentPeriodEnd?: string;
  // True when the user may read the Barkley teaching curriculum — via a
  // grandfathered account, a Formation one-shot purchase, or an active
  // Famille subscription (Famille bundles the formation).
  ownsFormation?: boolean;
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
  const queryClient = useQueryClient();
  return useMutation<{ url: string }, Error, BillingPlan | void>({
    mutationFn: (plan) => {
      const finalPlan = plan ?? readStoredPlan();
      const body: Record<string, unknown> = {
        // Forward the user's resolved language so Stripe's Checkout page
        // appears in the same locale as the app — replaces the hardcoded
        // "fr" that lived server-side.
        locale: i18n.resolvedLanguage ?? "fr",
      };
      if (finalPlan) body.plan = finalPlan;
      return api.post<{ url: string }>("/billing/checkout", body);
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: billingKeys.status });
      window.location.href = data.url;
    },
    onError: () => {
      // Network/429/503 — without this the UI stays frozen on the spinner
      // and the parent has no idea why nothing happened.
      toast.error(i18n.t("account.checkoutError"));
    },
  });
}

// Tokō Formation one-shot (Barkley curriculum, mode:payment). Redirects to
// Stripe Checkout. A 409 means the user already owns the formation — treat it
// as success and just refresh status so the curriculum reveals itself. A 503
// means the price isn't provisioned yet ("bientôt disponible").
export function useFormationCheckout() {
  const queryClient = useQueryClient();
  return useMutation<{ url: string }, Error, void>({
    mutationFn: () =>
      api.post<{ url: string }>("/billing/checkout/formation", {
        locale: i18n.resolvedLanguage ?? "fr",
      }),
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

// Business rule C3: free pause up to 3 months per calendar year.
// `months` must be 1, 2 or 3. Returns 409 when the annual quota is
// exhausted, when a cancellation is already pending, when the sub is
// already paused, or when the user is still in trial — the API surfaces
// distinct `code` values (PAUSE_QUOTA_EXCEEDED / PAUSE_CANCEL_PENDING /
// PAUSE_ALREADY_PAUSED / PAUSE_TRIALING) so the dialog can map each to
// specific copy instead of a generic 409 toast.
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

// Schedules cancellation at the end of the current paid period. The
// subscription stays active until then, so the UI can show "Annulation
// programmée — Réactiver" until currentPeriodEnd. The backend already
// mirrors cancel_at_period_end to the DB synchronously, so a fresh
// status fetch reflects the change immediately.
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

// Reverses both /cancel (cancel_at_period_end) and /pause (pause_collection)
// in one call so the UI offers a single "Reprendre l'abonnement" action
// regardless of which paused/canceling state the subscription is in.
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
