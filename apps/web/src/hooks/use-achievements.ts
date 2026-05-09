import { useChildren } from "./use-children";
import { useStats } from "./use-stats";
import { useJournal } from "./use-journal";
import { useStrengths } from "./use-strengths";
import { useCrisisItems } from "./use-crisis-list";
import { useRoutines } from "./use-routines";
import { useAdminDocuments } from "./use-admin-vault";
import { useCarePathwayProgress } from "./use-care-pathway";
import { useUiStore } from "@/stores/ui-store";
import {
  computeAchievements,
  type AchievementSignals,
} from "@/lib/achievements-data";
import { CARE_PATHWAY_STEPS } from "@/lib/care-pathway-data";

// Aggregates the signals the achievement engine needs from the active
// child's data. "Active child" is a deliberate scope choice: the rewards
// are felt in the context of one child you're tracking, not pooled
// across siblings. Empty/loading states resolve to 0 so badges only
// light up when the data is actually present.
export function useAchievements() {
  const activeChildId = useUiStore((s) => s.activeChildId);
  const id = activeChildId ?? "";

  const { data: children } = useChildren();
  const { data: stats } = useStats(id, "week");
  const { data: journal } = useJournal(id);
  const { data: strengths } = useStrengths(id);
  const { data: crisis } = useCrisisItems(id);
  const { data: routines } = useRoutines(id);
  const { data: docs } = useAdminDocuments(id);
  const { data: carePathway } = useCarePathwayProgress(id);

  const screeningStepIds = CARE_PATHWAY_STEPS.filter(
    (s) => s.phase === "screening",
  ).map((s) => s.id);

  const signals: AchievementSignals = {
    childCount: children?.length ?? 0,
    journalCount: journal?.length ?? 0,
    strengthCount: strengths?.length ?? 0,
    crisisItemCount: crisis?.length ?? 0,
    routineCount: routines?.length ?? 0,
    docCount: docs?.length ?? 0,
    streakDays: stats?.streak ?? 0,
    carePathwayDoneCount:
      carePathway?.filter((p) => p.status === "done").length ?? 0,
    carePathwayScreeningDoneCount:
      carePathway?.filter(
        (p) => p.status === "done" && screeningStepIds.includes(p.stepId),
      ).length ?? 0,
    carePathwayScreeningTotal: screeningStepIds.length,
  };

  return computeAchievements(signals);
}
