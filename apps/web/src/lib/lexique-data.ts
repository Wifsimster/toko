import type { LexiqueTerm } from "./lexique-types";

/**
 * Liste volontairement non exhaustive : on garde les sigles réellement
 * rencontrés par un parent entre l'école, le médecin et la MDPH.
 * Ajouter un terme = ajouter une entrée ici, rien d'autre.
 */
export const lexiqueTerms: LexiqueTerm[] = [
  // ─── Troubles du neurodéveloppement ──────────────────────────────
  {
    term: "TND",
    label: "Trouble du neurodéveloppement",
    definition:
      "Grande famille de troubles liés au développement du cerveau : attention, langage, apprentissages, motricité, interactions sociales, émotions. Le TDAH en fait partie.",
    category: "neurodeveloppement",
    aliases: ["neurodeveloppement", "neurodéveloppemental"],
  },
  {
    term: "TDAH",
    label: "Trouble du déficit de l'attention avec ou sans hyperactivité",
    definition:
      "Difficultés durables à se concentrer, à gérer l'impulsivité, l'agitation (physique ou mentale), l'organisation, le temps et les émotions.",
    category: "neurodeveloppement",
    aliases: ["TDA", "hyperactivité", "deficit attention"],
    relatedSlug: "fonctions-executives-tdah-enfant",
  },
  {
    term: "TSA",
    label: "Trouble du spectre de l'autisme",
    definition:
      "Difficultés dans la communication et les interactions sociales, avec des intérêts ou des comportements restreints et répétitifs.",
    category: "neurodeveloppement",
    aliases: ["autisme", "asperger"],
  },
  {
    term: "DYS",
    label: "Troubles spécifiques des apprentissages",
    definition:
      "Dyslexie (lecture), dysorthographie (orthographe), dyscalculie (calcul), dyspraxie (coordination), dysphasie (langage oral). Ils s'associent souvent au TDAH.",
    category: "neurodeveloppement",
    aliases: [
      "dyslexie",
      "dyspraxie",
      "dyscalculie",
      "dysorthographie",
      "dysphasie",
    ],
  },
  {
    term: "Fonctions exécutives",
    definition:
      "Les fonctions du cerveau qui servent à démarrer une tâche, s'organiser, mémoriser une consigne, résister à une distraction et gérer ses émotions. C'est ce qui est fragilisé dans le TDAH.",
    category: "neurodeveloppement",
    aliases: ["executif", "inhibition", "memoire de travail"],
    relatedSlug: "fonctions-executives-tdah-enfant",
  },

  // ─── Diagnostics et classifications ──────────────────────────────
  {
    term: "DSM-5",
    label: "Manuel diagnostique et statistique des troubles mentaux",
    definition:
      "Manuel de référence américain qui décrit les critères des troubles mentaux. C'est lui qui liste les critères du TDAH utilisés par les médecins.",
    category: "diagnostic",
    aliases: ["DSM", "DSM5"],
  },
  {
    term: "CIM-11",
    label: "Classification internationale des maladies",
    definition:
      "Classification des maladies et problèmes de santé publiée par l'OMS. Elle sert notamment de référence administrative en France.",
    category: "diagnostic",
    aliases: ["CIM", "CIM11", "OMS"],
  },
  {
    term: "TED",
    label: "Trouble envahissant du développement",
    definition:
      "Ancienne appellation regroupant certains troubles du spectre de l'autisme. On dit aujourd'hui TSA. Vous pouvez encore la croiser dans des documents anciens.",
    category: "diagnostic",
    aliases: ["envahissant"],
  },
  {
    term: "HAS",
    label: "Haute Autorité de santé",
    definition:
      "Organisme public qui publie les recommandations officielles de prise en charge en France, dont celles sur le TDAH de l'enfant.",
    category: "diagnostic",
    aliases: ["recommandations"],
    relatedSlug: "apres-le-diagnostic-tdah-parcours-de-soins",
  },

  // ─── École et aménagements ───────────────────────────────────────
  {
    term: "PPRE",
    label: "Programme personnalisé de réussite éducative",
    definition:
      "Accompagnement pédagogique ciblé proposé par l'école à un élève en difficulté scolaire. Il se met en place sans dossier MDPH.",
    category: "ecole",
    aliases: ["reussite educative"],
  },
  {
    term: "PAP",
    label: "Plan d'accompagnement personnalisé",
    definition:
      "Aménagements pédagogiques (temps supplémentaire, supports adaptés…) pour un élève ayant un trouble des apprentissages : dys, TDAH, TSA. Il demande un avis du médecin scolaire, pas de dossier MDPH.",
    category: "ecole",
    aliases: ["amenagements", "medecin scolaire"],
  },
  {
    term: "PAI",
    label: "Projet d'accueil individualisé",
    definition:
      "Document mis en place quand l'enfant a une maladie chronique, une allergie ou un traitement à prendre pendant le temps scolaire.",
    category: "ecole",
    aliases: ["allergie", "traitement a l ecole"],
  },
  {
    term: "ESS",
    label: "Équipe de suivi de la scolarisation",
    definition:
      "Réunion annuelle qui fait le point sur la scolarité de l'enfant et le suivi du PPS. Vous y êtes invité et vous pouvez y parler.",
    category: "ecole",
    aliases: ["reunion", "equipe de suivi"],
  },
  {
    term: "ULIS",
    label: "Unité localisée pour l'inclusion scolaire",
    definition:
      "Dispositif d'une école ou d'un collège ordinaire qui accueille en petit groupe des élèves en situation de handicap, avec un enseignant spécialisé.",
    category: "ecole",
    aliases: ["inclusion", "classe adaptee"],
  },
  {
    term: "Enseignant référent",
    definition:
      "Enseignant de l'Éducation nationale qui fait le lien entre la famille, l'école et la MDPH. C'est lui qui organise les réunions ESS.",
    category: "ecole",
    aliases: ["referent"],
  },

  // ─── Handicap, droits et aides ───────────────────────────────────
  {
    term: "MDPH",
    label: "Maison départementale des personnes handicapées",
    definition:
      "Guichet unique du département pour demander des droits et des aides liés au handicap : AEEH, AESH, PPS, orientation vers une structure.",
    category: "handicap",
    aliases: ["dossier handicap", "CDAPH"],
    relatedSlug: "apres-le-diagnostic-tdah-parcours-de-soins",
  },
  {
    term: "PPS",
    label: "Projet personnalisé de scolarisation",
    definition:
      "Plan décidé par la MDPH qui définit les aménagements et les aides nécessaires à la scolarité d'un enfant en situation de handicap.",
    category: "handicap",
    aliases: ["scolarisation"],
  },
  {
    term: "AEEH",
    label: "Allocation d'éducation de l'enfant handicapé",
    definition:
      "Aide financière versée par la CAF pour compenser les dépenses liées au handicap (soins non remboursés, temps parental, transport).",
    category: "handicap",
    aliases: ["CAF", "allocation"],
  },
  {
    term: "AESH",
    label: "Accompagnant d'élève en situation de handicap",
    definition:
      "Personne qui accompagne l'enfant en classe pour l'aider dans les apprentissages et la vie quotidienne. L'aide peut être individuelle ou mutualisée.",
    category: "handicap",
    aliases: ["AVS", "accompagnant"],
  },
  {
    term: "PCH",
    label: "Prestation de compensation du handicap",
    definition:
      "Aide de la MDPH qui finance des besoins précis liés au handicap : aide humaine, matériel, aménagements. Elle peut compléter l'AEEH.",
    category: "handicap",
    aliases: ["compensation"],
  },

  // ─── Bilans et évaluations ───────────────────────────────────────
  {
    term: "Bilan neuropsychologique",
    definition:
      "Évaluation des fonctions cognitives (attention, mémoire, raisonnement, organisation) réalisée par un neuropsychologue. C'est une pièce clé du diagnostic de TDAH.",
    category: "bilans",
    aliases: ["neuropsy", "WISC", "tests cognitifs"],
    relatedSlug: "apres-le-diagnostic-tdah-parcours-de-soins",
  },
  {
    term: "Bilan orthophonique",
    definition:
      "Évaluation du langage oral et écrit par un orthophoniste : lecture, orthographe, compréhension, expression.",
    category: "bilans",
    aliases: ["orthophonie", "langage"],
  },
  {
    term: "Bilan psychomoteur",
    definition:
      "Évaluation du développement psychomoteur par un psychomotricien : coordination, équilibre, graphisme, gestion du corps et de l'agitation.",
    category: "bilans",
    aliases: ["psychomotricite", "motricite"],
  },
  {
    term: "GEVASCO",
    label:
      "Guide d'évaluation des besoins de compensation en matière de scolarisation",
    definition:
      "Document rempli par l'école et la famille, utilisé par la MDPH pour évaluer les besoins de l'enfant à l'école.",
    category: "bilans",
    aliases: ["GEVA", "evaluation scolaire"],
  },
  {
    term: "Échelles de Conners",
    definition:
      "Questionnaires remplis par les parents et les enseignants pour mesurer l'attention, l'agitation et l'impulsivité. Souvent demandés avant un diagnostic de TDAH.",
    category: "bilans",
    aliases: ["Conners", "questionnaire", "echelle"],
  },

  // ─── Professionnels ──────────────────────────────────────────────
  {
    term: "Pédiatre",
    definition:
      "Médecin spécialiste des enfants. Souvent le premier interlocuteur, il oriente vers les bilans et les spécialistes.",
    category: "professionnels",
    aliases: ["pediatrie"],
  },
  {
    term: "Pédopsychiatre",
    definition:
      "Médecin spécialiste de la santé mentale des enfants et des adolescents. Il pose le diagnostic de TDAH et peut prescrire un traitement.",
    category: "professionnels",
    aliases: ["psychiatre", "pedopsychiatrie"],
    relatedSlug: "medication-tdah-mythes-parents",
  },
  {
    term: "Psychologue",
    definition:
      "Accompagne l'enfant et la famille sur le plan émotionnel, cognitif et comportemental. N'est pas médecin : il ne prescrit pas de traitement.",
    category: "professionnels",
    aliases: ["psy", "psychotherapie"],
  },
  {
    term: "Neuropsychologue",
    definition:
      "Psychologue spécialisé dans le fonctionnement cognitif. C'est lui qui réalise le bilan neuropsychologique.",
    category: "professionnels",
    aliases: ["neuropsy"],
  },
  {
    term: "Orthophoniste",
    definition:
      "Spécialiste du langage oral et écrit. Il rééduque la lecture, l'orthographe, l'expression et parfois la logique mathématique.",
    category: "professionnels",
    aliases: ["orthophonie"],
  },
  {
    term: "Psychomotricien",
    definition:
      "Travaille sur la motricité, le schéma corporel, la gestion de l'agitation et les fonctions cognitives associées.",
    category: "professionnels",
    aliases: ["psychomotricite"],
  },
  {
    term: "Ergothérapeute",
    definition:
      "Aide l'enfant à devenir autonome au quotidien et à l'école : écriture, organisation du bureau, outils informatiques adaptés.",
    category: "professionnels",
    aliases: ["ergotherapie", "ergo"],
  },
  {
    term: "Psychoéducateur",
    definition:
      "Soutient le développement des compétences sociales, émotionnelles et adaptatives de l'enfant, et accompagne la famille au quotidien.",
    category: "professionnels",
    aliases: ["psychoeducation"],
  },

  // ─── Structures et dispositifs ───────────────────────────────────
  {
    term: "CAMSP",
    label: "Centre d'action médico-sociale précoce",
    definition:
      "Pour les enfants de 0 à 6 ans : bilans, soins et accompagnement précoce, en un seul lieu et sans avance de frais.",
    category: "structures",
    aliases: ["0-6 ans", "precoce"],
  },
  {
    term: "CMP / CMPP",
    label: "Centre médico-psychologique / centre médico-psycho-pédagogique",
    definition:
      "Structures publiques qui proposent consultations, bilans et suivis pour enfants et adolescents. Gratuit, mais souvent avec liste d'attente.",
    category: "structures",
    aliases: ["CMP", "CMPP", "gratuit", "liste d attente"],
    relatedSlug: "apres-le-diagnostic-tdah-parcours-de-soins",
  },
  {
    term: "SESSAD",
    label: "Service d'éducation spéciale et de soins à domicile",
    definition:
      "Équipe qui intervient là où vit l'enfant : à la maison ou à l'école, pour un accompagnement en situation de handicap.",
    category: "structures",
    aliases: ["domicile"],
  },
  {
    term: "IME / IEM",
    label: "Institut médico-éducatif / institut d'éducation motrice",
    definition:
      "Structures médico-sociales accueillant des enfants et adolescents en situation de handicap, avec scolarité et soins sur place.",
    category: "structures",
    aliases: ["IME", "IEM"],
  },
  {
    term: "ITEP",
    label:
      "Institut thérapeutique, éducatif et pédagogique",
    definition:
      "Accueille des enfants dont les difficultés de comportement gênent fortement la scolarité, avec un accompagnement à la fois éducatif, thérapeutique et scolaire.",
    category: "structures",
    aliases: ["comportement"],
  },
  {
    term: "PCO TND",
    label: "Plateforme de coordination et d'orientation",
    definition:
      "Dispositif qui organise et finance un parcours de bilans pour les enfants de moins de 12 ans suspectés de trouble du neurodéveloppement. L'entrée se fait via un médecin.",
    category: "structures",
    aliases: ["PCO", "plateforme", "coordination"],
  },

  // ─── Santé et suivi médical ──────────────────────────────────────
  {
    term: "ALD",
    label: "Affection de longue durée",
    definition:
      "Reconnaissance d'une maladie chronique ouvrant droit à une prise en charge à 100 % par l'Assurance maladie pour les soins liés à cette maladie.",
    category: "sante",
    aliases: ["100%", "assurance maladie", "longue duree"],
  },
  {
    term: "Ordonnance de transport",
    definition:
      "Prescription du médecin permettant la prise en charge des trajets vers les soins ou l'école lorsqu'ils sont nécessaires.",
    category: "sante",
    aliases: ["transport", "taxi"],
  },
  {
    term: "Suivi pluridisciplinaire",
    definition:
      "Coordination entre plusieurs professionnels (médecin, orthophoniste, psychologue, école) pour un accompagnement cohérent de l'enfant.",
    category: "sante",
    aliases: ["pluridisciplinaire", "coordination"],
  },
  {
    term: "Méthylphénidate",
    definition:
      "Molécule des traitements du TDAH les plus prescrits en France (Ritaline, Concerta, Quasym, Medikinet). Prescription initiale par un spécialiste, renouvellement encadré.",
    category: "sante",
    aliases: ["ritaline", "concerta", "quasym", "medikinet", "traitement"],
    relatedSlug: "medication-tdah-mythes-parents",
  },
  {
    term: "Titration",
    definition:
      "Période de réglage du traitement : on ajuste progressivement la dose en observant effets et effets indésirables. Vos notes quotidiennes sont précieuses à ce moment-là.",
    category: "sante",
    aliases: ["dose", "reglage"],
    relatedSlug: "medication-tdah-mythes-parents",
  },
  {
    term: "Comorbidité",
    definition:
      "Présence d'un autre trouble en plus du TDAH (anxiété, troubles dys, troubles du sommeil). C'est fréquent, et cela change la prise en charge.",
    category: "sante",
    aliases: ["comorbidites", "trouble associe"],
    relatedSlug: "troubles-sommeil-tdah-enfant",
  },
];
