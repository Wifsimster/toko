import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import {
  Activity,
  BookOpen,
  House,
  ListChecks,
  Menu,
  Newspaper,
  Pill,
  Timer,
  type LucideIcon,
} from "lucide-react-native";
import {
  pickMobileTabs,
  type CachedMobileTabs,
  type MobileTabId,
} from "@focusflow/validators";

import { authClient } from "../lib/auth";
import { usePreferences } from "../hooks/use-preferences";
import type { RootStackParamList, RootTabParamList } from "./types";

/**
 * Catalogue des onglets du milieu (ids : MOBILE_TAB_IDS, @focusflow/validators).
 * `route` = nom de l'onglet dans le navigateur, `root` = premier écran de sa
 * pile. Chaque `root` existe aussi dans la pile de Plus : un onglet absent de
 * la barre reste joignable par Plus.
 */
export const MOBILE_TABS: Record<
  MobileTabId,
  {
    label: string;
    icon: LucideIcon;
    route: Exclude<keyof RootTabParamList, "AccueilTab" | "PlusTab">;
    root: keyof RootStackParamList;
  }
> = {
  articles: { label: "Articles", icon: Newspaper, route: "ArticlesTab", root: "Connaissances" },
  routines: { label: "Routines", icon: ListChecks, route: "RoutinesTab", root: "Routines" },
  timer: { label: "Minuteur", icon: Timer, route: "MinuteurTab", root: "Timer" },
  journal: { label: "Journal", icon: BookOpen, route: "JournalTab", root: "Journal" },
  symptoms: { label: "Symptômes", icon: Activity, route: "SymptomesTab", root: "Symptoms" },
  medications: { label: "Médicaments", icon: Pill, route: "MedicamentsTab", root: "Medications" },
};

/** Les deux bouts fixes de la barre. */
export const FIXED_TABS = {
  first: { label: "Accueil", icon: House },
  last: { label: "Plus", icon: Menu },
} as const;

// Dernière barre connue, par compte : la barre s'affiche dès le démarrage,
// même hors ligne, puis suit la valeur du serveur. Rien de sensible (des
// identifiants d'onglets), donc AsyncStorage en clair.
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
    // Cache illisible : la barre par défaut fait l'affaire.
  }
  return null;
}

export function writeMobileTabsCache(value: CachedMobileTabs) {
  void AsyncStorage.setItem(CACHE_KEY, JSON.stringify(value)).catch(() => {});
}

type MobileTabsValue = {
  /** Onglets du milieu, dans l'ordre de la barre. */
  tabs: MobileTabId[];
  /** Faux tant que le cache local n'a pas été lu (quelques millisecondes). */
  ready: boolean;
};

const MobileTabsContext = createContext<MobileTabsValue | null>(null);

export function MobileTabsProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const prefs = usePreferences();
  // undefined = pas encore lu, null = pas de cache.
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

  // `undefined` tant que le serveur n'a pas répondu, ou s'il ne connaît pas
  // encore ce réglage (API plus ancienne) : on garde alors le cache.
  const server: unknown =
    prefs.data && "mobileTabs" in prefs.data ? prefs.data.mobileTabs : undefined;
  const serverKey = JSON.stringify(server ?? null);
  const serverKnown = server !== undefined;

  useEffect(() => {
    if (userId && serverKnown) {
      writeMobileTabsCache({ userId, tabs: JSON.parse(serverKey) });
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

/**
 * Ouvre une section depuis n'importe quel écran parent : par son onglet s'il
 * est dans la barre, sinon par la pile de Plus (le menu Plus reste dessous,
 * « Retour » y ramène). À utiliser pour toute navigation vers un écran racine
 * d'un onglet du catalogue, jamais `navigate("RoutinesTab")` en dur.
 */
export function useOpenSection(navigation: NavigationProp<ParamListBase>) {
  const { tabs } = useMobileTabs();
  return useCallback(
    (id: MobileTabId, params?: object) => {
      const tabNav = navigation.getParent() ?? navigation;
      const { route, root } = MOBILE_TABS[id];
      if (tabs.includes(id)) {
        tabNav.navigate(route, { screen: root, params });
      } else {
        tabNav.navigate("PlusTab", { screen: root, params, initial: false });
      }
    },
    [navigation, tabs],
  );
}

/**
 * « Retour » seulement pour un écran poussé dans sa pile : un même écran sert
 * de racine d'onglet (pas de retour) et de page ouverte depuis Plus (retour au
 * menu). `canGoBack()` ne suffit pas : il répond oui dès que le navigateur
 * d'onglets peut revenir à Accueil.
 */
export function backIfPushed(navigation: {
  getState(): { index: number };
  goBack(): void;
}): (() => void) | undefined {
  return navigation.getState().index > 0 ? () => navigation.goBack() : undefined;
}
