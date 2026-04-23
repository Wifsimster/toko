import type { ReactNode } from "react";
import { useIsTunnelHour } from "@/hooks/use-is-tunnel-hour";

// Business rule C6: wrap any promo, upsell, trial-nudge, rate-us or
// share-us surface with <PromoGate>. It renders nothing between 16h30
// and 21h00 local time — the evening tunnel is protected from spending
// decisions.
export function PromoGate({ children }: { children: ReactNode }) {
  const inTunnel = useIsTunnelHour();
  if (inTunnel) return null;
  return <>{children}</>;
}
