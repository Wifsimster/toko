// A "parcours" chains one or more questionnaires. Single questionnaires are
// one-section parcours; the complete ones cover the disorders that often
// co-occur (ADHD + autism = "AuDHD", ADHD + ODD…) in one go.

import {
  QUESTIONNAIRES,
  isQuestionnaireId,
  type Audience,
  type Localized,
  type Questionnaire,
  type QuestionnaireId,
  type Topic,
} from "./questionnaires";
import type { Level } from "./scoring";

export type CompleteId = "complet-adulte" | "complet-enfant";
export type ParcoursId = QuestionnaireId | CompleteId;

export interface Parcours {
  id: ParcoursId;
  audience: Audience;
  title: Localized;
  subtitle: Localized;
  minutes: number;
  sections: Questionnaire[];
}

const COMPLETE: Record<CompleteId, Omit<Parcours, "minutes"> & { minutes?: number }> = {
  "complet-adulte": {
    id: "complet-adulte",
    audience: "self",
    title: { fr: "Le parcours complet : TDAH et autisme", en: "The full check: ADHD and autism" },
    subtitle: {
      fr: "Les deux se croisent souvent (on parle d'AuDHD). Les deux questionnaires à la suite, avec un résultat commun.",
      en: "They often overlap (\"AuDHD\"). Both questionnaires in a row, with a combined result.",
    },
    sections: [QUESTIONNAIRES["tdah-adulte"], QUESTIONNAIRES["autisme-adulte"]],
  },
  "complet-enfant": {
    id: "complet-enfant",
    audience: "child",
    title: {
      fr: "Le parcours complet : TDAH, opposition et autisme",
      en: "The full check: ADHD, defiance and autism",
    },
    subtitle: {
      fr: "Ces troubles se croisent souvent. Les trois questionnaires à la suite, avec un résultat commun.",
      en: "These conditions often overlap. The three questionnaires in a row, with a combined result.",
    },
    sections: [
      QUESTIONNAIRES["tdah-enfant"],
      QUESTIONNAIRES["top-enfant"],
      QUESTIONNAIRES["autisme-enfant"],
    ],
  },
};

export const COMPLETE_IDS = Object.keys(COMPLETE) as CompleteId[];

export function isParcoursId(value: string): value is ParcoursId {
  return isQuestionnaireId(value) || value in COMPLETE;
}

export function getParcours(id: ParcoursId): Parcours {
  if (isQuestionnaireId(id)) {
    const q = QUESTIONNAIRES[id];
    return {
      id,
      audience: q.audience,
      title: q.title,
      subtitle: q.subtitle,
      minutes: q.minutes,
      sections: [q],
    };
  }
  const c = COMPLETE[id];
  return { ...c, minutes: c.sections.reduce((sum, q) => sum + q.minutes, 0) };
}

export function completeFor(audience: Audience): Parcours {
  return getParcours(audience === "self" ? "complet-adulte" : "complet-enfant");
}

export function questionCount(p: Parcours): number {
  return p.sections.reduce((sum, q) => sum + q.items.length, 0);
}

// ─── Overlaps ────────────────────────────────────────────────────────────

export interface OverlapNote {
  topics: [Topic, Topic];
  title: Localized;
  text: Localized;
}

const OVERLAPS: OverlapNote[] = [
  {
    topics: ["tdah", "autisme"],
    title: { fr: "TDAH et autisme ensemble : l'AuDHD", en: "ADHD and autism together: AuDHD" },
    text: {
      fr: "Les deux se retrouvent très souvent chez la même personne, et ils peuvent se masquer l'un l'autre : l'agitation cache des signes d'autisme, ou le besoin de routine cache la distraction. Demandez une évaluation qui regarde les deux, et apportez les deux résultats.",
      en: "They very often show up in the same person, and they can mask each other: restlessness hides autistic signs, or the need for routine hides distractibility. Ask for an assessment that looks at both, and bring both results.",
    },
  },
  {
    topics: ["tdah", "top"],
    title: { fr: "TDAH et opposition", en: "ADHD and defiance" },
    text: {
      fr: "L'opposition accompagne souvent le TDAH chez l'enfant. Quand l'attention et l'agitation sont mieux accompagnées, et les parents soutenus, l'opposition s'apaise souvent elle aussi.",
      en: "Defiance often comes with ADHD in children. When attention and restlessness get support, and parents do too, defiance often eases as well.",
    },
  },
  {
    topics: ["top", "autisme"],
    title: { fr: "Opposition et autisme", en: "Defiance and autism" },
    text: {
      fr: "Chez un enfant autiste, ce qui ressemble à de l'opposition vient parfois d'une surcharge sensorielle, d'un changement de routine ou d'une consigne mal comprise. Un professionnel aide à faire la différence.",
      en: "In an autistic child, what looks like defiance sometimes comes from sensory overload, a change of routine or an instruction that wasn't understood. A professional can help tell them apart.",
    },
  },
];

/**
 * Notes for every pair of topics that both stand out: at least one at the
 * threshold and the other at least close to it.
 */
export function overlapNotes(results: { topic: Topic; level: Level }[]): OverlapNote[] {
  const levelOf = new Map(results.map((r) => [r.topic, r.level]));
  return OVERLAPS.filter(({ topics: [a, b] }) => {
    const la = levelOf.get(a);
    const lb = levelOf.get(b);
    if (!la || !lb || la === "low" || lb === "low") return false;
    return la === "high" || lb === "high";
  });
}
