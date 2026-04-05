export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type StepQuiz = {
  stepNumber: number;
  questions: QuizQuestion[];
};

/**
 * Minimum number of questions enforced per step.
 * Critical steps (1, 3, 5, 7, 8) target 7 questions; supportive steps target 5.
 */
export const QUESTIONS_PER_STEP_MIN = 5;

/**
 * Returns a new option order and the remapped correctIndex.
 * Uses a Fisher-Yates shuffle with Math.random — callers should memoize
 * per question id so the order stays stable across re-renders.
 */
export function shuffleQuestionOptions(question: QuizQuestion): {
  options: string[];
  correctIndex: number;
} {
  const indices = question.options.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }
  const options = indices.map((i) => question.options[i]!);
  const correctIndex = indices.indexOf(question.correctIndex);
  return { options, correctIndex };
}

export const BARKLEY_QUIZZES: Record<number, QuizQuestion[]> = {
  1: [
    {
      id: "1-1",
      question:
        "Quel est le principal facteur qui influence le comportement d'un enfant TDAH ?",
      options: [
        "Un manque de volonté de l'enfant",
        "Un déficit des fonctions exécutives (inhibition, attention, autorégulation)",
        "Une mauvaise éducation des parents",
        "Un excès de sucre dans l'alimentation",
      ],
      correctIndex: 1,
      explanation:
        "Le TDAH est lié à un déficit neurologique des fonctions exécutives, pas à un manque de volonté ou à l'éducation.",
    },
    {
      id: "1-2",
      question:
        "Pourquoi est-il important de comprendre les causes du comportement avant d'agir ?",
      options: [
        "Pour trouver un coupable",
        "Pour adapter ses réponses éducatives au fonctionnement réel de l'enfant",
        "Pour excuser tous les comportements",
        "Pour éviter de poser des limites",
      ],
      correctIndex: 1,
      explanation:
        "Comprendre le fonctionnement de l'enfant permet d'adapter les stratégies éducatives de façon réaliste et efficace.",
    },
    {
      id: "1-3",
      question:
        "Selon le programme Barkley, le TDAH affecte principalement :",
      options: [
        "L'intelligence de l'enfant",
        "La capacité à gérer le temps, les émotions et les impulsions",
        "La capacité à aimer ses parents",
        "Les performances sportives uniquement",
      ],
      correctIndex: 1,
      explanation:
        "Le TDAH touche la gestion du temps, des émotions et des impulsions — pas l'intelligence ni l'affection.",
    },
    {
      id: "1-4",
      question:
        "Votre enfant oublie encore son cartable à l'école. Laquelle de ces réactions est la plus cohérente avec le programme Barkley ?",
      options: [
        "« Tu le fais exprès pour me faire enrager. »",
        "« Son cerveau a du mal avec la mémoire de travail : je vais mettre en place un rappel visuel. »",
        "« S'il n'a pas ses affaires demain, il n'ira pas à l'école. »",
        "« C'est de ma faute, je ne lui ai pas assez répété. »",
      ],
      correctIndex: 1,
      explanation:
        "Les oublis récurrents reflètent un déficit de mémoire de travail, pas une provocation. On compense par des supports externes (rappels visuels, listes, routines).",
    },
    {
      id: "1-5",
      question:
        "Le TDAH a une forte composante :",
      options: [
        "Éducative : il dépend surtout du style parental",
        "Génétique et neurobiologique",
        "Alimentaire : il disparaît avec un régime adapté",
        "Psychologique : il vient d'un traumatisme caché",
      ],
      correctIndex: 1,
      explanation:
        "Le TDAH est un trouble neurodéveloppemental avec une héritabilité d'environ 75-80 %. L'environnement module l'expression, mais n'en est pas la cause.",
    },
    {
      id: "1-6",
      question:
        "Parmi ces attributions, laquelle est un piège à éviter absolument ?",
      options: [
        "« Il a un fonctionnement différent que je dois comprendre. »",
        "« Il est paresseux et manque de volonté. »",
        "« Certaines situations lui demandent plus d'efforts qu'aux autres. »",
        "« Il a besoin d'un cadre prévisible. »",
      ],
      correctIndex: 1,
      explanation:
        "Attribuer les symptômes à la paresse ou au manque de volonté est le piège central. Cela entretient la culpabilité, le conflit et les réponses punitives inefficaces.",
    },
    {
      id: "1-7",
      question:
        "Le programme Barkley remplace-t-il un suivi médical ?",
      options: [
        "Oui, il suffit à lui seul",
        "Non, il se combine à un suivi médical (pédiatre, psychiatre) et parfois médicamenteux",
        "Oui, si l'enfant a moins de 10 ans",
        "Non, mais il peut remplacer tout autre accompagnement psychologique",
      ],
      correctIndex: 1,
      explanation:
        "Barkley est un programme psycho-éducatif parental. Il s'articule avec le suivi médical et n'en est pas un substitut.",
    },
  ],
  2: [
    {
      id: "2-1",
      question: "Qu'est-ce que le « temps spécial » avec votre enfant ?",
      options: [
        "Un moment pour corriger ses erreurs",
        "20 minutes quotidiennes d'attention positive sans directives ni critiques",
        "Le temps passé à faire les devoirs ensemble",
        "Une récompense accordée le week-end",
      ],
      correctIndex: 1,
      explanation:
        "Le temps spécial est un moment dédié d'attention positive (15-20 min/jour) où le parent suit le jeu de l'enfant sans diriger ni critiquer.",
    },
    {
      id: "2-2",
      question:
        "Pendant le temps spécial, que devez-vous éviter de faire ?",
      options: [
        "Décrire ce que fait l'enfant",
        "Donner des ordres ou poser des questions",
        "Être enthousiaste et positif",
        "S'asseoir à côté de l'enfant",
      ],
      correctIndex: 1,
      explanation:
        "Pendant le temps spécial, on évite les ordres, questions et critiques. On décrit, on complimente et on suit le jeu de l'enfant.",
    },
    {
      id: "2-3",
      question:
        "Pourquoi l'attention positive est-elle particulièrement importante pour un enfant TDAH ?",
      options: [
        "Parce qu'il reçoit souvent plus de remarques négatives que les autres enfants",
        "Parce qu'il ne comprend que les compliments",
        "Parce que cela remplace les médicaments",
        "Parce que les enfants TDAH sont plus sensibles aux cadeaux",
      ],
      correctIndex: 0,
      explanation:
        "Les enfants TDAH reçoivent en moyenne beaucoup plus de remarques négatives. L'attention positive rééquilibre la relation.",
    },
    {
      id: "2-4",
      question:
        "Votre enfant a fait une grosse crise ce matin. Le soir, que faites-vous du temps spécial ?",
      options: [
        "Vous l'annulez pour lui montrer que son comportement a des conséquences",
        "Vous le maintenez : le temps spécial n'est jamais retiré en punition",
        "Vous le raccourcissez de moitié",
        "Vous le remplacez par une discussion sur la crise du matin",
      ],
      correctIndex: 1,
      explanation:
        "Règle essentielle : le temps spécial est inconditionnel. Le retirer en punition détruit la base de confiance que la relation doit construire.",
    },
    {
      id: "2-5",
      question:
        "À quelle fréquence organiser idéalement le temps spécial ?",
      options: [
        "Une fois par semaine suffit",
        "Tous les jours ou presque, sur une courte durée (15-20 min)",
        "Uniquement quand l'enfant se comporte bien",
        "Une fois par mois, lors d'une sortie spéciale",
      ],
      correctIndex: 1,
      explanation:
        "La régularité prime sur la durée : un moment quotidien court est plus efficace qu'une sortie occasionnelle.",
    },
  ],
  3: [
    {
      id: "3-1",
      question: "Qu'est-ce qu'un ordre efficace selon Barkley ?",
      options: [
        "Un ordre crié fort pour capter l'attention",
        "Un ordre court, direct, donné à proximité, avec un contact visuel",
        "Une suggestion formulée sous forme de question",
        "Un ordre répété 3 fois pour être sûr",
      ],
      correctIndex: 1,
      explanation:
        "Un ordre efficace est court, formulé positivement, donné de près avec contact visuel. On évite les questions (« Tu veux bien... ? »).",
    },
    {
      id: "3-2",
      question:
        "Quelle formulation est un ordre efficace ?",
      options: [
        "« Tu pourrais ranger ta chambre s'il te plaît ? »",
        "« Range tes jouets dans la caisse maintenant. »",
        "« Pourquoi ta chambre est encore en désordre ? »",
        "« Ce serait bien que tu ranges un peu. »",
      ],
      correctIndex: 1,
      explanation:
        "Un ordre efficace est une instruction claire et directe, pas une question ni un reproche.",
    },
    {
      id: "3-3",
      question:
        "Après avoir donné un ordre efficace, que faites-vous ?",
      options: [
        "Vous répétez immédiatement si l'enfant ne bouge pas",
        "Vous attendez 5 à 10 secondes en silence pour laisser le temps de répondre",
        "Vous passez à un autre ordre plus simple",
        "Vous expliquez longuement pourquoi c'est important",
      ],
      correctIndex: 1,
      explanation:
        "Après un ordre, on attend silencieusement 5-10 secondes. Les enfants TDAH ont besoin de plus de temps pour traiter l'information.",
    },
    {
      id: "3-4",
      question:
        "Votre enfant doit se préparer pour l'école. Quelle consigne est la plus efficace ?",
      options: [
        "« Dépêche-toi, on va être en retard comme d'habitude ! »",
        "« Mets tes chaussures maintenant. » (puis, une fois fait : « Prends ton manteau. »)",
        "« Habille-toi, prends ton cartable, mets tes chaussures et ton manteau et viens. »",
        "« Tu pourrais te bouger un peu ? »",
      ],
      correctIndex: 1,
      explanation:
        "Un ordre à la fois. Les consignes enchaînées saturent la mémoire de travail d'un enfant TDAH — il n'en retient souvent que la première ou la dernière.",
    },
    {
      id: "3-5",
      question:
        "Votre enfant commence à ranger puis s'arrête après 30 secondes. Que faites-vous ?",
      options: [
        "Vous le félicitez chaleureusement puis répétez calmement l'ordre restant",
        "Vous haussez le ton pour le relancer",
        "Vous rangez à sa place pour finir plus vite",
        "Vous le punissez pour ne pas avoir fini",
      ],
      correctIndex: 0,
      explanation:
        "On renforce le début d'effort, puis on réoriente calmement. Le TDAH rend la persistance difficile — féliciter l'amorce augmente la probabilité de continuation.",
    },
    {
      id: "3-6",
      question:
        "Après un ordre efficace, quel est le rôle du parent ?",
      options: [
        "Partir faire autre chose et espérer que ce soit fait",
        "Rester à proximité et suivre l'exécution de l'ordre",
        "Compter à voix haute jusqu'à 10",
        "Quitter la pièce pour éviter de céder",
      ],
      correctIndex: 1,
      explanation:
        "Le suivi (follow-through) est essentiel : le parent reste présent, vérifie l'exécution et félicite dès que l'enfant s'exécute.",
    },
    {
      id: "3-7",
      question:
        "Parmi ces formulations, laquelle est un ordre inefficace ?",
      options: [
        "« Range tes chaussures dans l'entrée. »",
        "« Tu mets tes chaussures, s'il te plaît, mon chéri ? »",
        "« Mets ton pyjama maintenant. »",
        "« Viens à table. »",
      ],
      correctIndex: 1,
      explanation:
        "Formuler un ordre sous forme de question (« s'il te plaît ») donne à l'enfant le choix implicite de refuser. On peut rester poli sans interroger : « Mets tes chaussures. »",
    },
  ],
  4: [
    {
      id: "4-1",
      question:
        "Quand votre enfant vous interrompt pendant une activité (téléphone, conversation), la première chose à faire est :",
      options: [
        "L'ignorer complètement",
        "Lui donner une activité à faire et le féliciter quand il ne vous interrompt pas",
        "Le gronder immédiatement",
        "Arrêter votre activité pour s'occuper de lui",
      ],
      correctIndex: 1,
      explanation:
        "On prépare l'enfant en lui donnant une occupation, puis on renforce positivement chaque moment où il n'interrompt pas.",
    },
    {
      id: "4-2",
      question:
        "Pourquoi les enfants TDAH interrompent-ils si souvent ?",
      options: [
        "Par manque de respect",
        "Parce que leur déficit d'inhibition rend difficile d'attendre",
        "Parce qu'ils veulent provoquer",
        "Parce qu'ils s'ennuient facilement et veulent des cadeaux",
      ],
      correctIndex: 1,
      explanation:
        "L'impulsivité liée au TDAH rend l'attente très difficile — ce n'est pas de l'irrespect ou de la provocation.",
    },
    {
      id: "4-3",
      question:
        "Quel est le principe clé pour apprendre à l'enfant à ne pas interrompre ?",
      options: [
        "Punir systématiquement chaque interruption",
        "Augmenter progressivement la durée pendant laquelle il doit patienter",
        "Exiger 30 minutes de silence dès le départ",
        "Ne jamais lui parler pendant vos activités",
      ],
      correctIndex: 1,
      explanation:
        "On commence par de courtes périodes (2-3 minutes) et on augmente progressivement, en félicitant l'enfant à chaque succès.",
    },
    {
      id: "4-4",
      question:
        "Vous devez passer un appel téléphonique important. La meilleure préparation est :",
      options: [
        "Espérer qu'il vous laisse tranquille cette fois",
        "Prévenir l'enfant avant l'appel, lui donner une activité et annoncer la récompense s'il ne vous dérange pas",
        "Partir dans une autre pièce et fermer la porte à clé",
        "Lui dire sévèrement « Ne viens pas me déranger »",
      ],
      correctIndex: 1,
      explanation:
        "La préparation en 3 temps — prévenir, occuper, récompenser — est la clé. L'enfant sait à quoi s'attendre et a une raison concrète de coopérer.",
    },
    {
      id: "4-5",
      question:
        "Pendant votre activité, à quel moment féliciter l'enfant ?",
      options: [
        "Seulement à la fin si tout s'est bien passé",
        "Régulièrement, toutes les quelques minutes pendant qu'il joue sans interrompre",
        "Uniquement le lendemain",
        "Jamais, il doit apprendre à se gérer seul",
      ],
      correctIndex: 1,
      explanation:
        "On renforce pendant le comportement, pas seulement à la fin. Des retours fréquents pendant l'activité consolident l'apprentissage.",
    },
  ],
  5: [
    {
      id: "5-1",
      question: "Qu'est-ce qu'un système de jetons ?",
      options: [
        "Une punition déguisée",
        "Un système de récompenses où l'enfant gagne des points pour ses bons comportements",
        "Un jeu de société éducatif",
        "Une méthode réservée aux enseignants",
      ],
      correctIndex: 1,
      explanation:
        "Le système de jetons récompense les comportements positifs avec des points échangeables contre des privilèges ou récompenses.",
    },
    {
      id: "5-2",
      question:
        "Combien de comportements cibles faut-il choisir au départ ?",
      options: [
        "Le maximum possible pour tout couvrir",
        "2 à 3 comportements simples et observables",
        "Un seul pour ne pas surcharger",
        "10 comportements pour être complet",
      ],
      correctIndex: 1,
      explanation:
        "On commence avec 2-3 comportements simples, observables et atteignables. Trop de cibles démotive l'enfant.",
    },
    {
      id: "5-3",
      question:
        "Quand faut-il donner le jeton à l'enfant ?",
      options: [
        "À la fin de la journée",
        "Immédiatement après le comportement souhaité",
        "Le week-end en récapitulant la semaine",
        "Quand le parent y pense",
      ],
      correctIndex: 1,
      explanation:
        "L'immédiateté est cruciale : le jeton doit suivre le comportement le plus vite possible pour que l'enfant fasse le lien.",
    },
    {
      id: "5-4",
      question: "Peut-on retirer des jetons déjà gagnés ?",
      options: [
        "Oui, pour chaque mauvais comportement",
        "Non, les jetons gagnés ne doivent jamais être retirés",
        "Oui, mais seulement le week-end",
        "Oui, si l'enfant n'obéit pas dans les 5 secondes",
      ],
      correctIndex: 1,
      explanation:
        "Principe fondamental de Barkley : on ne retire jamais un jeton gagné. Le système doit rester motivant et positif.",
    },
    {
      id: "5-5",
      question:
        "Pour un enfant de 4 ans, quel type de jetons est le plus adapté ?",
      options: [
        "Des points écrits sur un tableau",
        "Des objets concrets et visuels (jetons en plastique, autocollants, étoiles à coller)",
        "Un compte numérique dans une application",
        "De l'argent virtuel à convertir en fin de mois",
      ],
      correctIndex: 1,
      explanation:
        "Les jeunes enfants ont besoin de supports concrets et visuels. Avant 8-9 ans, les points abstraits sont trop éloignés du comportement.",
    },
    {
      id: "5-6",
      question:
        "Parmi ces récompenses, laquelle est la MIEUX adaptée au système de jetons ?",
      options: [
        "Un cadeau cher acheté une fois par mois",
        "Un mélange de petits privilèges quotidiens (temps d'écran, choix du dessert) et de récompenses plus grandes ponctuelles",
        "Uniquement des bonbons",
        "De l'argent de poche en espèces",
      ],
      correctIndex: 1,
      explanation:
        "Un bon menu de récompenses combine des petites gratifications fréquentes (immédiateté) et des plus grandes plus rares (motivation à long terme).",
    },
    {
      id: "5-7",
      question:
        "Après 2 semaines, votre enfant gagne facilement tous ses jetons. Que faites-vous ?",
      options: [
        "Vous arrêtez le système car il fonctionne",
        "Vous augmentez doucement les exigences ou ajoutez un nouveau comportement cible",
        "Vous doublez brusquement le coût de toutes les récompenses",
        "Vous retirez des jetons pour compenser",
      ],
      correctIndex: 1,
      explanation:
        "Si l'enfant réussit bien, on ajuste progressivement : ajouter un comportement ou relever légèrement la barre. Jamais de changement brutal ni de retrait punitif.",
    },
  ],
  6: [
    {
      id: "6-1",
      question: "Qu'est-ce que le retrait de privilèges ?",
      options: [
        "Interdire toutes les activités pendant une semaine",
        "Supprimer un privilège spécifique et limité dans le temps en conséquence d'un comportement précis",
        "Enlever les jouets de la chambre",
        "Priver l'enfant de repas",
      ],
      correctIndex: 1,
      explanation:
        "Le retrait de privilèges est une conséquence proportionnée, limitée dans le temps, liée à un comportement précis.",
    },
    {
      id: "6-2",
      question:
        "Quelle est la durée recommandée d'un retrait de privilèges ?",
      options: [
        "Toute la semaine",
        "Courte et proportionnelle (quelques heures à une journée maximum)",
        "Aussi longtemps que nécessaire pour que l'enfant comprenne",
        "Jusqu'à ce que l'enfant s'excuse",
      ],
      correctIndex: 1,
      explanation:
        "Les conséquences doivent être courtes et proportionnées. Une durée trop longue perd son effet éducatif.",
    },
    {
      id: "6-3",
      question:
        "Avant d'appliquer un retrait de privilèges, il faut :",
      options: [
        "Attendre que l'enfant récidive plusieurs fois",
        "Avoir prévenu l'enfant clairement de la règle et de la conséquence",
        "Demander l'accord de l'enfant",
        "S'assurer que l'enfant est de bonne humeur",
      ],
      correctIndex: 1,
      explanation:
        "L'enfant doit connaître la règle et la conséquence à l'avance. Le retrait ne doit jamais être une surprise.",
    },
    {
      id: "6-4",
      question:
        "Votre enfant a oublié de ranger son vélo deux soirs de suite, alors que c'était sa responsabilité annoncée. Quelle conséquence est la plus appropriée ?",
      options: [
        "Confisquer le vélo une semaine entière",
        "Pas de vélo le lendemain et rappel de la règle au calme",
        "Supprimer tous ses écrans jusqu'à nouvel ordre",
        "Le priver de dessert pendant 3 jours",
      ],
      correctIndex: 1,
      explanation:
        "La conséquence doit être proportionnée, liée au comportement (logique), et de courte durée. Suspendre le vélo un jour est suffisant et pédagogique.",
    },
    {
      id: "6-5",
      question:
        "Pourquoi les deux parents doivent-ils appliquer les mêmes conséquences ?",
      options: [
        "Pour que l'enfant ne puisse pas jouer un parent contre l'autre",
        "Parce que la loi l'exige",
        "Pour punir deux fois l'enfant",
        "Parce qu'un seul parent ne peut pas gérer seul",
      ],
      correctIndex: 0,
      explanation:
        "La cohérence entre parents est fondamentale : des règles différentes rendent le système imprévisible et entraînent du triangulation.",
    },
  ],
  7: [
    {
      id: "7-1",
      question: "Qu'est-ce que le temps de pause (time-out) ?",
      options: [
        "Envoyer l'enfant dans sa chambre pour le reste de la journée",
        "Un court retrait dans un endroit calme et ennuyeux pour retrouver le calme",
        "Une punition physique",
        "Ignorer l'enfant pendant plusieurs heures",
      ],
      correctIndex: 1,
      explanation:
        "Le time-out est un court retrait (1-2 min par année d'âge) dans un lieu calme et ennuyeux, pour permettre à l'enfant de se calmer.",
    },
    {
      id: "7-2",
      question: "Quelle est la durée recommandée du time-out ?",
      options: [
        "30 minutes minimum",
        "1 à 2 minutes par année d'âge de l'enfant",
        "Aussi longtemps que l'enfant crie",
        "Toujours exactement 10 minutes",
      ],
      correctIndex: 1,
      explanation:
        "La règle est 1-2 minutes par année d'âge. Un time-out trop long perd son efficacité éducative.",
    },
    {
      id: "7-3",
      question: "Que faites-vous à la fin du time-out ?",
      options: [
        "Vous demandez à l'enfant de s'excuser longuement",
        "Vous reprenez calmement l'instruction initiale sans revenir sur la crise",
        "Vous expliquez pendant 10 minutes pourquoi son comportement était mauvais",
        "Vous le privez de dessert en plus",
      ],
      correctIndex: 1,
      explanation:
        "Après le time-out, on reprend calmement là où on en était. Pas de sermon ni de punition supplémentaire.",
    },
    {
      id: "7-4",
      question:
        "Quel est un lieu de time-out INAPPROPRIÉ ?",
      options: [
        "Une chaise dans un coin calme du salon",
        "Un placard ou une pièce fermée à clé dans le noir",
        "Une marche d'escalier à l'écart des jouets",
        "Un tapis dans le couloir, à vue du parent",
      ],
      correctIndex: 1,
      explanation:
        "Le time-out n'est JAMAIS dans un espace fermé à clé, sombre ou effrayant. Le lieu doit être ennuyeux mais sûr et rassurant, à vue du parent.",
    },
    {
      id: "7-5",
      question:
        "Votre enfant se lève du time-out avant la fin. Que faites-vous ?",
      options: [
        "Vous le ramenez calmement, sans parler, et le chronomètre recommence",
        "Vous abandonnez et passez à autre chose",
        "Vous le giflez pour lui apprendre",
        "Vous doublez la durée à chaque sortie",
      ],
      correctIndex: 0,
      explanation:
        "On le ramène calmement, sans parole ni contact visuel, et on redémarre le chrono. Aucune punition physique, aucun escalade verbale.",
    },
    {
      id: "7-6",
      question:
        "Pour quel profil d'enfant le time-out est-il adapté ?",
      options: [
        "Tout enfant de tout âge",
        "Environ de 2 à 10-12 ans, selon la maturité",
        "Seulement les adolescents",
        "Dès les premiers mois de vie",
      ],
      correctIndex: 1,
      explanation:
        "Le time-out concerne les enfants d'environ 2 à 10-12 ans. Avant 2 ans, l'enfant ne peut pas comprendre ; après, d'autres stratégies sont plus adaptées.",
    },
    {
      id: "7-7",
      question:
        "Le chronomètre du time-out démarre quand ?",
      options: [
        "Dès que vous annoncez la conséquence",
        "Quand l'enfant est assis et calme à l'endroit prévu",
        "À la fin du repas",
        "Quand le parent décide que c'est fini",
      ],
      correctIndex: 1,
      explanation:
        "Le décompte ne démarre que lorsque l'enfant est calme et assis au bon endroit. S'il crie ou se débat, on attend le calme sans parler.",
    },
  ],
  8: [
    {
      id: "8-1",
      question:
        "Avant une sortie (magasin, restaurant), la stratégie clé est :",
      options: [
        "Espérer que tout se passe bien cette fois",
        "Établir 2-3 règles claires avec l'enfant AVANT de partir et prévoir une récompense",
        "Menacer l'enfant de ne jamais ressortir s'il se comporte mal",
        "Éviter de sortir avec l'enfant",
      ],
      correctIndex: 1,
      explanation:
        "La préparation est la clé : on définit les règles et les conséquences AVANT la sortie, et on prévoit une récompense en cas de réussite.",
    },
    {
      id: "8-2",
      question:
        "Pendant la sortie, comment maintenir le bon comportement ?",
      options: [
        "En rappelant constamment les punitions possibles",
        "En donnant des retours positifs fréquents pendant que l'enfant se comporte bien",
        "En ignorant l'enfant pour qu'il soit autonome",
        "En lui achetant ce qu'il veut pour éviter les crises",
      ],
      correctIndex: 1,
      explanation:
        "Des encouragements fréquents pendant la sortie renforcent le bon comportement et préviennent les crises.",
    },
    {
      id: "8-3",
      question:
        "Si l'enfant fait une crise en public, la meilleure réponse est :",
      options: [
        "Crier plus fort que lui pour reprendre le contrôle",
        "Appliquer calmement la conséquence prévue, même si des gens regardent",
        "Céder pour éviter l'humiliation",
        "Le punir deux fois plus sévèrement à la maison",
      ],
      correctIndex: 1,
      explanation:
        "On reste cohérent et on applique la conséquence prévue, calmement. Céder en public enseigne que les crises fonctionnent.",
    },
    {
      id: "8-4",
      question:
        "Avant d'entrer dans un supermarché, quelle formulation des règles est la plus efficace ?",
      options: [
        "« Sois sage sinon tu verras. »",
        "« Les règles : tu restes à côté de moi, tu ne touches rien sans demander, tu parles doucement. Si tu respectes, tu auras X à la sortie. »",
        "« On fait vite, ne m'énerve pas. »",
        "« Tu connais les règles, inutile de les répéter. »",
      ],
      correctIndex: 1,
      explanation:
        "Les règles doivent être concrètes, peu nombreuses (2-3), et associées à une récompense claire. Répéter à chaque sortie aide la mémorisation.",
    },
    {
      id: "8-5",
      question:
        "Chez les grands-parents, les règles doivent :",
      options: [
        "Être assouplies car c'est une occasion spéciale",
        "Rester globalement identiques, avec un aménagement explicite si nécessaire",
        "Être ignorées pendant la visite",
        "Être plus strictes que d'habitude",
      ],
      correctIndex: 1,
      explanation:
        "La généralisation nécessite de la cohérence. On peut adapter marginalement, mais on explicite les aménagements avec l'enfant à l'avance.",
    },
    {
      id: "8-6",
      question:
        "Votre enfant doit attendre 20 minutes dans la voiture. Que prévoyez-vous ?",
      options: [
        "Rien, il doit apprendre à patienter",
        "Une activité concrète (livre, jeu, musique) préparée à l'avance",
        "Lui donner votre téléphone sans limite",
        "Le faire sortir de la voiture",
      ],
      correctIndex: 1,
      explanation:
        "L'attente vide est très difficile pour un enfant TDAH. On anticipe toujours l'ennui par une activité concrète et limitée.",
    },
    {
      id: "8-7",
      question:
        "Quelle est la différence entre une récompense et une corruption ?",
      options: [
        "Aucune, c'est pareil",
        "La récompense est annoncée AVANT le comportement ; la corruption est promise pendant la crise pour faire cesser le comportement",
        "La récompense est toujours matérielle",
        "La corruption est plus efficace sur le long terme",
      ],
      correctIndex: 1,
      explanation:
        "Distinction cruciale : récompense = annoncée à l'avance pour un comportement attendu. Corruption = promise pendant/après une crise pour la stopper — elle renforce la crise.",
    },
  ],
  9: [
    {
      id: "9-1",
      question:
        "Pour gérer un nouveau problème de comportement, la première étape est :",
      options: [
        "Punir immédiatement",
        "Définir clairement le comportement problématique et analyser son contexte (quand, où, pourquoi)",
        "Demander à l'enfant pourquoi il fait ça",
        "Ignorer et espérer que ça passe",
      ],
      correctIndex: 1,
      explanation:
        "On commence par observer et définir précisément le comportement : dans quel contexte il apparaît, ce qui le déclenche, ce qui le maintient.",
    },
    {
      id: "9-2",
      question:
        "Quelle approche utiliser face à un nouveau défi comportemental ?",
      options: [
        "Inventer une nouvelle punition à chaque fois",
        "Appliquer les mêmes principes appris (attention positive, ordres efficaces, jetons, conséquences)",
        "Chercher un nouveau programme",
        "Consulter internet pour chaque situation",
      ],
      correctIndex: 1,
      explanation:
        "Les principes du programme Barkley s'appliquent à tous les comportements : on réutilise les outils déjà maîtrisés.",
    },
    {
      id: "9-3",
      question:
        "Pourquoi est-il important d'anticiper les problèmes futurs ?",
      options: [
        "Pour s'inquiéter à l'avance",
        "Pour avoir un plan d'action prêt au lieu de réagir dans l'urgence",
        "Pour éviter que l'enfant grandisse",
        "Pour tout contrôler dans la vie de l'enfant",
      ],
      correctIndex: 1,
      explanation:
        "Anticiper permet de réagir avec un plan clair plutôt que sous le stress, ce qui donne des réponses plus cohérentes et efficaces.",
    },
    {
      id: "9-4",
      question:
        "Votre enfant commence à mentir régulièrement. Quelle est la meilleure première étape ?",
      options: [
        "Le punir très fort dès le premier mensonge repéré",
        "Observer quand, dans quels contextes et pourquoi il ment (peur d'une sanction, attention, évitement)",
        "Ne plus jamais lui faire confiance",
        "Lui promettre un cadeau s'il arrête",
      ],
      correctIndex: 1,
      explanation:
        "On analyse le contexte (Antécédent-Comportement-Conséquence) avant d'agir. Le mensonge a souvent une fonction — souvent éviter une punition trop sévère.",
    },
    {
      id: "9-5",
      question:
        "Face à un nouveau problème, la grille d'analyse Barkley est :",
      options: [
        "Antécédents → Comportement → Conséquences",
        "Punition → Récompense → Culpabilité",
        "Discussion → Menaces → Isolement",
        "Ignorer → Attendre → Espérer",
      ],
      correctIndex: 0,
      explanation:
        "L'analyse ABC (Antécédents, Comportement, Conséquences) est le cadre d'analyse fonctionnelle commun à tous les comportements.",
    },
  ],
  10: [
    {
      id: "10-1",
      question:
        "À la fin du programme, quel est l'objectif principal du bilan ?",
      options: [
        "Évaluer si l'enfant est guéri du TDAH",
        "Identifier les stratégies qui fonctionnent le mieux pour votre famille et planifier leur maintien",
        "Comparer son enfant aux autres",
        "Décider d'arrêter toutes les stratégies",
      ],
      correctIndex: 1,
      explanation:
        "Le bilan sert à identifier ce qui marche, consolider les acquis et planifier le maintien à long terme. Le TDAH ne se « guérit » pas.",
    },
    {
      id: "10-2",
      question:
        "Comment maintenir les acquis du programme dans la durée ?",
      options: [
        "Arrêter les stratégies une fois que l'enfant va mieux",
        "Continuer à appliquer les principes au quotidien et s'adapter à l'évolution de l'enfant",
        "Ne plus jamais changer de méthode",
        "Recommencer le programme depuis le début chaque année",
      ],
      correctIndex: 1,
      explanation:
        "Les stratégies doivent rester actives et s'adapter au fur et à mesure que l'enfant grandit. La constance est la clé.",
    },
    {
      id: "10-3",
      question:
        "Si les difficultés réapparaissent après une période d'amélioration, il faut :",
      options: [
        "Conclure que le programme n'a pas fonctionné",
        "Revenir aux bases : renforcer l'attention positive, revoir les règles et les conséquences",
        "Abandonner et essayer quelque chose de complètement différent",
        "Punir plus sévèrement pour rattraper le retard",
      ],
      correctIndex: 1,
      explanation:
        "Des rechutes sont normales. On revient aux fondamentaux du programme : c'est un signe que les stratégies doivent être réactivées, pas abandonnées.",
    },
    {
      id: "10-4",
      question:
        "Quelle est la meilleure manière de célébrer les progrès de votre enfant ?",
      options: [
        "Lister ses défauts restants pour qu'il reste humble",
        "Reconnaître explicitement les efforts et progrès concrets avec lui (« Tu as réussi X, je suis fier de toi »)",
        "Ne rien dire, ça lui monterait à la tête",
        "Lui offrir un gros cadeau matériel chaque mois",
      ],
      correctIndex: 1,
      explanation:
        "Les progrès doivent être verbalisés explicitement. L'enfant TDAH a besoin de retours positifs concrets pour consolider son estime de soi.",
    },
    {
      id: "10-5",
      question:
        "Combien de temps après le programme peut-on envisager des « séances de rappel » ?",
      options: [
        "Jamais, le programme est terminé définitivement",
        "Périodiquement (tous les 3-6 mois) ou lors de transitions importantes (déménagement, nouvelle école)",
        "Seulement si l'enfant redevient difficile",
        "Uniquement à l'adolescence",
      ],
      correctIndex: 1,
      explanation:
        "Des séances de rappel régulières, ou lors des transitions, maintiennent les acquis. Le TDAH évolue avec l'âge et les contextes changeants.",
    },
  ],
};
