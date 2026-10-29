import { useQuery } from "@tanstack/react-query";

import { fetchBillingStatus } from "../lib/api";

export function usePremium() {
  const billing = useQuery({ queryKey: ["billing"], queryFn: fetchBillingStatus });
  return {
    isPremium: !!(billing.data?.active || billing.data?.granted),
    isLoading: billing.isLoading,
  };
}
