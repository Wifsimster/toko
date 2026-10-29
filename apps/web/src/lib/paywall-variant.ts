const PAYWALL_VARIANTS = ["chargeMentale", "communication"] as const;
export type PaywallVariant = (typeof PAYWALL_VARIANTS)[number];

const envValue = import.meta.env.VITE_PAYWALL_VARIANT;

export const PAYWALL_VARIANT: PaywallVariant =
  envValue === "communication" ? "communication" : "chargeMentale";
