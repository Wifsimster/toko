import { useCallback, useState } from "react";
import {
  compareVersions,
  countChanges,
  entriesBetween,
  type ChangelogEntry,
} from "@/lib/changelog";

const SEEN_VERSION_KEY = "toko:changelog:lastSeenVersion";

function readSeenVersion(): string | null {
  try {
    return window.localStorage.getItem(SEEN_VERSION_KEY);
  } catch {
    // Navigation privée, stockage désactivé : on se tait plutôt que de crasher.
    return null;
  }
}

function writeSeenVersion(version: string): void {
  try {
    window.localStorage.setItem(SEEN_VERSION_KEY, version);
  } catch {
    // Sans stockage, le bandeau réapparaîtra à la prochaine visite. Tant pis.
  }
}

export type UpdateAnnouncement = {
  /** Vrai uniquement si une entrée notable a été livrée depuis la dernière visite. */
  announce: boolean;
  /** Nombre de changements racontés sur cet écart de versions. */
  changeCount: number;
};

const SILENT: UpdateAnnouncement = { announce: false, changeCount: 0 };

/**
 * Faut-il dire au parent que Tokō a changé ?
 *
 * Trois verrous avant d'afficher quoi que ce soit :
 * - `seen` absent = première visite (ou stockage vidé) : on ne souhaite pas la
 *   bienvenue à quelqu'un qui découvre l'app ;
 * - pas d'écart de version, ou un navigateur revenu en arrière : rien ;
 * - aucune entrée `notable` dans l'écart : rien non plus. C'est ce verrou qui
 *   remplace le bandeau affiché à chaque livraison.
 */
export function announcementFor(
  seen: string | null,
  current: string,
): UpdateAnnouncement {
  if (!seen) return SILENT;
  if (compareVersions(seen, current) >= 0) return SILENT;

  const missed = entriesBetween(seen, current);
  if (!missed.some((entry: ChangelogEntry) => entry.notable)) return SILENT;

  return { announce: true, changeCount: countChanges(missed) };
}

export type AppUpdatedResult = UpdateAnnouncement & {
  /** La version qui tourne maintenant. */
  version: string;
  /** Referme le bandeau pour de bon. */
  dismiss: () => void;
};

/**
 * Décide s'il faut annoncer la mise à jour, et retient que c'est fait.
 *
 * La version en cours est notée vue dès le premier rendu : le bandeau se
 * montre une fois, pas à chaque écran visité.
 */
export function useAppUpdated(currentVersion: string): AppUpdatedResult {
  const [announcement] = useState<UpdateAnnouncement>(() => {
    if (typeof window === "undefined") return SILENT;

    const seen = readSeenVersion();
    const decision = announcementFor(seen, currentVersion);
    if (!seen || compareVersions(seen, currentVersion) < 0) {
      writeSeenVersion(currentVersion);
    }
    return decision;
  });

  const [dismissed, setDismissed] = useState(false);
  const dismiss = useCallback(() => setDismissed(true), []);

  return {
    announce: announcement.announce && !dismissed,
    changeCount: announcement.changeCount,
    version: currentVersion,
    dismiss,
  };
}
