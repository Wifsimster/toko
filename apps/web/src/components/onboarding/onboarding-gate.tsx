import { lazy, Suspense } from "react";
import { useSession } from "@/lib/auth-client";
import { useUiStore } from "@/stores/ui-store";

// Le parcours et ses dessins ne sont téléchargés que par un parent qui ne l'a
// pas encore vu : les autres n'en paient pas le poids.
const OnboardingFlow = lazy(() =>
  import("./onboarding-flow").then(async (m) => {
    await m.preloadOnboarding().catch(() => undefined);
    return { default: m.OnboardingFlow };
  })
);

/** Ouvre l'onboarding « Mō » au premier passage d'un parent connecté. */
export function OnboardingGate() {
  const session = useSession();
  const completed = useUiStore((s) => s.onboardingCompleted);
  // Attendre la session pour ne rien montrer pendant une déconnexion.
  if (session.isPending || !session.data?.user || completed) return null;
  return (
    <Suspense fallback={null}>
      <OnboardingFlow />
    </Suspense>
  );
}
