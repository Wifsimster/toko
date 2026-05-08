// Curated French care-pathway for ADHD diagnosis and follow-up.
//
// Step ids are stable strings — they're persisted in care_pathway_progress
// rows and shouldn't be renamed without a data migration. Add new steps
// freely (they default to "todo"); rewording the FR copy is fine since it
// lives entirely in the i18n bundle.

export type CarePathwayPhase =
  | "screening"
  | "diagnosis"
  | "support";

export interface CarePathwayStep {
  id: string;
  phase: CarePathwayPhase;
  emoji: string;
  /** Optional external resource the parent can open in a new tab. */
  externalLink?: { href: string; labelKey: string };
}

// Phase 1 — Repérage : éliminer ce qui n'est pas du TDAH avant de chercher
// le TDAH (sommeil, audition, vue, langage, motricité). Ordre indicatif,
// pas obligatoire.
//
// Phase 2 — Diagnostic : passe par un médecin habilité (neuropédiatre,
// pédopsychiatre, médecin généraliste formé) pour le diagnostic médical
// formel, après bilan neuropsychologique.
//
// Phase 3 — Soutien : démarches MDPH, scolarité, suivi pluridisciplinaire.
export const CARE_PATHWAY_STEPS: CarePathwayStep[] = [
  // ─── Phase 1 — Repérage ──────────────────────────────────────
  { id: "school_signal", phase: "screening", emoji: "🏫" },
  { id: "gp_consultation", phase: "screening", emoji: "🩺" },
  { id: "ent_audition", phase: "screening", emoji: "👂" },
  { id: "ophtalmo_vision", phase: "screening", emoji: "👁️" },
  {
    id: "sleep_study",
    phase: "screening",
    emoji: "🌙",
    externalLink: {
      href: "https://www.has-sante.fr/jcms/c_2025618",
      labelKey: "carePathway.externalLinks.has",
    },
  },
  { id: "speech_therapy_assessment", phase: "screening", emoji: "💬" },
  { id: "psychomotor_assessment", phase: "screening", emoji: "🤸" },

  // ─── Phase 2 — Diagnostic ────────────────────────────────────
  { id: "neuropsy_assessment", phase: "diagnosis", emoji: "🧠" },
  { id: "specialist_consultation", phase: "diagnosis", emoji: "👨‍⚕️" },
  {
    id: "diagnosis_announcement",
    phase: "diagnosis",
    emoji: "📋",
  },
  { id: "second_opinion", phase: "diagnosis", emoji: "🤝" },

  // ─── Phase 3 — Soutien & accompagnement ──────────────────────
  {
    id: "mdph_application",
    phase: "support",
    emoji: "📝",
    externalLink: {
      href: "https://www.mdph.fr/",
      labelKey: "carePathway.externalLinks.mdph",
    },
  },
  {
    id: "aeeh_request",
    phase: "support",
    emoji: "💶",
    externalLink: {
      href: "https://www.service-public.fr/particuliers/vosdroits/F14809",
      labelKey: "carePathway.externalLinks.servicePublic",
    },
  },
  {
    id: "pch_request",
    phase: "support",
    emoji: "🛟",
    externalLink: {
      href: "https://www.service-public.fr/particuliers/vosdroits/F14202",
      labelKey: "carePathway.externalLinks.servicePublic",
    },
  },
  { id: "school_pap_pps", phase: "support", emoji: "🎒" },
  { id: "occupational_therapy", phase: "support", emoji: "✋" },
  { id: "ongoing_followup", phase: "support", emoji: "🔄" },
];

export const PHASES: CarePathwayPhase[] = ["screening", "diagnosis", "support"];

export function stepsByPhase(
  phase: CarePathwayPhase,
): CarePathwayStep[] {
  return CARE_PATHWAY_STEPS.filter((s) => s.phase === phase);
}
