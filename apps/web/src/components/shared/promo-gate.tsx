import type { ReactNode } from "react";
import { useIsTunnelHour } from "@/hooks/use-is-tunnel-hour";

export function PromoGate({ children }: { children: ReactNode }) {
  const inTunnel = useIsTunnelHour();
  if (inTunnel) return null;
  return <>{children}</>;
}
