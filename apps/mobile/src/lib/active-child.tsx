import type { Child } from "@focusflow/validators";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useChildren } from "../hooks/use-children";

type ActiveChildValue = {
  /** All of the parent's children (empty while loading or if none). */
  children: Child[];
  /** The currently selected child, or null if none yet. */
  active: Child | null;
  isLoading: boolean;
  setActiveChildId: (id: string) => void;
};

const ActiveChildContext = createContext<ActiveChildValue | null>(null);

/**
 * Holds the currently selected child across the tab navigator, so the tracking
 * and programme tabs always act on one child without threading params through
 * every screen. Defaults to the first child once loaded.
 */
export function ActiveChildProvider({ children: tree }: { children: ReactNode }) {
  const query = useChildren();
  const list = useMemo(() => query.data ?? [], [query.data]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (activeId && list.some((c) => c.id === activeId)) return;
    if (list.length) setActiveId(list[0].id);
  }, [list, activeId]);

  const value: ActiveChildValue = {
    children: list,
    active: list.find((c) => c.id === activeId) ?? null,
    isLoading: query.isLoading,
    setActiveChildId: setActiveId,
  };

  return (
    <ActiveChildContext.Provider value={value}>
      {tree}
    </ActiveChildContext.Provider>
  );
}

export function useActiveChild(): ActiveChildValue {
  const ctx = useContext(ActiveChildContext);
  if (!ctx) {
    throw new Error("useActiveChild must be used within ActiveChildProvider");
  }
  return ctx;
}
