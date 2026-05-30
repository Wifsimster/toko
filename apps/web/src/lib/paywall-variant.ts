// Paywall copywriting variant. Two angles validated in the strategy
// review (GitHub issue #193): `chargeMentale` is principal, `communication`
// is secondary. The variant is selected at build time via
// VITE_PAYWALL_VARIANT and resolved once here so consumers stay in sync.
//
// Runtime A/B distribution is tracked separately (issue #190) and is
// intentionally out of scope.
const PAYWALL_VARIANTS = ["chargeMentale", "communication"] as const;
export type PaywallVariant = (typeof PAYWALL_VARIANTS)[number];

const envValue = import.meta.env.VITE_PAYWALL_VARIANT;

export const PAYWALL_VARIANT: PaywallVariant =
  envValue === "communication" ? "communication" : "chargeMentale";
