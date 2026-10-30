import { barkleySceneLoader, type BarkleySceneSection } from "@focusflow/mo/barkley";

import { SceneTile, type SceneTileColor } from "./scene-tile";

const TILE: Record<BarkleySceneSection, SceneTileColor> = {
  understand: "surfaceSky",
  technique: "surfaceHoney",
  scenarios: "surfacePeach",
  practice: "surfaceLavender",
};

export function BarkleyScene({ stepNumber, section }: { stepNumber: number; section: BarkleySceneSection }) {
  return (
    <SceneTile
      load={barkleySceneLoader(stepNumber, section)}
      sceneKey={`${stepNumber}:${section}`}
      tile={TILE[section]}
      testID="barkley-scene"
    />
  );
}
