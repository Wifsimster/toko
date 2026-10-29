import { useEffect } from "react";
import { useChildren } from "@/hooks/use-children";
import { useUiStore } from "@/stores/ui-store";

export function resolveActiveChildId(
  children: ReadonlyArray<{ id: string }>,
  activeChildId: string | null,
): string | null | undefined {
  if (children.length === 0) return activeChildId ? null : undefined;
  if (activeChildId && children.some((c) => c.id === activeChildId)) {
    return undefined;
  }
  return children[0]!.id;
}

export function useActiveChildSync(): void {
  const { data: children } = useChildren();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const setActiveChild = useUiStore((s) => s.setActiveChild);

  useEffect(() => {
    if (!children) return;
    const next = resolveActiveChildId(children, activeChildId);
    if (next !== undefined) setActiveChild(next);
  }, [activeChildId, children, setActiveChild]);
}
