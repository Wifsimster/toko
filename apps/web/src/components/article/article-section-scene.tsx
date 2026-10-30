import { Children, Fragment, isValidElement, useEffect, useRef, useState, type ReactNode } from "react";
import { articleSceneCount, articleSceneLoader, type MoScene as MoSceneData } from "@focusflow/mo/articles";
import { MoScene } from "@/components/mo/mo-scene";
import { cn } from "@/lib/utils";

const TILES = ["bg-surface-sky", "bg-surface-honey", "bg-surface-peach", "bg-surface-lavender"] as const;

export function ArticleSectionScene({ slug, index }: { slug: string; index: number }) {
  const load = articleSceneLoader(slug, index);
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState<{ key: string; scene: MoSceneData } | null>(null);
  const key = `${slug}:${index}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [near]);

  useEffect(() => {
    if (!load || !near) return;
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
  }, [load, near, key]);

  if (!load) return null;
  const scene = loaded?.key === key ? loaded.scene : null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-testid="article-section-scene"
      className={cn("overflow-hidden rounded-2xl px-4 py-3", TILES[index % TILES.length])}
    >
      <div className="mx-auto aspect-[360/200] w-full max-w-[400px]">
        {scene ? <MoScene scene={scene} /> : null}
      </div>
    </div>
  );
}

const topLevel = (content: ReactNode): ReactNode =>
  isValidElement<{ children?: ReactNode }>(content) && content.type === Fragment ? content.props.children : content;

export function sectionHeadingCount(content: ReactNode): number {
  return Children.toArray(topLevel(content)).filter((node) => isValidElement(node) && node.type === "h2").length;
}

export function withSectionScenes(content: ReactNode, slug: string): ReactNode {
  if (articleSceneCount(slug) === 0) return content;
  let index = 0;
  return Children.toArray(topLevel(content)).flatMap<ReactNode>((node) => {
    if (!isValidElement(node) || node.type !== "h2") return [node];
    const scene = index++;
    return [node, <ArticleSectionScene key={`article-scene-${scene}`} slug={slug} index={scene} />];
  });
}
