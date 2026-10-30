import { articleSceneLoader } from "@focusflow/mo/articles";

import { SceneTile, type SceneTileColor } from "./scene-tile";

const TILES: readonly SceneTileColor[] = ["surfaceSky", "surfaceHoney", "surfacePeach", "surfaceLavender"];

export function ArticleScene({ slug, index }: { slug: string; index: number }) {
  return (
    <SceneTile
      load={articleSceneLoader(slug, index)}
      sceneKey={`${slug}:${index}`}
      tile={TILES[index % TILES.length]}
      testID="article-section-scene"
    />
  );
}
