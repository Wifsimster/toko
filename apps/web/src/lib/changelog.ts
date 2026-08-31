/**
 * Journal des versions, rédigé à la main.
 *
 * Une entrée par version qui mérite d'être racontée à un parent — les
 * `chore:`, refactos et bumps de dépendances n'y figurent pas. Le texte est
 * écrit en français ET en anglais dans la même entrée, pour qu'une version ne
 * puisse pas partir traduite à moitié.
 *
 * `notable` décide de l'interruption : seule une entrée notable affiche le
 * bandeau « Tokō a été mis à jour » après coup. Un correctif interne que le
 * parent n'a jamais vu passer ne déclenche rien du tout.
 */

export type ChangeKind = "new" | "improved" | "fixed";

export type ChangelogChange = {
  kind: ChangeKind;
  /** Une phrase courte : le bénéfice concret, pas le détail technique. */
  fr: string;
  en: string;
  /** Seconde phrase facultative, affichée en retrait. */
  detailFr?: string;
  detailEn?: string;
};

export type ChangelogEntry = {
  /** Version semver exacte, telle que publiée (`2.10.0`). */
  version: string;
  /** Jour de la livraison, au format `AAAA-MM-JJ`. */
  date: string;
  /** `true` = le parent est prévenu après la mise à jour. */
  notable: boolean;
  changes: ChangelogChange[];
};

/** De la plus récente à la plus ancienne. */
export const changelog: readonly ChangelogEntry[] = [
  {
    version: "2.10.0",
    date: "2026-08-31",
    notable: true,
    changes: [
      {
        kind: "new",
        fr: "Tokō vous dit maintenant ce qui change.",
        en: "Tokō now tells you what changed.",
        detailFr:
          "À chaque mise à jour, retrouvez ici les nouveautés et les corrections, expliquées simplement.",
        detailEn:
          "With every update, find the new features and fixes here, in plain words.",
      },
    ],
  },
];

/** Compare deux versions semver. < 0 si `a` précède `b`. */
export function compareVersions(a: string, b: string): number {
  const parse = (v: string) =>
    v.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const left = parse(a);
  const right = parse(b);
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/**
 * Les entrées livrées entre deux versions : `from` exclu, `to` inclus.
 * C'est ce que le parent a manqué depuis sa dernière visite.
 */
export function entriesBetween(
  from: string,
  to: string,
): readonly ChangelogEntry[] {
  return changelog.filter(
    (entry) =>
      compareVersions(entry.version, from) > 0 &&
      compareVersions(entry.version, to) <= 0,
  );
}

/** Nombre de changements sur une plage de versions — sert au résumé du bandeau. */
export function countChanges(entries: readonly ChangelogEntry[]): number {
  return entries.reduce((total, entry) => total + entry.changes.length, 0);
}

/** La version la plus récente pour laquelle une entrée existe. */
export function latestDocumentedVersion(): string | null {
  return changelog[0]?.version ?? null;
}
