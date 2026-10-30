import { useEffect, useState } from "react";
import { reperesSceneLoaders, type MoScene as MoSceneData, type ReperesSceneName } from "@focusflow/mo/reperes";
import { MoScene } from "@/components/mo/mo-scene";
import { preloadMoArt } from "@/components/mo/use-mo-art";
import { cn } from "@/lib/utils";
import type { Parcours } from "@/lib/screening/parcours";

const TOPIC_SCENE = { tdah: "attention", top: "wave", autisme: "sensory" } as const;

type ParcoursScene = "overlap" | (typeof TOPIC_SCENE)[keyof typeof TOPIC_SCENE];

const CARD_SCENE = {
  attention: "attention-petit",
  wave: "wave-petit",
  sensory: "sensory-petit",
  overlap: "overlap-petit",
} as const satisfies Record<ParcoursScene, ReperesSceneName>;

export function sceneForParcours(p: Pick<Parcours, "sections">): ParcoursScene {
  return p.sections.length > 1 ? "overlap" : TOPIC_SCENE[p.sections[0]!.topic];
}

export const cardSceneForParcours = (p: Pick<Parcours, "sections">): ReperesSceneName => CARD_SCENE[sceneForParcours(p)];

const ready = new Map<ReperesSceneName, MoSceneData>();
const pending = new Map<ReperesSceneName, Promise<MoSceneData>>();

export function preloadReperesScene(name: ReperesSceneName): Promise<MoSceneData> {
  const inFlight = pending.get(name);
  if (inFlight) return inFlight;
  const promise = reperesSceneLoaders[name]()
    .then(async (scene) => {
      await preloadMoArt(scene.layers.flatMap((layer) => (layer.kind === "mo" ? [[layer.state, layer.size] as const] : [])));
      ready.set(name, scene);
      return scene;
    })
    .catch((error: unknown) => {
      pending.delete(name);
      throw error;
    });
  pending.set(name, promise);
  return promise;
}

export function ReperesScene({ name, className }: { name: ReperesSceneName; className?: string }) {
  const [loaded, setLoaded] = useState<{ name: ReperesSceneName; scene: MoSceneData } | null>(null);
  const cached = ready.get(name);

  useEffect(() => {
    if (ready.has(name)) return;
    let alive = true;
    preloadReperesScene(name).then(
      (scene) => {
        if (alive) setLoaded({ name, scene });
      },
      () => {},
    );
    return () => {
      alive = false;
    };
  }, [name]);

  const scene = cached ?? (loaded?.name === name ? loaded.scene : null);

  return (
    <div
      aria-hidden="true"
      data-testid="reperes-scene"
      data-scene={name}
      className={cn("block print:hidden", name.endsWith("-petit") ? "aspect-square" : "aspect-[2/1]", className)}
    >
      {scene ? <MoScene scene={scene} /> : null}
    </div>
  );
}
