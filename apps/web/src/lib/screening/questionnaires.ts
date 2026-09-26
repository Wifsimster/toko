// Questionnaires de repérage publics (/quiz), écrits en scènes du quotidien.
//
// Chaque question est une scène vécue qui remplace UN item d'un outil validé
// et libre d'usage, en gardant son critère, son sens de cotation et ses seuils.
// L'item d'origine reste dans `official` (imprimé pour le médecin) :
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
  /**
   * Everyday scene shown as the question. `==word==` marks the highlighted
   * part. It keeps the criterion AND the scoring direction of `official`.
   */
  text: Localized;
  /** Second line: the lived detail that makes the scene recognisable. */
  example?: Localized;
  /** Wording of the validated tool, printed for the doctor. */
  official: Localized;
  dimension: string;
  positive: PositiveRule;
}

/** One everyday scene standing in for one item of the validated tool. */
function scene(
  id: string,
  dimension: string,
  positive: PositiveRule,
  official: Localized,
  text: Localized,
  example: Localized,
): Item {
  return { id, dimension, positive, official, text, example };
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

// AQ-10 agreement scale, worded as "does it sound like me / my child".
// Values keep the original order: 0 = definitely agree … 3 = definitely disagree.
const LIKE_ME: ScaleOption[] = [
  { value: 0, label: { fr: "Tout à fait moi", en: "Totally me" } },
  { value: 1, label: { fr: "Plutôt moi", en: "Quite me" } },
  { value: 2, label: { fr: "Plutôt pas moi", en: "Not really me" } },
  { value: 3, label: { fr: "Pas du tout moi", en: "Not me at all" } },
];

const LIKE_MY_CHILD: ScaleOption[] = [
  { value: 0, label: { fr: "Tout à fait", en: "Totally" } },
  { value: 1, label: { fr: "Plutôt oui", en: "Rather yes" } },
  { value: 2, label: { fr: "Plutôt non", en: "Rather no" } },
  { value: 3, label: { fr: "Pas du tout", en: "Not at all" } },
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
      fr: "6 scènes du quotidien, construites sur le questionnaire de repérage de l'OMS.",
      en: "6 everyday scenes, built on the WHO adult screening questionnaire.",
    },
    prompt: { fr: "Ces 6 derniers mois, ça vous arrive…", en: "Over the past 6 months, how often…" },
    minutes: 2,
    source: {
      name: "ASRS v1.1, partie A (Organisation mondiale de la santé)",
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
      scene("asrs1", "asrs", { gte: 2 },
        { fr: "À quelle fréquence avez-vous du mal à finaliser les derniers détails d'un projet, une fois que les parties les plus intéressantes sont faites ?", en: "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?" },
        { fr: "Un projet reste ==bloqué à 90 %==.", en: "A project stays ==stuck at 90%==." },
        { fr: "Le plus intéressant est fait. Les derniers détails, eux, attendent… des semaines.", en: "The fun part is done. The last details wait… for weeks." }),
      scene("asrs2", "asrs", { gte: 2 },
        { fr: "À quelle fréquence avez-vous du mal à mettre les choses en ordre quand une tâche demande de l'organisation ?", en: "How often do you have difficulty getting things in order when you have to do a task that requires organization?" },
        { fr: "Préparer un départ en vacances vous ==met la tête à l'envers==.", en: "Packing for a trip ==turns your head upside down==." },
        { fr: "Les valises, les papiers, les listes : par où commencer ?", en: "Suitcases, papers, lists: where do you even start?" }),
      scene("asrs3", "asrs", { gte: 2 },
        { fr: "À quelle fréquence avez-vous du mal à vous souvenir de vos rendez-vous ou de vos obligations ?", en: "How often do you have problems remembering appointments or obligations?" },
        { fr: "Le rendez-vous chez le médecin vous revient en tête… ==une fois l'heure passée==.", en: "The doctor's appointment comes back to mind… ==once the time has passed==." },
        { fr: "Pareil pour le mot à signer, l'anniversaire, la facture.", en: "Same with the form to sign, the birthday, the bill." }),
      scene("asrs4", "asrs", { gte: 3 },
        { fr: "Quand une tâche demande beaucoup de réflexion, à quelle fréquence évitez-vous de la commencer ou la remettez-vous à plus tard ?", en: "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?" },
        { fr: "« Envoyer ce document » devient ==une montagne==.", en: "\"Send this document\" becomes ==a mountain==." },
        { fr: "Ouvrir l'ordi, retrouver le fichier, répondre à 4 mails… et le document attend toujours.", en: "Open the laptop, find the file, answer 4 emails… and the document is still waiting." }),
      scene("asrs5", "asrs", { gte: 3 },
        { fr: "À quelle fréquence remuez-vous les mains ou les pieds, ou vous tortillez-vous, quand vous devez rester assis longtemps ?", en: "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?" },
        { fr: "Après une heure de réunion ou de film, vos mains et vos pieds ==ne tiennent plus en place==.", en: "After an hour of meeting or film, your hands and feet ==can't keep still==." },
        { fr: "Le stylo qui tourne, la jambe qui tressaute, la chaise qui grince.", en: "The spinning pen, the bouncing leg, the creaking chair." }),
      scene("asrs6", "asrs", { gte: 3 },
        { fr: "À quelle fréquence vous sentez-vous trop actif, poussé à faire des choses, comme si un moteur vous entraînait ?", en: "How often do you feel overly active and compelled to do things, like you were driven by a motor?" },
        { fr: "Impossible de rester sur le canapé sans vous relever ==« juste pour un truc »==.", en: "You can't stay on the sofa without getting up ==\"just for one thing\"==." },
        { fr: "Même quand la fatigue est là, quelque chose tourne en vous comme un moteur.", en: "Even when you're tired, something inside keeps running like an engine." }),
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
      fr: "18 scènes du quotidien à la maison et à l'école. À partir de 6 ans.",
      en: "18 everyday scenes at home and at school. From age 6.",
    },
    prompt: {
      fr: "Ces 6 derniers mois, ça ressemble à votre enfant ?",
      en: "Over the past 6 months, does this sound like your child?",
    },
    minutes: 4,
    source: {
      name: "SNAP-IV, 18 items, version parent (Swanson, Nolan & Pelham)",
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
    items: [
      scene("snap1", "inattention", { gte: 2 },
        { fr: "Ne prête pas attention aux détails, fait des erreurs d'inattention dans ses devoirs ou ses activités.", en: "Fails to give close attention to details or makes careless mistakes in schoolwork or tasks." },
        { fr: "Une ligne sautée, un « + » lu ==comme un « − »==.", en: "A skipped line, a \"+\" read ==as a \"−\"==." },
        { fr: "Votre enfant savait faire. Un détail est passé à la trappe.", en: "Your child knew how. A detail slipped through." }),
      scene("snap2", "inattention", { gte: 2 },
        { fr: "A du mal à rester concentré sur une tâche ou un jeu.", en: "Has difficulty sustaining attention in tasks or play activities." },
        { fr: "Puzzle, devoir, jeu de société : l'attention ==décroche au bout de quelques minutes==.", en: "Puzzle, homework, board game: attention ==drifts after a few minutes==." },
        { fr: "Sauf, parfois, pour son sujet préféré.", en: "Except, sometimes, for a favourite topic." }),
      scene("snap3", "inattention", { gte: 2 },
        { fr: "Semble ne pas écouter quand on lui parle directement.", en: "Does not seem to listen when spoken to directly." },
        { fr: "Vous lui parlez, face à face… et la phrase ==passe à côté==.", en: "You talk face to face… and the sentence ==goes right past==." },
        { fr: "« Mets tes chaussures », trois fois, sans réaction.", en: "\"Put your shoes on\", three times, no reaction." }),
      scene("snap4", "inattention", { gte: 2 },
        { fr: "Ne va pas au bout des consignes, ne termine pas ses devoirs ou ses tâches.", en: "Does not follow through on instructions and does not finish schoolwork or chores." },
        { fr: "La consigne commence bien… puis ==se perd en route==.", en: "The instruction starts well… then ==gets lost on the way==." },
        { fr: "Envoyé chercher son pyjama, votre enfant est retrouvé en train de jouer.", en: "Sent to fetch pyjamas, your child is found playing instead." }),
      scene("snap5", "inattention", { gte: 2 },
        { fr: "A du mal à organiser ses tâches et ses activités.", en: "Has difficulty organizing tasks and activities." },
        { fr: "Préparer son cartable seul, c'est ==mission impossible==.", en: "Packing the school bag alone is ==mission impossible==." },
        { fr: "Il manque la trousse, il reste trois goûters d'avant-hier.", en: "The pencil case is missing, three old snacks are still in there." }),
      scene("snap6", "inattention", { gte: 2 },
        { fr: "Évite ou traîne devant les tâches qui demandent un effort mental soutenu.", en: "Avoids, dislikes or is reluctant to do tasks requiring sustained mental effort." },
        { fr: "Dix minutes de devoirs, ==une heure de négociation==.", en: "Ten minutes of homework, ==an hour of negotiation==." },
        { fr: "Tout devient soudain urgent : boire, tailler un crayon, caresser le chat.", en: "Everything suddenly becomes urgent: a drink, a pencil to sharpen, the cat." }),
      scene("snap7", "inattention", { gte: 2 },
        { fr: "Égare les affaires nécessaires à ses activités.", en: "Loses things necessary for activities." },
        { fr: "Gourde, gilet, trousse : quelque chose ==reste à l'école== presque chaque semaine.", en: "Water bottle, jumper, pencil case: something ==stays at school== almost every week." },
        { fr: "Le bac des objets trouvés, vous le connaissez bien.", en: "You know the lost-property box well." }),
      scene("snap8", "inattention", { gte: 2 },
        { fr: "Est facilement distrait par ce qui se passe autour de lui.", en: "Is easily distracted by what happens around them." },
        { fr: "Un bruit dans le couloir, un oiseau à la fenêtre… ==et le fil est perdu==.", en: "A noise in the hallway, a bird at the window… ==and the thread is gone==." },
        { fr: "Il faut tout reprendre depuis le début.", en: "Everything has to start again from the top." }),
      scene("snap9", "inattention", { gte: 2 },
        { fr: "A du mal à se souvenir des choses du quotidien.", en: "Is forgetful in daily activities." },
        { fr: "Chaque soir, se brosser les dents ==semble une nouveauté==.", en: "Every night, brushing teeth ==feels brand new==." },
        { fr: "Et le mot du carnet de liaison sort du cartable une semaine plus tard.", en: "And the note from school comes out of the bag a week later." }),
      scene("snap10", "hyperactivite", { gte: 2 },
        { fr: "Bouge les mains ou les pieds, se tortille sur sa chaise.", en: "Fidgets with hands or feet or squirms in seat." },
        { fr: "À table, ça ==gigote, ça se tortille==, ça tape du pied.", en: "At the table, there's ==wriggling, squirming==, foot tapping." },
        { fr: "La chaise finit sur deux pieds.", en: "The chair ends up on two legs." }),
      scene("snap11", "hyperactivite", { gte: 2 },
        { fr: "Se lève quand il faudrait rester assis (en classe, à table…).", en: "Leaves seat when remaining seated is expected (in class, at the table…)." },
        { fr: "Le repas n'est pas fini que votre enfant est ==déjà debout==.", en: "The meal isn't over and your child is ==already up==." },
        { fr: "Même chose en classe, d'après l'enseignant.", en: "Same in class, according to the teacher." }),
      scene("snap12", "hyperactivite", { gte: 2 },
        { fr: "Court ou grimpe partout, quand ce n'est pas le moment.", en: "Runs about or climbs excessively when it is inappropriate." },
        { fr: "Le canapé devient un ==trampoline==, le salon une piste d'athlétisme.", en: "The sofa becomes a ==trampoline==, the living room a race track." },
        { fr: "Y compris chez les autres ou dans la salle d'attente du médecin.", en: "Including at other people's homes or in the doctor's waiting room." }),
      scene("snap13", "hyperactivite", { gte: 2 },
        { fr: "A du mal à jouer ou à se détendre calmement.", en: "Has difficulty playing or engaging in leisure activities quietly." },
        { fr: "Jouer calmement, même cinq minutes, ==relève de l'exploit==.", en: "Playing quietly, even for five minutes, ==is a feat==." },
        { fr: "Les jeux finissent vite en cris, en courses ou en cascades.", en: "Games quickly turn into shouting, running or stunts." }),
      scene("snap14", "hyperactivite", { gte: 2 },
        { fr: "Est toujours en mouvement, comme « monté sur ressorts ».", en: "Is \"on the go\", acts as if \"driven by a motor\"." },
        { fr: "Toujours en mouvement, ==comme monté sur ressorts==.", en: "Always on the move, ==like on springs==." },
        { fr: "Vous n'en pouvez plus ; votre enfant, lui, a de l'énergie pour trois.", en: "You're worn out; your child has energy for three." }),
      scene("snap15", "hyperactivite", { gte: 2 },
        { fr: "Parle beaucoup.", en: "Talks excessively." },
        { fr: "Un ==flot de paroles==, du petit-déjeuner jusqu'au bain.", en: "A ==stream of words==, from breakfast to bath time." },
        { fr: "Les autres ont du mal à placer un mot.", en: "Others struggle to get a word in." }),
      scene("snap16", "hyperactivite", { gte: 2 },
        { fr: "Répond avant la fin de la question.", en: "Blurts out answers before questions have been completed." },
        { fr: "La réponse fuse ==avant la fin de la question==.", en: "The answer comes out ==before the question ends==." },
        { fr: "« Moi ! Moi ! » avant même de savoir de quoi on parle.", en: "\"Me! Me!\" before even knowing what it's about." }),
      scene("snap17", "hyperactivite", { gte: 2 },
        { fr: "A du mal à attendre son tour.", en: "Has difficulty awaiting turn." },
        { fr: "Attendre son tour est ==un vrai supplice==.", en: "Waiting for a turn is ==real torture==." },
        { fr: "Au jeu de société, à la boulangerie, pour parler.", en: "At board games, in a queue, to speak." }),
      scene("snap18", "hyperactivite", { gte: 2 },
        { fr: "Interrompt les autres, s'impose dans leurs conversations ou leurs jeux.", en: "Interrupts or intrudes on others (conversations, games)." },
        { fr: "Votre enfant ==coupe la parole== et s'invite dans les jeux des autres.", en: "Your child ==cuts in== and barges into other kids' games." },
        { fr: "Au téléphone, vous avez rarement deux minutes tranquilles.", en: "On the phone, you rarely get two quiet minutes." }),
    ],
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
      fr: "8 scènes de colères et de « non ! » du quotidien. À partir de 6 ans.",
      en: "8 everyday scenes of tantrums and \"no!\". From age 6.",
    },
    prompt: {
      fr: "Ces 6 derniers mois, ça ressemble à votre enfant ?",
      en: "Over the past 6 months, does this sound like your child?",
    },
    minutes: 2,
    source: {
      name: "SNAP-IV, 8 items opposition, version parent (Swanson, Nolan & Pelham)",
      detail: {
        fr: "Une réponse « Beaucoup » ou « Énormément » compte comme un signe. 4 signes sur 8 : c'est le repère des critères du trouble oppositionnel avec provocation.",
        en: "An answer of \"Quite a bit\" or \"Very much\" counts as a sign. 4 signs out of 8 matches the criteria for oppositional defiant disorder.",
      },
    },
    scale: INTENSITY,
    dimensions: [
      { id: "opposition", label: { fr: "Opposition", en: "Defiance" }, threshold: 4 },
    ],
    items: [
      scene("odd1", "opposition", { gte: 2 },
        { fr: "Se met en colère, perd son calme.", en: "Loses temper." },
        { fr: "Un écran qu'on éteint, un pull à enfiler… ==et c'est l'explosion==.", en: "A screen switched off, a jumper to put on… ==and it explodes==." },
        { fr: "La colère monte en quelques secondes.", en: "Anger rises in seconds." }),
      scene("odd2", "opposition", { gte: 2 },
        { fr: "Se dispute avec les adultes.", en: "Argues with adults." },
        { fr: "Chaque consigne se transforme ==en débat==.", en: "Every instruction turns ==into a debate==." },
        { fr: "Avec vous, les grands-parents, l'enseignant.", en: "With you, the grandparents, the teacher." }),
      scene("odd3", "opposition", { gte: 2 },
        { fr: "S'oppose activement aux demandes ou aux règles des adultes, refuse de s'y plier.", en: "Actively defies or refuses adult requests or rules." },
        { fr: "« Non ! » arrive ==avant la fin de la phrase==.", en: "\"No!\" comes ==before the sentence ends==." },
        { fr: "Même quand la demande est simple.", en: "Even when the request is simple." }),
      scene("odd4", "opposition", { gte: 2 },
        { fr: "Fait exprès des choses qui agacent les autres.", en: "Deliberately does things that annoy other people." },
        { fr: "Votre enfant cherche parfois ==à agacer, exprès==.", en: "Your child sometimes tries ==to annoy, on purpose==." },
        { fr: "Frère, sœur, parents : chacun y passe, et votre enfant sait où appuyer.", en: "Siblings, parents: everyone gets a turn, and your child knows where to push." }),
      scene("odd5", "opposition", { gte: 2 },
        { fr: "Rejette sur les autres la responsabilité de ses erreurs ou de son comportement.", en: "Blames others for his or her mistakes or misbehaviour." },
        { fr: "« C'est pas moi, ==c'est lui qui a commencé== ! »", en: "\"It wasn't me, ==he started it==!\"" },
        { fr: "La responsabilité glisse toujours vers quelqu'un d'autre.", en: "The blame always slides onto someone else." }),
      scene("odd6", "opposition", { gte: 2 },
        { fr: "Est susceptible, facilement agacé par les autres.", en: "Is touchy or easily annoyed by others." },
        { fr: "Un regard de travers suffit à ==tout faire basculer==.", en: "One wrong look is enough to ==tip everything over==." },
        { fr: "Une blague d'un copain devient une offense.", en: "A friend's joke becomes an insult." }),
      scene("odd7", "opposition", { gte: 2 },
        { fr: "Est fâché, garde de la rancœur.", en: "Is angry and resentful." },
        { fr: "La colère ==dure longtemps==, bien après la dispute.", en: "The anger ==lasts a long time==, long after the fight." },
        { fr: "Des heures plus tard, ça gronde encore.", en: "Hours later, it's still rumbling." }),
      scene("odd8", "opposition", { gte: 2 },
        { fr: "Cherche à se venger, à rendre la pareille.", en: "Is spiteful or vindictive." },
        { fr: "Votre enfant garde les comptes et ==cherche à rendre la pareille==.", en: "Your child keeps score and ==wants to get even==." },
        { fr: "« Il m'a pris mon feutre, alors je casse son dessin. »", en: "\"He took my pen, so I'm ruining his drawing.\"" }),
    ],
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
      fr: "10 scènes du quotidien : les bruits, les autres, les passions.",
      en: "10 everyday scenes: sounds, other people, passions.",
    },
    prompt: {
      fr: "Ça vous ressemble ?",
      en: "Does this sound like you?",
    },
    minutes: 2,
    source: {
      name: "AQ-10 adulte (Autism Research Centre, Université de Cambridge)",
      detail: {
        fr: "6 points sur 10 : c'est le seuil à partir duquel une évaluation spécialisée est conseillée.",
        en: "6 points out of 10 is the threshold from which a specialist assessment is advised.",
      },
    },
    scale: LIKE_ME,
    dimensions: [
      { id: "aq", label: { fr: "Traits autistiques", en: "Autistic traits" }, threshold: 6 },
    ],
    items: [
      scene("aqa1", "aq", { lte: 1 },
        { fr: "Je remarque souvent de petits bruits que les autres ne remarquent pas.", en: "I often notice small sounds when others do not." },
        { fr: "Le frigo qui ronronne, l'horloge qui fait tic-tac : vous êtes souvent ==la seule personne à les entendre==.", en: "The humming fridge, the ticking clock: you're often ==the only one who hears them==." },
        { fr: "Et une fois entendus, impossible de les ignorer.", en: "And once heard, impossible to ignore." }),
      scene("aqa2", "aq", { gte: 2 },
        { fr: "Je me concentre plus sur l'ensemble que sur les petits détails.", en: "I usually concentrate more on the whole picture, rather than the small details." },
        { fr: "Face à une photo, vous voyez ==d'abord l'ensemble==, pas les détails.", en: "Looking at a photo, you ==see the whole picture first==, not the details." },
        { fr: "Le paysage avant la petite fleur dans le coin.", en: "The landscape before the little flower in the corner." }),
      scene("aqa3", "aq", { gte: 2 },
        { fr: "Il m'est facile de faire plusieurs choses à la fois.", en: "I find it easy to do more than one thing at once." },
        { fr: "Cuisiner, écouter la radio et répondre à un message ==en même temps== : facile.", en: "Cooking, listening to the radio and answering a text ==all at once==: easy." },
        { fr: "Passer d'une chose à l'autre ne vous coûte rien.", en: "Switching between things costs you nothing." }),
      scene("aqa4", "aq", { gte: 2 },
        { fr: "Quand on m'interrompt, je reprends très vite ce que je faisais.", en: "If there is an interruption, I can switch back to what I was doing very quickly." },
        { fr: "On vous interrompt en pleine tâche ? Vous ==reprenez le fil tout de suite==.", en: "Interrupted mid-task? You ==pick up the thread right away==." },
        { fr: "Pas besoin de tout recommencer depuis le début.", en: "No need to start all over again." }),
      scene("aqa5", "aq", { gte: 2 },
        { fr: "Je comprends facilement les sous-entendus quand on me parle.", en: "I find it easy to \"read between the lines\" when someone is talking to me." },
        { fr: "Quand on vous parle, vous captez facilement ==les sous-entendus==.", en: "When someone talks to you, you easily ==read between the lines==." },
        { fr: "« On verra » veut souvent dire non, et vous le savez.", en: "\"We'll see\" often means no, and you know it." }),
      scene("aqa6", "aq", { gte: 2 },
        { fr: "Je sais voir quand la personne qui m'écoute commence à s'ennuyer.", en: "I know how to tell if someone listening to me is getting bored." },
        { fr: "Vous sentez tout de suite quand la personne en face ==commence à s'ennuyer==.", en: "You sense right away when the person you're talking to ==is getting bored==." },
        { fr: "Un regard vers son téléphone, un « hmm hmm » : vous changez de sujet.", en: "A glance at their phone, an \"mm-hmm\": you change the subject." }),
      scene("aqa7", "aq", { lte: 1 },
        { fr: "Quand je lis une histoire, j'ai du mal à deviner les intentions des personnages.", en: "When I'm reading a story, I find it difficult to work out the characters' intentions." },
        { fr: "Dans un film ou un roman, les intentions des personnages ==vous échappent souvent==.", en: "In a film or a novel, the characters' intentions ==often escape you==." },
        { fr: "Pourquoi il a dit ça ? Les autres ont compris, vous pas encore.", en: "Why did he say that? Everyone else got it, you don't yet." }),
      scene("aqa8", "aq", { lte: 1 },
        { fr: "J'aime rassembler des informations sur des catégories de choses (voitures, oiseaux, trains, plantes…).", en: "I like to collect information about categories of things (types of car, bird, train, plant…)." },
        { fr: "Vous adorez ==tout savoir sur un sujet précis== : trains, plantes, voitures, oiseaux…", en: "You love ==knowing everything about one topic==: trains, plants, cars, birds…" },
        { fr: "Les modèles, les listes, les dates : vous pourriez en parler des heures.", en: "Models, lists, dates: you could talk about it for hours." }),
      scene("aqa9", "aq", { gte: 2 },
        { fr: "Je devine facilement ce que quelqu'un pense ou ressent rien qu'en regardant son visage.", en: "I find it easy to work out what someone is thinking or feeling just by looking at their face." },
        { fr: "Un coup d'œil au visage de quelqu'un et vous ==savez ce qu'il ressent==.", en: "One look at someone's face and you ==know how they feel==." },
        { fr: "Pas besoin qu'on vous le dise.", en: "Nobody needs to tell you." }),
      scene("aqa10", "aq", { lte: 1 },
        { fr: "J'ai du mal à comprendre les intentions des gens.", en: "I find it difficult to work out people's intentions." },
        { fr: "Comprendre ce que les gens ==veulent vraiment== vous demande un gros effort.", en: "Working out what people ==really mean== takes you a lot of effort." },
        { fr: "Une blague, une pique, un compliment : parfois, difficile de faire la différence.", en: "A joke, a jab, a compliment: sometimes hard to tell apart." }),
    ],
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
      fr: "10 scènes du quotidien de votre enfant. De 4 à 11 ans.",
      en: "10 everyday scenes from your child's life. Ages 4 to 11.",
    },
    prompt: {
      fr: "Ça ressemble à votre enfant ?",
      en: "Does this sound like your child?",
    },
    minutes: 2,
    source: {
      name: "AQ-10 enfant (Autism Research Centre, Université de Cambridge)",
      detail: {
        fr: "6 points sur 10 : c'est le seuil à partir duquel une évaluation spécialisée est conseillée.",
        en: "6 points out of 10 is the threshold from which a specialist assessment is advised.",
      },
    },
    scale: LIKE_MY_CHILD,
    dimensions: [
      { id: "aq", label: { fr: "Traits autistiques", en: "Autistic traits" }, threshold: 6 },
    ],
    items: [
      scene("aqc1", "aq", { lte: 1 },
        { fr: "Votre enfant remarque souvent de petits bruits que les autres ne remarquent pas.", en: "S/he often notices small sounds when others do not." },
        { fr: "Le sèche-mains, l'aspirateur, un bourdonnement lointain : votre enfant ==les entend avant tout le monde==.", en: "The hand dryer, the vacuum, a distant hum: your child ==hears them before anyone else==." },
        { fr: "Et parfois, se bouche les oreilles.", en: "And sometimes covers their ears." }),
      scene("aqc2", "aq", { gte: 2 },
        { fr: "Votre enfant se concentre plus sur l'ensemble que sur les petits détails.", en: "S/he usually concentrates more on the whole picture, rather than the small details." },
        { fr: "Devant un dessin, votre enfant remarque ==d'abord l'ensemble==, pas les petits détails.", en: "Looking at a drawing, your child ==notices the whole first==, not the little details." },
        { fr: "La maison avant la poignée de la porte.", en: "The house before the door handle." }),
      scene("aqc3", "aq", { gte: 2 },
        { fr: "Dans un groupe, votre enfant suit facilement plusieurs conversations à la fois.", en: "In a social group, s/he can easily keep track of several different people's conversations." },
        { fr: "À un goûter d'anniversaire, votre enfant ==suit sans peine plusieurs conversations==.", en: "At a birthday party, your child ==easily follows several conversations==." },
        { fr: "Passer d'un groupe à l'autre se fait tout naturellement.", en: "Moving from one group to another comes naturally." }),
      scene("aqc4", "aq", { gte: 2 },
        { fr: "Votre enfant passe facilement d'une activité à une autre.", en: "S/he finds it easy to go back and forth between different activities." },
        { fr: "Passer du jeu au bain, puis au repas : ==ça se fait sans heurts==.", en: "From play to bath to dinner: ==it goes smoothly==." },
        { fr: "Les changements de programme passent plutôt bien.", en: "Changes of plan go down fairly well." }),
      scene("aqc5", "aq", { lte: 1 },
        { fr: "Votre enfant ne sait pas comment faire durer une conversation avec les enfants de son âge.", en: "S/he doesn't know how to keep a conversation going with his/her peers." },
        { fr: "Avec les enfants de son âge, la conversation ==tourne court==.", en: "With children the same age, the conversation ==runs dry==." },
        { fr: "Votre enfant ne sait pas trop comment la faire durer.", en: "Your child doesn't quite know how to keep it going." }),
      scene("aqc6", "aq", { gte: 2 },
        { fr: "Votre enfant est à l'aise pour bavarder de tout et de rien.", en: "S/he is good at social chit-chat." },
        { fr: "==Bavarder de tout et de rien==, votre enfant adore ça.", en: "==Chatting about anything and everything==: your child loves it." },
        { fr: "La cantine, la météo, le chien du voisin : tout est prétexte à discuter.", en: "Lunch, the weather, the neighbour's dog: any excuse to talk." }),
      scene("aqc7", "aq", { lte: 1 },
        { fr: "Quand on lui lit une histoire, votre enfant a du mal à deviner les intentions ou les émotions des personnages.", en: "When s/he is read a story, s/he finds it difficult to work out the characters' intentions or feelings." },
        { fr: "Pendant l'histoire du soir, deviner ce que ressent un personnage ==est difficile==.", en: "At bedtime story, guessing how a character feels ==is hard==." },
        { fr: "« Pourquoi il est triste, le loup ? »", en: "\"Why is the wolf sad?\"" }),
      scene("aqc8", "aq", { gte: 2 },
        { fr: "En maternelle, votre enfant aimait jouer à « faire semblant » avec d'autres enfants.", en: "In preschool, s/he used to enjoy pretend play with other children." },
        { fr: "En maternelle, votre enfant adorait ==jouer à « faire semblant »== avec les autres.", en: "In preschool, your child loved ==pretend play== with others." },
        { fr: "La marchande, la dînette, les pompiers…", en: "Shop, tea party, firefighters…" }),
      scene("aqc9", "aq", { gte: 2 },
        { fr: "Votre enfant devine facilement ce que quelqu'un pense ou ressent en regardant son visage.", en: "S/he finds it easy to work out what someone is thinking or feeling just by looking at their face." },
        { fr: "Rien qu'à votre visage, votre enfant ==devine votre humeur==.", en: "Just from your face, your child ==guesses your mood==." },
        { fr: "Fatigue, joie, agacement : votre enfant le voit tout de suite.", en: "Tired, happy, annoyed: your child sees it right away." }),
      scene("aqc10", "aq", { lte: 1 },
        { fr: "Votre enfant a du mal à se faire de nouveaux amis.", en: "S/he finds it hard to make new friends." },
        { fr: "Se faire de nouveaux copains ==est compliqué==.", en: "Making new friends ==is hard==." },
        { fr: "La récré se passe souvent à l'écart des autres.", en: "Playtime is often spent away from the others." }),
    ],
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

/** Scene text without its `==highlight==` markers (print, aria labels). */
export function plain(text: string): string {
  return text.replace(/==/g, "");
}

/** Splits a scene into plain and highlighted parts, in order. */
export function highlightParts(text: string): { text: string; mark: boolean }[] {
  return text
    .split(/(==[^=]+==)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("==") ? { text: part.slice(2, -2), mark: true } : { text: part, mark: false },
    );
}
