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
  ],
};
