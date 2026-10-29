export type ChangeKind = "new" | "improved" | "fixed";

export type ChangelogChange = {
  kind: ChangeKind;
  fr: string;
  en: string;
  detailFr?: string;
  detailEn?: string;
};

export type ChangelogEntry = {
  version: string;
  date: string;
  notable: boolean;
  changes: ChangelogChange[];
};

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

export function countChanges(entries: readonly ChangelogEntry[]): number {
  return entries.reduce((total, entry) => total + entry.changes.length, 0);
}

export function latestDocumentedVersion(): string | null {
  return changelog[0]?.version ?? null;
}
