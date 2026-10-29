import { lazy, Suspense, type ComponentType } from "react";
import { useSession } from "@/lib/auth-client";
import { useUiStore } from "@/stores/ui-store";

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

export function OnboardingGate() {
  const session = useSession();
  const completed = useUiStore((s) => s.onboardingCompleted);
  if (session.isPending || !session.data?.user || completed) return null;
  return (
    <Suspense fallback={null}>
      <OnboardingFlow />
    </Suspense>
  );
}
