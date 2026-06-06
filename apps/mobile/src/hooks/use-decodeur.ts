// Décodeur de comportements — données 100 % statiques.
// Le contenu est adapté du catalogue web (apps/web/src/lib/behavior-decoder-data.ts
// et les traductions fr.json). Aucun appel API n'est nécessaire.

export type BehaviorEntry = {
  id: string;
  behavior: string;
  explanation: string;
  tip: string;
  tags: readonly string[];
};

export const BEHAVIOR_ENTRIES: readonly BehaviorEntry[] = [
  {
    id: "throwsBackpack",
    behavior: "Il jette ses affaires en rentrant de l'école.",
    explanation:
      "Toute la journée, son cortex préfrontal a freiné les impulsions, l'agitation, les colères. Le retour à la maison, c'est l'endroit safe : le frein lâche. Ce n'est pas dirigé contre vous, c'est une décharge.",
    tip: "Prévoyez un rituel de décompression d'abord (5 minutes seul·e dans sa chambre, un encas, un câlin silencieux) avant toute exigence. Les consignes attendront 15 minutes.",
    tags: ["école", "retour", "agressif", "affaires", "transition"],
  },
  {
    id: "interrupts",
    behavior: "Il interrompt sans cesse quand je parle.",
    explanation:
      "Sa mémoire de travail est courte. S'il garde son idée pour son tour, elle s'évanouit. Il interrompt pour ne pas la perdre, pas pour vous manquer de respect.",
    tip: "Offrez-lui un papier ou un petit carnet : il note son idée, vous finissez. Vous lui rendez la parole ensuite. Ça apaise l'impulsion sans la réprimer.",
    tags: ["interrompt", "coupe la parole", "impulsivité", "discussion"],
  },
  {
    id: "losesStuff",
    behavior: "Il perd ses affaires (cartable, gourde, doudou).",
    explanation:
      "Ranger un objet demande d'inhiber d'autres pensées au même moment. Son cerveau passe à autre chose avant que le geste de « poser » soit enregistré. L'objet existait, puis a disparu — pas par négligence, par défaut d'ancrage.",
    tip: "Une seule place pour chaque chose, visible, sans tiroir. Une étiquette ou une photo. Préférez les rituels visuels aux rappels verbaux.",
    tags: ["perd", "cartable", "doudou", "gourde", "oubli", "mémoire"],
  },
  {
    id: "forgetsInstructions",
    behavior: "La même consigne ne se grave pas, même après trois fois.",
    explanation:
      "Entendre une consigne et l'exécuter passent par deux circuits différents. Chez l'enfant TDAH, le pont entre les deux est fragile. Il n'a pas désobéi : il n'a pas pu traduire ce qu'il a entendu en action.",
    tip: "Une consigne à la fois, formulée en regardant l'enfant dans les yeux. Faites-la répéter. Pour les enchaînements, écrivez/dessinez la séquence.",
    tags: ["oublie", "consigne", "répéter", "mémoire", "écoute"],
  },
  {
    id: "wontFinish",
    behavior: "Il refuse de finir une activité commencée.",
    explanation:
      "Le cerveau TDAH carbure à la dopamine de nouveauté. Une fois l'activité connue, la motivation chute brutalement — comme une voiture en panne sèche. Ce n'est pas un manque de volonté, c'est un manque de carburant chimique.",
    tip: "Découpez en mini-étapes très courtes (3 minutes, 5 minutes), avec une transition claire à chaque palier. Une mini-récompense ou une variation suffit à relancer la dopamine.",
    tags: ["finir", "abandonne", "motivation", "lassitude"],
  },
  {
    id: "fidgets",
    behavior: "Il agite ses mains, ses pieds, son corps en permanence.",
    explanation:
      "Pour rester attentif, son cerveau a besoin d'un stimulus moteur de fond. Bouger, c'est sa façon d'éveiller son cortex préfrontal. Le forcer à l'immobilité, c'est l'épuiser pour rien.",
    tip: "Autorisez le mouvement utile : ballon, coussin pneumatique, élastique de chaise, fidget. La concentration monte, pas l'inverse.",
    tags: ["bouge", "agite", "mains", "pieds", "attention"],
  },
  {
    id: "explosiveAnger",
    behavior: "Il a des explosions disproportionnées pour rien.",
    explanation:
      "Sa régulation émotionnelle est plus lente à mûrir. Quand la fatigue cognitive monte, son seuil de tolérance s'effondre. Une « broutille » est en réalité la dixième micro-frustration de la journée.",
    tip: "Ne raisonnez pas pendant la crise — son cortex est hors-ligne. Restez calme, baissez la voix, attendez la redescente. Le débrief, c'est plus tard, à froid.",
    tags: ["crise", "colère", "explosion", "émotion", "régulation"],
  },
  {
    id: "liesToAvoid",
    behavior: "Il ment pour éviter ses devoirs ou une corvée.",
    explanation:
      "Anticiper l'effort déclenche chez lui une vraie souffrance physique. Le mensonge est un évitement, pas une malveillance. Il préfère la honte du mensonge à l'angoisse de la tâche.",
    tip: "Réduisez le seuil d'entrée de la tâche (« on fait juste la première ligne ensemble »). La honte recule quand la tâche redevient atteignable.",
    tags: ["mensonge", "ment", "évite", "corvée", "devoirs"],
  },
  {
    id: "cantStartHomework",
    behavior: "Il ne peut pas se mettre à ses devoirs.",
    explanation:
      "L'amorçage d'une tâche non-stimulante demande un effort exécutif énorme. C'est ce qu'on appelle l'inertie de démarrage. Il n'est pas paresseux : il est bloqué sur le seuil, comme une voiture qui patine.",
    tip: "Démarrez avec lui pendant 90 secondes (lire la consigne à voix haute, faire le premier mot). Une fois le moteur lancé, il peut continuer seul.",
    tags: ["devoirs", "commencer", "démarrer", "procrastination"],
  },
  {
    id: "screenTransition",
    behavior: "Il s'énerve quand je lui demande d'arrêter le jeu vidéo.",
    explanation:
      "L'écran lui fournit en continu la dopamine qui lui manque. Quand vous l'arrêtez, c'est une chute neurochimique violente. Ce n'est pas une addiction de caprice, c'est un sevrage.",
    tip: "Annoncez la fin 5 minutes avant, puis 2 minutes avant (minuteur visuel idéalement). Prévoyez une transition agréable (musique, jeu d'extérieur) — pas un saut direct vers une corvée.",
    tags: ["écran", "jeu vidéo", "tablette", "arrêter", "transition"],
  },
  {
    id: "eveningMeltdown",
    behavior: "Il pleure ou s'effondre pour des broutilles le soir.",
    explanation:
      "C'est l'effet « cocotte-minute ». Il a tenu toute la journée à l'école, retenu ses émotions. Le soir, à la maison où il se sent en sécurité, tout sort en même temps.",
    tip: "Diminuez les exigences du soir au minimum vital. Plus de questions sur la journée, plus de devoirs après 18 h si possible. Un câlin, une histoire, un coucher tôt.",
    tags: ["soir", "pleure", "effondrement", "fatigue"],
  },
  {
    id: "tableMovement",
    behavior: "Il ne tient pas en place à table.",
    explanation:
      "Rester immobile pendant un repas demande une régulation motrice qui le coûte énormément. Pour ne pas exploser, il libère le trop-plein par des micro-mouvements continus.",
    tip: "Acceptez certains mouvements (les pieds qui bougent, un fidget sur les genoux). Les repas plus courts, plus fréquents marchent mieux que les longs repas familiaux pour les petits.",
    tags: ["table", "repas", "bouge", "agité"],
  },
  {
    id: "doesntListen",
    behavior: "L'instituteur dit qu'il « n'écoute pas » en classe.",
    explanation:
      "Son attention sélective est défaillante. Le moindre stimulus environnant (un bruit, un mouvement) capte sa concentration. Il entend autant que les autres — il ne peut pas filtrer comme les autres.",
    tip: "Demandez à l'enseignant·e une place près du tableau, loin de la fenêtre. Un signal discret (toucher l'épaule, code main) pour le rappeler à la tâche, plutôt que la réprimande publique.",
    tags: ["école", "n'écoute pas", "attention", "instit", "maîtresse"],
  },
  {
    id: "slowToGetDressed",
    behavior: "Il met une heure à s'habiller le matin.",
    explanation:
      "Il s'habille, puis voit un jouet, puis pense à autre chose, puis revient. Son attention saute en permanence. Ce n'est pas un sabotage : c'est qu'aucune ancre extérieure ne le maintient sur la tâche.",
    tip: "Préparez les vêtements la veille, dans l'ordre. Un minuteur visuel sur l'étape (« 5 minutes pour le pantalon »). Le matin, peu de mots, beaucoup de gestes.",
    tags: ["habille", "matin", "lent", "distraction"],
  },
  {
    id: "givesUpEarly",
    behavior: "Il abandonne avant même d'avoir essayé.",
    explanation:
      "Les déceptions passées laissent une trace. Pour se protéger, il préfère « ne pas essayer » plutôt que « essayer et ne pas y arriver ». Ce n'est pas de la paresse, c'est une protection contre une estime de soi déjà fragilisée.",
    tip: "Célébrez l'amorçage, pas le résultat. Une étape minuscule franchie vaut mieux qu'un grand projet abandonné. Évitez les comparaisons avec les autres enfants.",
    tags: ["abandonne", "échec", "renoncement", "estime"],
  },
];

function normalize(s: string): string {
  return s
    .toLocaleLowerCase("fr-FR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Filter entries by a free-text query (French, diacritic-insensitive). */
export function filterEntries(
  entries: readonly BehaviorEntry[],
  query: string,
): readonly BehaviorEntry[] {
  const q = normalize(query.trim());
  if (q.length === 0) return entries;
  return entries.filter((e) => {
    const haystack = [e.behavior, ...e.tags].map(normalize).join(" ");
    return haystack.includes(q);
  });
}
