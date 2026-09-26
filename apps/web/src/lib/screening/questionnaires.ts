// Questionnaires de repérage publics (/quiz).
//
// Uniquement des outils validés, libres d'usage, avec leur cotation d'origine :
// - ASRS v1.1 partie A (OMS) — TDAH adulte, 6 items
// - SNAP-IV (Swanson) — TDAH enfant (18 items) et TOP (8 items), version parent
// - AQ-10 adulte et AQ-10 enfant (Autism Research Centre, Cambridge)
//
// Tout est calculé dans le navigateur : aucune réponse ni aucun résultat ne
// quitte l'appareil. Les formulations sont reformulées sans le lexique banni
// par scripts/check-guilt-lexicon.mjs (oubli, retard, échec, faute…).

export type Lang = "fr" | "en";
export type Localized = Record<Lang, string>;

export type QuestionnaireId =
  | "tdah-adulte"
  | "tdah-enfant"
  | "top-enfant"
  | "autisme-adulte"
  | "autisme-enfant";

export type Audience = "self" | "child";
export type Topic = "tdah" | "top" | "autisme";

export interface ScaleOption {
  value: number;
  label: Localized;
}

/** An item counts as a "sign" when its answer is ≥ gte or ≤ lte. */
export type PositiveRule = { gte: number } | { lte: number };

export interface Item {
  id: string;
  text: Localized;
  /** Everyday illustration shown under the question. */
  example?: Localized;
  dimension: string;
  positive: PositiveRule;
}

export interface Dimension {
  id: string;
  label: Localized;
  /** Number of positive items from which the dimension is flagged. */
  threshold: number;
}

export interface NextStep {
  text: Localized;
  url?: string;
  /** Hidden in the complete parcours, where it would be redundant. */
  aloneOnly?: boolean;
}

export interface Questionnaire {
  id: QuestionnaireId;
  audience: Audience;
  topic: Topic;
  title: Localized;
  subtitle: Localized;
  /** Shown above every question. */
  prompt: Localized;
  minutes: number;
  source: { name: string; detail: Localized };
  scale: ScaleOption[];
  dimensions: Dimension[];
  items: Item[];
  nextSteps: NextStep[];
}

const FREQUENCY: ScaleOption[] = [
  { value: 0, label: { fr: "Jamais", en: "Never" } },
  { value: 1, label: { fr: "Rarement", en: "Rarely" } },
  { value: 2, label: { fr: "Parfois", en: "Sometimes" } },
  { value: 3, label: { fr: "Souvent", en: "Often" } },
  { value: 4, label: { fr: "Très souvent", en: "Very often" } },
];

const INTENSITY: ScaleOption[] = [
  { value: 0, label: { fr: "Pas du tout", en: "Not at all" } },
  { value: 1, label: { fr: "Un peu", en: "Just a little" } },
  { value: 2, label: { fr: "Beaucoup", en: "Quite a bit" } },
  { value: 3, label: { fr: "Énormément", en: "Very much" } },
];

const AGREEMENT: ScaleOption[] = [
  { value: 0, label: { fr: "Tout à fait d'accord", en: "Definitely agree" } },
  { value: 1, label: { fr: "Plutôt d'accord", en: "Slightly agree" } },
  { value: 2, label: { fr: "Plutôt pas d'accord", en: "Slightly disagree" } },
  { value: 3, label: { fr: "Pas du tout d'accord", en: "Definitely disagree" } },
];

// AQ-10 keys: some items score on agreement, others on disagreement.
const AGREE: PositiveRule = { lte: 1 };
const DISAGREE: PositiveRule = { gte: 2 };

const PCO_TND: NextStep = {
  text: {
    fr: "Pour un enfant de 0 à 12 ans, le médecin peut adresser votre famille à une plateforme de coordination et d'orientation (PCO-TND). Les bilans y sont pris en charge, sans avance de frais.",
    en: "For children aged 0 to 12 in France, the doctor can refer your family to a PCO-TND coordination platform. Assessments there are covered, with nothing to pay upfront.",
  },
  url: "https://handicap.gouv.fr/les-plateformes-de-coordination-et-dorientation",
};

const CRA: NextStep = {
  text: {
    fr: "Les Centres Ressources Autisme (CRA) informent et orientent, dans chaque région.",
    en: "Autism Resource Centres (CRA) inform and refer people in every French region.",
  },
  url: "https://gncra.fr/",
};

export const QUESTIONNAIRES: Record<QuestionnaireId, Questionnaire> = {
  "tdah-adulte": {
    id: "tdah-adulte",
    audience: "self",
    topic: "tdah",
    title: { fr: "Attention et agitation (TDAH)", en: "Attention and restlessness (ADHD)" },
    subtitle: {
      fr: "Le questionnaire de repérage de l'OMS pour les adultes.",
      en: "The WHO screening questionnaire for adults.",
    },
    prompt: { fr: "Ces 6 derniers mois…", en: "Over the past 6 months…" },
    minutes: 2,
    source: {
      name: "ASRS v1.1 (partie A) — Organisation mondiale de la santé",
      detail: {
        fr: "4 réponses dans la zone repère sur 6 : c'est le seuil utilisé par les professionnels pour proposer une évaluation.",
        en: "4 answers out of 6 in the marked zone is the threshold professionals use to suggest an assessment.",
      },
    },
    scale: FREQUENCY,
    dimensions: [
      { id: "asrs", label: { fr: "Signes d'un TDAH", en: "ADHD signs" }, threshold: 4 },
    ],
    items: [
      {
        id: "asrs1",
        dimension: "asrs",
        positive: { gte: 2 },
        text: {
          fr: "À quelle fréquence avez-vous du mal à finaliser les derniers détails d'un projet, une fois que les parties les plus intéressantes sont faites ?",
          en: "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
        },
        example: {
          fr: "Le salon est presque rangé… et la dernière pile reste là des jours.",
          en: "The living room is almost tidy… and the last pile stays there for days.",
        },
      },
      {
        id: "asrs2",
        dimension: "asrs",
        positive: { gte: 2 },
        text: {
          fr: "À quelle fréquence avez-vous du mal à mettre les choses en ordre quand une tâche demande de l'organisation ?",
          en: "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
        },
        example: {
          fr: "Préparer un départ en vacances, un dossier administratif, un repas de famille.",
          en: "Packing for a trip, a pile of paperwork, a family dinner.",
        },
      },
      {
        id: "asrs3",
        dimension: "asrs",
        positive: { gte: 2 },
        text: {
          fr: "À quelle fréquence avez-vous du mal à vous souvenir de vos rendez-vous ou de vos obligations ?",
          en: "How often do you have problems remembering appointments or obligations?",
        },
        example: {
          fr: "Le rendez-vous chez le médecin vous revient en tête une fois l'heure passée.",
          en: "The doctor's appointment comes back to mind once the time has passed.",
        },
      },
      {
        id: "asrs4",
        dimension: "asrs",
        positive: { gte: 3 },
        text: {
          fr: "Quand une tâche demande beaucoup de réflexion, à quelle fréquence évitez-vous de la commencer ou la remettez-vous à plus tard ?",
          en: "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?",
        },
        example: {
          fr: "« Envoyer ce document » devient : ouvrir l'ordi, retrouver le fichier, répondre à 4 mails…",
          en: "\"Send this document\" turns into: open the laptop, find the file, answer 4 emails…",
        },
      },
      {
        id: "asrs5",
        dimension: "asrs",
        positive: { gte: 3 },
        text: {
          fr: "À quelle fréquence remuez-vous les mains ou les pieds, ou vous tortillez-vous, quand vous devez rester assis longtemps ?",
          en: "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
        },
        example: {
          fr: "En réunion, au cinéma, pendant un repas qui s'éternise.",
          en: "In a meeting, at the cinema, during a dinner that drags on.",
        },
      },
      {
        id: "asrs6",
        dimension: "asrs",
        positive: { gte: 3 },
        text: {
          fr: "À quelle fréquence vous sentez-vous trop actif, poussé à faire des choses, comme si un moteur vous entraînait ?",
          en: "How often do you feel overly active and compelled to do things, like you were driven by a motor?",
        },
        example: {
          fr: "Impossible de finir un film sans se lever « juste pour un truc ».",
          en: "You can't get through a film without getting up \"just for one thing\".",
        },
      },
    ],
    nextSteps: [
      {
        text: {
          fr: "Parlez-en à votre médecin traitant. Il peut vous orienter vers un psychiatre ou un centre expert du TDAH de l'adulte.",
          en: "Talk to your GP. They can refer you to a psychiatrist or an adult ADHD clinic.",
        },
      },
      {
        text: {
          fr: "Notez 2 ou 3 situations concrètes de votre quotidien : c'est ce qui aide le plus pendant le rendez-vous.",
          en: "Write down 2 or 3 concrete situations from daily life: that is what helps most during the appointment.",
        },
      },
      {
        text: {
          fr: "L'association HyperSupers – TDAH France propose de l'information et des groupes d'entraide.",
          en: "The French association HyperSupers – TDAH France offers information and peer-support groups.",
        },
        url: "https://www.tdah-france.fr/",
      },
    ],
  },

  "tdah-enfant": {
    id: "tdah-enfant",
    audience: "child",
    topic: "tdah",
    title: { fr: "Attention et agitation (TDAH)", en: "Attention and restlessness (ADHD)" },
    subtitle: {
      fr: "Le questionnaire SNAP-IV, à remplir par un parent. À partir de 6 ans.",
      en: "The SNAP-IV questionnaire, filled in by a parent. From age 6.",
    },
    prompt: {
      fr: "Ces 6 derniers mois, votre enfant…",
      en: "Over the past 6 months, your child…",
    },
    minutes: 4,
    source: {
      name: "SNAP-IV 18 items (Swanson, Nolan & Pelham) — version parent",
      detail: {
        fr: "Une réponse « Beaucoup » ou « Énormément » compte comme un signe. 6 signes sur 9 dans une partie : c'est le repère des critères du TDAH.",
        en: "An answer of \"Quite a bit\" or \"Very much\" counts as a sign. 6 signs out of 9 in one part matches the ADHD criteria.",
      },
    },
    scale: INTENSITY,
    dimensions: [
      { id: "inattention", label: { fr: "Attention", en: "Inattention" }, threshold: 6 },
      {
        id: "hyperactivite",
        label: { fr: "Agitation et impulsivité", en: "Hyperactivity and impulsivity" },
        threshold: 6,
      },
    ],
    items: (
      [
        ["inattention", "Ne prête pas attention aux détails, fait des erreurs d'inattention dans ses devoirs ou ses activités.", "Fails to give close attention to details or makes careless mistakes in schoolwork or tasks.", "Il saute une ligne de l'exercice, ou lit « + » à la place de « − ».", "Skips a line in the exercise, or reads \"+\" instead of \"−\"."],
        ["inattention", "A du mal à rester concentré sur une tâche ou un jeu.", "Has difficulty sustaining attention in tasks or play activities.", undefined, undefined],
        ["inattention", "Semble ne pas écouter quand on lui parle directement.", "Does not seem to listen when spoken to directly.", "« Mets tes chaussures », trois fois, sans réaction.", "\"Put your shoes on\", three times, no reaction."],
        ["inattention", "Ne va pas au bout des consignes, ne termine pas ses devoirs ou ses tâches.", "Does not follow through on instructions and does not finish schoolwork or chores.", undefined, undefined],
        ["inattention", "A du mal à organiser ses tâches et ses activités.", "Has difficulty organizing tasks and activities.", "Préparer son cartable seul reste compliqué.", "Packing the school bag alone is still hard."],
        ["inattention", "Évite ou traîne devant les tâches qui demandent un effort mental soutenu.", "Avoids, dislikes or is reluctant to do tasks requiring sustained mental effort.", "Les devoirs du soir qui durent une heure pour dix minutes de travail.", "Homework that takes an hour for ten minutes of work."],
        ["inattention", "Égare les affaires nécessaires à ses activités.", "Loses things necessary for activities.", "Trousse, gourde, gilet, cahier de liaison…", "Pencil case, water bottle, jumper, school notebook…"],
        ["inattention", "Est facilement distrait par ce qui se passe autour de lui.", "Is easily distracted by what happens around them.", undefined, undefined],
        ["inattention", "A du mal à se souvenir des choses du quotidien.", "Is forgetful in daily activities.", "Se brosser les dents, rapporter le mot de la maîtresse.", "Brushing teeth, bringing back the teacher's note."],
        ["hyperactivite", "Bouge les mains ou les pieds, se tortille sur sa chaise.", "Fidgets with hands or feet or squirms in seat.", undefined, undefined],
        ["hyperactivite", "Se lève quand il faudrait rester assis (en classe, à table…).", "Leaves seat when remaining seated is expected (in class, at the table…).", undefined, undefined],
        ["hyperactivite", "Court ou grimpe partout, quand ce n'est pas le moment.", "Runs about or climbs excessively when it is inappropriate.", undefined, undefined],
        ["hyperactivite", "A du mal à jouer ou à se détendre calmement.", "Has difficulty playing or engaging in leisure activities quietly.", undefined, undefined],
        ["hyperactivite", "Est toujours en mouvement, comme « monté sur ressorts ».", "Is \"on the go\", acts as if \"driven by a motor\".", undefined, undefined],
        ["hyperactivite", "Parle beaucoup.", "Talks excessively.", undefined, undefined],
        ["hyperactivite", "Répond avant la fin de la question.", "Blurts out answers before questions have been completed.", undefined, undefined],
        ["hyperactivite", "A du mal à attendre son tour.", "Has difficulty awaiting turn.", "Au jeu de société, à la boulangerie, pour parler.", "At board games, in a queue, to speak."],
        ["hyperactivite", "Interrompt les autres, s'impose dans leurs conversations ou leurs jeux.", "Interrupts or intrudes on others (conversations, games).", undefined, undefined],
      ] as const
    ).map(([dimension, fr, en, exFr, exEn], i) => ({
      id: `snap${i + 1}`,
      dimension,
      positive: { gte: 2 },
      text: { fr, en },
      ...(exFr && exEn ? { example: { fr: exFr, en: exEn } } : {}),
    })),
    nextSteps: [
      {
        text: {
          fr: "Parlez-en à votre médecin traitant ou à votre pédiatre, en apportant ce résumé.",
          en: "Talk to your GP or paediatrician and bring this summary.",
        },
      },
      PCO_TND,
      {
        text: {
          fr: "Demandez à l'enseignant ce qu'il observe en classe : les signes d'un TDAH se voient dans au moins deux lieux de vie.",
          en: "Ask the teacher what they see in class: ADHD signs show up in at least two settings.",
        },
      },
    ],
  },

  "top-enfant": {
    id: "top-enfant",
    audience: "child",
    topic: "top",
    title: { fr: "Colère et opposition (TOP)", en: "Anger and defiance (ODD)" },
    subtitle: {
      fr: "Les 8 questions du SNAP-IV sur l'opposition, à remplir par un parent. À partir de 6 ans.",
      en: "The 8 SNAP-IV questions on defiance, filled in by a parent. From age 6.",
    },
    prompt: {
      fr: "Ces 6 derniers mois, votre enfant…",
      en: "Over the past 6 months, your child…",
    },
    minutes: 2,
    source: {
      name: "SNAP-IV, items opposition (Swanson, Nolan & Pelham) — version parent",
      detail: {
        fr: "Une réponse « Beaucoup » ou « Énormément » compte comme un signe. 4 signes sur 8 : c'est le repère des critères du trouble oppositionnel avec provocation.",
        en: "An answer of \"Quite a bit\" or \"Very much\" counts as a sign. 4 signs out of 8 matches the criteria for oppositional defiant disorder.",
      },
    },
    scale: INTENSITY,
    dimensions: [
      { id: "opposition", label: { fr: "Opposition", en: "Defiance" }, threshold: 4 },
    ],
    items: (
      [
        ["Se met en colère, perd son calme.", "Loses temper.", "Pour un écran qu'on éteint ou un pull à enfiler.", "Over a screen being switched off or a jumper to put on."],
        ["Se dispute avec les adultes.", "Argues with adults.", undefined, undefined],
        ["S'oppose activement aux demandes ou aux règles des adultes, refuse de s'y plier.", "Actively defies or refuses adult requests or rules.", "« Non ! » avant même la fin de la phrase.", "\"No!\" before the sentence is even over."],
        ["Fait exprès des choses qui agacent les autres.", "Deliberately does things that annoy other people.", undefined, undefined],
        ["Rejette sur les autres la responsabilité de ses erreurs ou de son comportement.", "Blames others for his or her mistakes or misbehaviour.", "« C'est lui qui a commencé ! »", "\"He started it!\""],
        ["Est susceptible, facilement agacé par les autres.", "Is touchy or easily annoyed by others.", undefined, undefined],
        ["Est fâché, garde de la rancœur.", "Is angry and resentful.", undefined, undefined],
        ["Cherche à se venger, à rendre la pareille.", "Is spiteful or vindictive.", undefined, undefined],
      ] as const
    ).map(([fr, en, exFr, exEn], i) => ({
      id: `odd${i + 1}`,
      dimension: "opposition",
      positive: { gte: 2 },
      text: { fr, en },
      ...(exFr && exEn ? { example: { fr: exFr, en: exEn } } : {}),
    })),
    nextSteps: [
      {
        text: {
          fr: "Parlez-en à votre médecin traitant ou à votre pédiatre, en apportant ce résumé.",
          en: "Talk to your GP or paediatrician and bring this summary.",
        },
      },
      {
        aloneOnly: true,
        text: {
          fr: "L'opposition va souvent de pair avec un TDAH : le questionnaire TDAH enfant complète bien celui-ci.",
          en: "Defiance often goes hand in hand with ADHD: the child ADHD questionnaire is a good complement.",
        },
      },
      {
        text: {
          fr: "L'aide recommandée en premier, ce sont les programmes d'entraînement aux habiletés parentales (type Barkley). Ils apaisent les échanges à la maison, sans chercher de coupable.",
          en: "The first-line help is a parent training programme (such as Barkley's). It calms things down at home, without looking for someone to blame.",
        },
      },
    ],
  },

  "autisme-adulte": {
    id: "autisme-adulte",
    audience: "self",
    topic: "autisme",
    title: { fr: "Relations, sensations, routines (autisme)", en: "Social life, senses, routines (autism)" },
    subtitle: {
      fr: "Le questionnaire AQ-10, recommandé pour les adultes.",
      en: "The AQ-10 questionnaire, recommended for adults.",
    },
    prompt: {
      fr: "Êtes-vous d'accord avec cette phrase ?",
      en: "Do you agree with this statement?",
    },
    minutes: 2,
    source: {
      name: "AQ-10 adulte — Autism Research Centre, Université de Cambridge",
      detail: {
        fr: "6 points sur 10 : c'est le seuil à partir duquel une évaluation spécialisée est conseillée.",
        en: "6 points out of 10 is the threshold from which a specialist assessment is advised.",
      },
    },
    scale: AGREEMENT,
    dimensions: [
      { id: "aq", label: { fr: "Traits autistiques", en: "Autistic traits" }, threshold: 6 },
    ],
    items: (
      [
        [AGREE, "Je remarque souvent de petits bruits que les autres ne remarquent pas.", "I often notice small sounds when others do not."],
        [DISAGREE, "Je me concentre plus sur l'ensemble que sur les petits détails.", "I usually concentrate more on the whole picture, rather than the small details."],
        [DISAGREE, "Il m'est facile de faire plusieurs choses à la fois.", "I find it easy to do more than one thing at once."],
        [DISAGREE, "Quand on m'interrompt, je reprends très vite ce que je faisais.", "If there is an interruption, I can switch back to what I was doing very quickly."],
        [DISAGREE, "Je comprends facilement les sous-entendus quand on me parle.", "I find it easy to \"read between the lines\" when someone is talking to me."],
        [DISAGREE, "Je sais voir quand la personne qui m'écoute commence à s'ennuyer.", "I know how to tell if someone listening to me is getting bored."],
        [AGREE, "Quand je lis une histoire, j'ai du mal à deviner les intentions des personnages.", "When I'm reading a story, I find it difficult to work out the characters' intentions."],
        [AGREE, "J'aime rassembler des informations sur des catégories de choses (voitures, oiseaux, trains, plantes…).", "I like to collect information about categories of things (types of car, bird, train, plant…)."],
        [DISAGREE, "Je devine facilement ce que quelqu'un pense ou ressent rien qu'en regardant son visage.", "I find it easy to work out what someone is thinking or feeling just by looking at their face."],
        [AGREE, "J'ai du mal à comprendre les intentions des gens.", "I find it difficult to work out people's intentions."],
      ] as const
    ).map(([positive, fr, en], i) => ({
      id: `aqa${i + 1}`,
      dimension: "aq",
      positive,
      text: { fr, en },
    })),
    nextSteps: [
      {
        text: {
          fr: "Parlez-en à votre médecin traitant : il peut vous orienter vers un psychiatre ou une équipe spécialisée dans l'autisme de l'adulte.",
          en: "Talk to your GP: they can refer you to a psychiatrist or an adult autism team.",
        },
      },
      CRA,
      {
        text: {
          fr: "Autisme Info Service répond gratuitement aux questions des personnes et des proches.",
          en: "Autisme Info Service answers questions from autistic people and families for free (in French).",
        },
        url: "https://www.autismeinfoservice.fr/",
      },
    ],
  },

  "autisme-enfant": {
    id: "autisme-enfant",
    audience: "child",
    topic: "autisme",
    title: { fr: "Relations, sensations, routines (autisme)", en: "Social life, senses, routines (autism)" },
    subtitle: {
      fr: "Le questionnaire AQ-10 enfant, à remplir par un parent. De 4 à 11 ans.",
      en: "The child AQ-10, filled in by a parent. Ages 4 to 11.",
    },
    prompt: {
      fr: "Êtes-vous d'accord avec cette phrase sur votre enfant ?",
      en: "Do you agree with this statement about your child?",
    },
    minutes: 2,
    source: {
      name: "AQ-10 enfant — Autism Research Centre, Université de Cambridge",
      detail: {
        fr: "6 points sur 10 : c'est le seuil à partir duquel une évaluation spécialisée est conseillée.",
        en: "6 points out of 10 is the threshold from which a specialist assessment is advised.",
      },
    },
    scale: AGREEMENT,
    dimensions: [
      { id: "aq", label: { fr: "Traits autistiques", en: "Autistic traits" }, threshold: 6 },
    ],
    items: (
      [
        [AGREE, "Votre enfant remarque souvent de petits bruits que les autres ne remarquent pas.", "S/he often notices small sounds when others do not."],
        [DISAGREE, "Votre enfant se concentre plus sur l'ensemble que sur les petits détails.", "S/he usually concentrates more on the whole picture, rather than the small details."],
        [DISAGREE, "Dans un groupe, votre enfant suit facilement plusieurs conversations à la fois.", "In a social group, s/he can easily keep track of several different people's conversations."],
        [DISAGREE, "Votre enfant passe facilement d'une activité à une autre.", "S/he finds it easy to go back and forth between different activities."],
        [AGREE, "Votre enfant ne sait pas comment faire durer une conversation avec les enfants de son âge.", "S/he doesn't know how to keep a conversation going with his/her peers."],
        [DISAGREE, "Votre enfant est à l'aise pour bavarder de tout et de rien.", "S/he is good at social chit-chat."],
        [AGREE, "Quand on lui lit une histoire, votre enfant a du mal à deviner les intentions ou les émotions des personnages.", "When s/he is read a story, s/he finds it difficult to work out the characters' intentions or feelings."],
        [DISAGREE, "En maternelle, votre enfant aimait jouer à « faire semblant » avec d'autres enfants.", "In preschool, s/he used to enjoy pretend play with other children."],
        [DISAGREE, "Votre enfant devine facilement ce que quelqu'un pense ou ressent en regardant son visage.", "S/he finds it easy to work out what someone is thinking or feeling just by looking at their face."],
        [AGREE, "Votre enfant a du mal à se faire de nouveaux amis.", "S/he finds it hard to make new friends."],
      ] as const
    ).map(([positive, fr, en], i) => ({
      id: `aqc${i + 1}`,
      dimension: "aq",
      positive,
      text: { fr, en },
    })),
    nextSteps: [
      {
        text: {
          fr: "Parlez-en à votre médecin traitant ou à votre pédiatre, en apportant ce résumé.",
          en: "Talk to your GP or paediatrician and bring this summary.",
        },
      },
      PCO_TND,
      CRA,
    ],
  },
};

export const QUESTIONNAIRE_IDS = Object.keys(QUESTIONNAIRES) as QuestionnaireId[];

export function isQuestionnaireId(value: string): value is QuestionnaireId {
  return value in QUESTIONNAIRES;
}

export function pick(text: Localized, lang: string): string {
  return lang.startsWith("en") ? text.en : text.fr;
}
