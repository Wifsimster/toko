import { useEffect } from "react";
import { useChildren } from "@/hooks/use-children";
import { useUiStore } from "@/stores/ui-store";

/**
 * Which child should be active, given the children this account can see.
 * Returns `undefined` when nothing needs to change.
 */
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

/**
 * Auto-select the first child when none is selected, and reset stale ids
 * (a child deleted on another device, access revoked by the owner, another
 * account signed in on the same device). Without this, every child-scoped
 * GET/POST would 404 silently and the page would show "empty list" with no
 * way to recover.
 *
 * Mounted in the authenticated layout, not in the child selector: on mobile
 * the selector lives in a Sheet that is not mounted while closed.
 */
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
