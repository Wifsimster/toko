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
    return null;
  }
}

function writeSeenVersion(version: string): void {
  try {
    window.localStorage.setItem(SEEN_VERSION_KEY, version);
  } catch {
  }
}

export type UpdateAnnouncement = {
  announce: boolean;
  changeCount: number;
};

const SILENT: UpdateAnnouncement = { announce: false, changeCount: 0 };

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
  version: string;
  dismiss: () => void;
};

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
