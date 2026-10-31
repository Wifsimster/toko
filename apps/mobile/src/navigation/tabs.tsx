import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { createNavigationContainerRef } from "@react-navigation/native";
import { useCallback } from "react";

import { useActiveChild } from "../lib/active-child";
import { SECTIONS, type SectionId } from "./nav-model";
import type { RootTabParamList } from "./types";

export const navigationRef = createNavigationContainerRef<RootTabParamList>();

export function useOpenSection(navigation: NavigationProp<ParamListBase>) {
  const { active } = useActiveChild();
  return useCallback(
    (id: SectionId, params?: object) => {
      const tabNav = navigation.getParent() ?? navigation;
      const { route, root, child } = SECTIONS[id];
      const p = params ?? (child && active ? { childId: active.id, childName: active.name } : undefined);
      if (child && !p) return;
      if (route === "BarkleyTab") {
        tabNav.navigate(route, { screen: root, params: p });
        return;
      }
      tabNav.navigate(route, { screen: root, params: p, initial: false });
    },
    [navigation, active],
  );
}

export function backIfPushed(navigation: {
  getState(): { index: number };
  goBack(): void;
}): (() => void) | undefined {
  return navigation.getState().index > 0 ? () => navigation.goBack() : undefined;
}
