import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { createNavigationContainerRef } from "@react-navigation/native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  pickMobileTabs,
  serverMobileTabs,
  type CachedMobileTabs,
  type MobileTabId,
} from "@focusflow/validators";

import { useActiveChild } from "../lib/active-child";
import { authClient } from "../lib/auth";
import { usePreferences } from "../hooks/use-preferences";
import { sectionTarget } from "./nav-model";
import type { RootTabParamList } from "./types";

export const navigationRef = createNavigationContainerRef<RootTabParamList>();

const CACHE_KEY = "toko-mobile-tabs";

async function readCache(): Promise<CachedMobileTabs | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as { userId?: unknown }).userId === "string"
    ) {
      return parsed as CachedMobileTabs;
    }
  } catch {
    return null;
  }
  return null;
}

function writeCache(value: CachedMobileTabs) {
  void AsyncStorage.setItem(CACHE_KEY, JSON.stringify(value)).catch(() => {});
}

type MobileTabsValue = {
  tabs: MobileTabId[];
  ready: boolean;
};

const MobileTabsContext = createContext<MobileTabsValue | null>(null);

export function MobileTabsProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const prefs = usePreferences();
  const [cached, setCached] = useState<CachedMobileTabs | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    void readCache().then((value) => {
      if (alive) setCached(value);
    });
    return () => {
      alive = false;
    };
  }, []);

  const server: unknown = prefs.data ? serverMobileTabs(prefs.data) : undefined;
  const serverKey = JSON.stringify(server ?? null);
  const serverKnown = server !== undefined;

  useEffect(() => {
    if (userId && serverKnown) {
      writeCache({ userId, tabs: JSON.parse(serverKey) });
    }
  }, [userId, serverKnown, serverKey]);

  const tabsKey = JSON.stringify(pickMobileTabs({ userId, server, cached }));
  const value = useMemo<MobileTabsValue>(
    () => ({ tabs: JSON.parse(tabsKey) as MobileTabId[], ready: cached !== undefined }),
    [tabsKey, cached],
  );

  return <MobileTabsContext.Provider value={value}>{children}</MobileTabsContext.Provider>;
}

export function useMobileTabs(): MobileTabsValue {
  const ctx = useContext(MobileTabsContext);
  if (!ctx) throw new Error("useMobileTabs must be used within MobileTabsProvider");
  return ctx;
}

type Navigator = { navigate: (route: string, params?: object) => void };

export function openSectionIn(
  nav: Navigator,
  tabs: readonly MobileTabId[],
  id: MobileTabId,
  params?: object,
) {
  const target = sectionTarget(tabs, id);
  if (target.child && !params) return;
  nav.navigate(target.route, {
    screen: target.screen,
    params,
    ...(target.initial ? {} : { initial: false }),
  });
}

export function useOpenSection(navigation: NavigationProp<ParamListBase>) {
  const { active } = useActiveChild();
  const { tabs } = useMobileTabs();
  return useCallback(
    (id: MobileTabId, params?: object) => {
      const tabNav = (navigation.getParent() ?? navigation) as unknown as Navigator;
      const child = active ? { childId: active.id, childName: active.name } : undefined;
      openSectionIn(tabNav, tabs, id, params ?? (sectionTarget(tabs, id).child ? child : undefined));
    },
    [navigation, active, tabs],
  );
}

export function backIfPushed(navigation: {
  getState(): { index: number };
  goBack(): void;
}): (() => void) | undefined {
  return navigation.getState().index > 0 ? () => navigation.goBack() : undefined;
}
