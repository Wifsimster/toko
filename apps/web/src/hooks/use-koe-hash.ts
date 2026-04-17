import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useKoeHash(enabled: boolean) {
  return useQuery({
    queryKey: ["koe-hash"],
    queryFn: () => api.get<{ hash: string }>("/account/koe-hash"),
    enabled,
    staleTime: Infinity,
    retry: false,
  });
}
