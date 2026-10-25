import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Réponse à « Qu'est-ce qui vous aiderait le plus ? » (onboarding). Rien
 * n'existe côté API pour la stocker : elle reste dans ce navigateur
 * (localStorage `toko-ui`), sans migration de base. Elle ne quitte pas
 * l'appareil et n'est pas encore utilisée pour personnaliser l'accueil.
 */
export type OnboardingGoal =
  | "mornings"
  | "appointment"
  | "crises"
  | "encouragement"
  | "bedtime";

interface UiState {
  activeChildId: string | null;
  dismissedTips: string[];
  rewardsKidView: boolean;
  onboardingCompleted: boolean;
  onboardingGoal: OnboardingGoal | null;
  /** Transitoire : la fin de l'onboarding demande d'ouvrir l'ajout d'un enfant. */
  addChildRequested: boolean;
  androidPromoDismissed: boolean;
  setActiveChild: (id: string | null) => void;
  dismissTip: (id: string) => void;
  toggleRewardsKidView: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setOnboardingGoal: (goal: OnboardingGoal | null) => void;
  setAddChildRequested: (requested: boolean) => void;
  dismissAndroidPromo: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      activeChildId: null,
      dismissedTips: [],
      rewardsKidView: false,
      onboardingCompleted: false,
      onboardingGoal: null,
      addChildRequested: false,
      androidPromoDismissed: false,
      setActiveChild: (id) => set({ activeChildId: id }),
      dismissTip: (id) =>
        set((s) =>
          s.dismissedTips.includes(id)
            ? s
            : { dismissedTips: [...s.dismissedTips, id] }
        ),
      toggleRewardsKidView: () =>
        set((s) => ({ rewardsKidView: !s.rewardsKidView })),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetOnboarding: () => set({ onboardingCompleted: false }),
      setOnboardingGoal: (goal) => set({ onboardingGoal: goal }),
      setAddChildRequested: (requested) => set({ addChildRequested: requested }),
      dismissAndroidPromo: () => set({ androidPromoDismissed: true }),
    }),
    {
      name: "toko-ui",
      partialize: (state) => ({
        activeChildId: state.activeChildId,
        dismissedTips: state.dismissedTips,
        rewardsKidView: state.rewardsKidView,
        onboardingCompleted: state.onboardingCompleted,
        onboardingGoal: state.onboardingGoal,
        androidPromoDismissed: state.androidPromoDismissed,
      }),
    }
  )
);
