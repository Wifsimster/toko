import { useQuery } from "@tanstack/react-query";

import { fetchBillingStatus } from "../lib/api";

// Entitlement check, mirroring the web: a user is premium when their
// subscription is active OR access was granted (solidarity / admin).
export function usePremium() {
  const billing = useQuery({ queryKey: ["billing"], queryFn: fetchBillingStatus });
  return {
    isPremium: !!(billing.data?.active || billing.data?.granted),
    isLoading: billing.isLoading,
  };
}
