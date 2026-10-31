import { sosSceneLoaders, type SosSceneName } from "@focusflow/mo/sos";

import { SceneTile } from "../mo/scene-tile";

export function SosScene({ name, maxWidth = 264 }: { name: SosSceneName; maxWidth?: number }) {
  return <SceneTile load={sosSceneLoaders[name]} sceneKey={name} testID={`sos-scene-${name}`} bare={{ maxWidth }} />;
}
