import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

// Joins a product waitlist (currently the Android companion — Phase 3 of the
// product strategy). Public endpoint, no auth required.
export function useJoinWaitlist(source: "android" = "android") {
  return useMutation({
    mutationFn: (email: string) =>
      api.post<{ joined: boolean }>("/waitlist", { email, source }),
  });
}
