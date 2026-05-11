// Communication scripts catalogue. Each entry is a recurring social
// situation the parent of a TDAH child runs into (a teacher calling
// home, a grandparent minimizing, a "c'est juste un caprice" jab in
// the family group chat). The script gives them a small set of
// ready-to-use phrases so they don't have to invent a response under
// shock.
//
// Adapted from popular vulgarisation (Caroline Goldman, HyperSupers,
// INSERM dossier TDAH). Each script avoids the word "diagnostic" in
// the user-facing copy where possible (forbidden by
// `docs/freemium-ethics-policy.md` § 5 outside of legitimate medical
// contexts).

export type ScriptId =
  | "schoolCall"
  | "grandparent"
  | "caprice"
  | "pedopsyPrep"
  | "announceCondition"
  | "papRequest"
  | "misplacedRemark"
  | "presentTreatment";

export const SCRIPT_IDS: readonly ScriptId[] = [
  "schoolCall",
  "grandparent",
  "caprice",
  "pedopsyPrep",
  "announceCondition",
  "papRequest",
  "misplacedRemark",
  "presentTreatment",
];
