import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

export type BetaFeedbackEntry = {
  id: string;
  message: string;
  createdAt: string;
  userName: string;
  userEmail: string;
};

// Whether the current user is in the closed-beta cohort — gates the in-app
// feedback widget. Cached: cohort membership rarely changes within a session.
export function useBetaEligible() {
  return useQuery({
    queryKey: ["beta-feedback", "status"],
    queryFn: () => api.get<{ eligible: boolean }>("/beta-feedback/status"),
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useSubmitBetaFeedback() {
  return useMutation({
    mutationFn: (message: string) =>
      api.post("/beta-feedback", { message }),
    onSuccess: () => toast.success("Merci pour votre retour !"),
    onError: () => toast.error("Impossible d'envoyer votre retour."),
  });
}

// Admin-only: every feedback entry with its author.
export function useBetaFeedbackList() {
  return useQuery({
    queryKey: ["beta-feedback", "list"],
    queryFn: () => api.get<BetaFeedbackEntry[]>("/beta-feedback"),
    retry: false,
  });
}
