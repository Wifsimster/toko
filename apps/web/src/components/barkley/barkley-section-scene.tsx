import { useEffect, useState } from "react";
import { barkleySceneLoader, type BarkleySceneSection, type MoScene as MoSceneData } from "@focusflow/mo/barkley";
import { MoScene } from "@/components/mo/mo-scene";
import { cn } from "@/lib/utils";

const TILE: Record<BarkleySceneSection, string> = {
    understand: "bg-surface-sky",
    technique: "bg-surface-honey",
    scenarios: "bg-surface-peach",
    practice: "bg-surface-lavender",
};

export function BarkleySectionScene({
    stepNumber,
    section,
}: {
    stepNumber: number;
    section: BarkleySceneSection;
}) {
    const load = barkleySceneLoader(stepNumber, section);
    const [loaded, setLoaded] = useState<{ key: string; scene: MoSceneData } | null>(null);
    const key = `${stepNumber}:${section}`;

    useEffect(() => {
        if (!load) return;
        let alive = true;
        load().then(
            (scene) => {
                if (alive) setLoaded({ key, scene });
            },
            () => {},
        );
        return () => {
            alive = false;
        };
    }, [load, key]);

    if (!load) return null;
    const scene = loaded?.key === key ? loaded.scene : null;

    return (
        <div
            aria-hidden="true"
            data-testid="barkley-section-scene"
            className={cn("overflow-hidden rounded-2xl px-4 py-3", TILE[section])}
        >
            <div className="mx-auto aspect-[360/200] w-full max-w-[400px]">
                {scene ? <MoScene scene={scene} /> : null}
            </div>
        </div>
    );
}
