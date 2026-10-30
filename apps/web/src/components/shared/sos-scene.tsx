import { useEffect, useState } from "react";
import { sosSceneLoaders, type MoScene as MoSceneData, type SosSceneName } from "@focusflow/mo/sos";
import { MoScene } from "@/components/mo/mo-scene";
import { preloadMoArt } from "@/components/mo/use-mo-art";
import { cn } from "@/lib/utils";

const ready = new Map<SosSceneName, MoSceneData>();
const pending = new Map<SosSceneName, Promise<MoSceneData>>();

export function preloadSosScene(name: SosSceneName): Promise<MoSceneData> {
  const inFlight = pending.get(name);
  if (inFlight) return inFlight;
  const promise = sosSceneLoaders[name]()
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

export function SosScene({ name, className }: { name: SosSceneName; className?: string }) {
  const [loaded, setLoaded] = useState<{ name: SosSceneName; scene: MoSceneData } | null>(null);
  const cached = ready.get(name);

  useEffect(() => {
    if (ready.has(name)) return;
    let alive = true;
    preloadSosScene(name).then(
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
      data-testid="sos-scene"
      data-scene={name}
      className={cn("mx-auto -mt-4 block aspect-[3/1] w-full max-w-[16.5rem] print:hidden", className)}
    >
      {scene ? <MoScene scene={scene} /> : null}
    </div>
  );
}
