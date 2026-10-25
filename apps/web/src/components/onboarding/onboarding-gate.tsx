import { lazy, Suspense, type ComponentType } from "react";
import { useSession } from "@/lib/auth-client";
import { useUiStore } from "@/stores/ui-store";

// Le parcours n'est exécuté que pour un parent qui ne l'a pas encore vu. Son
// module est précaché par le service worker ; ses dessins de Mō (assets/mo/)
// ne le sont pas et restent facultatifs. Si le module manque malgré tout
// (hors ligne avant la première mise en cache, déploiement entre-temps), on
// n'affiche rien : l'accueil reste utilisable, sans passer par la page
// d'erreur, et le parcours s'ouvrira à la prochaine visite en ligne puisque
// `onboardingCompleted` n'a pas changé.
const Nothing: ComponentType = () => null;
const OnboardingFlow = lazy<ComponentType>(() =>
  import("./onboarding-flow").then(
    async (m) => {
      await m.preloadOnboarding().catch(() => undefined);
      return { default: m.OnboardingFlow };
    },
    () => ({ default: Nothing })
  )
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
