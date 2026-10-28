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
  Book,
  BookOpen,
  FileText,
  HandHeart,
  House,
  Leaf,
  ListChecks,
  Menu,
  Newspaper,
  Pill,
  Timer,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react-native";
import {
  pickMobileTabs,
  type CachedMobileTabs,
  type MobileTabId,
} from "@focusflow/validators";

import { useActiveChild } from "../lib/active-child";
import { authClient } from "../lib/auth";
import { usePreferences } from "../hooks/use-preferences";
import type { RootStackParamList, RootTabParamList } from "./types";

/** Sections du menu Plus, reprises pour grouper le catalogue. */
export const MOBILE_TAB_SECTIONS = ["Ressources", "Suivi", "Soins", "Compte"] as const;
export type MobileTabSection = (typeof MOBILE_TAB_SECTIONS)[number];

/**
 * Catalogue des onglets du milieu (ids : MOBILE_TAB_IDS, @focusflow/validators) :
 * chaque page de l'app ouverte depuis Plus. `label` = libellé court, sous
 * l'icône de la barre ; `name` = nom complet, comme dans le menu Plus (écran
 * Barre de menu). `route` = nom de l'onglet dans le navigateur, `root` =
 * premier écran de sa pile. Chaque `root` existe aussi dans la pile de Plus :
 * un onglet absent de la barre reste joignable par Plus. `child` = la page
 * concerne un enfant : en onglet, elle suit l'enfant actif.
 */
export const MOBILE_TABS: Record<
  MobileTabId,
  {
    label: string;
    name: string;
    icon: LucideIcon;
    section: MobileTabSection;
    route: Exclude<keyof RootTabParamList, "AccueilTab" | "PlusTab">;
    root: keyof RootStackParamList;
    child?: true;
  }
> = {
  articles: { label: "Articles", name: "Articles", icon: Newspaper, section: "Ressources", route: "ArticlesTab", root: "Connaissances" },
  barkley: { label: "Barkley", name: "Programme Barkley", icon: Book, section: "Ressources", route: "BarkleyTab", root: "Barkley", child: true },
  timer: { label: "Minuteur", name: "Minuteur visuel", icon: Timer, section: "Ressources", route: "MinuteurTab", root: "Timer" },
  journal: { label: "Journal", name: "Journal", icon: BookOpen, section: "Suivi", route: "JournalTab", root: "Journal" },
  symptoms: { label: "Symptômes", name: "Symptômes", icon: Activity, section: "Suivi", route: "SymptomesTab", root: "Symptoms" },
  routines: { label: "Routines", name: "Routines", icon: ListChecks, section: "Suivi", route: "RoutinesTab", root: "Routines" },
  medications: { label: "Médicaments", name: "Médicaments", icon: Pill, section: "Suivi", route: "MedicamentsTab", root: "Medications", child: true },
  calm: { label: "Calme", name: "Minutes calmes", icon: Leaf, section: "Suivi", route: "CalmeTab", root: "CalmMinutes", child: true },
  insights: { label: "Insights", name: "Insights", icon: TrendingUp, section: "Suivi", route: "InsightsTab", root: "Insights", child: true },
  report: { label: "Rapport", name: "Rapport", icon: FileText, section: "Suivi", route: "RapportTab", root: "Report", child: true },
  crisis: { label: "Crise", name: "Liste de crise", icon: HandHeart, section: "Soins", route: "CriseTab", root: "CrisisList", child: true },
  rewards: { label: "Récompenses", name: "Récompenses", icon: Trophy, section: "Compte", route: "RecompensesTab", root: "Rewards", child: true },
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
  const { active } = useActiveChild();
  return useCallback(
    (id: MobileTabId, params?: object) => {
      const tabNav = navigation.getParent() ?? navigation;
      const { route, root, child } = MOBILE_TABS[id];
      // En onglet, une page d'enfant suit l'enfant actif. Par Plus, elle
      // attend ses paramètres : ceux donnés, sinon l'enfant actif.
      if (tabs.includes(id)) {
        tabNav.navigate(route, { screen: root, params });
        return;
      }
      const p = params ?? (child && active ? { childId: active.id, childName: active.name } : undefined);
      if (child && !p) return; // pas d'enfant : la page n'a rien à montrer
      tabNav.navigate("PlusTab", { screen: root, params: p, initial: false });
    },
    [navigation, tabs, active],
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
