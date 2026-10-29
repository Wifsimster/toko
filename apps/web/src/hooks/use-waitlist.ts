import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useJoinWaitlist(source: "android" = "android") {
  return useMutation({
    mutationFn: (email: string) =>
      api.post<{ joined: boolean }>("/waitlist", { email, source }),
  });
}
