import type { StepContent } from "./types";

export const step3Content: StepContent = {
    stepNumber: 3,
    title: "Les ordres efficaces",
    intro:
        "« Range ta chambre ! », « Dépêche-toi ! », « Combien de fois je vais devoir te le répéter ? ». Ces phrases, tous les parents les connaissent. Mais pour un enfant TDAH, elles sont comme du brouillard : trop vagues, trop longues, trop lointaines. Ce troisième module, inspiré de l'approche du Dr Barkley, vous apprend à formuler des consignes que le cerveau de votre enfant peut réellement traiter. Ce n'est pas une question d'autorité — c'est une question de communication adaptée.",

    understand: {
        heading: "Comprendre",
        body:
            "La mémoire de travail d'un enfant TDAH fonctionne comme un post-it de petite taille : elle peut retenir une ou deux informations à la fois, pas cinq. Quand vous dites « Monte dans ta chambre, brosse-toi les dents, mets ton pyjama et choisis un livre », son cerveau enregistre peut-être « monte » et « livre », mais perd tout le reste.\n\n" +
            "Par ailleurs, la distance physique et le contact visuel jouent un rôle crucial. Un ordre crié depuis la cuisine à un enfant qui joue dans sa chambre a très peu de chances d'être traité. Le cerveau TDAH a besoin d'un signal d'entrée fort — la proximité du parent, le regard, le contact physique léger — pour activer l'attention.\n\n" +
            "Enfin, la formulation compte énormément. « Tu pourrais ranger tes jouets ? » est une question, pas un ordre. L'enfant peut légitimement répondre « non ». « Arrête de crier » est une consigne négative : elle dit ce qu'il ne faut pas faire, mais pas ce qu'il faut faire à la place. Le cerveau doit d'abord décoder le « ne pas », puis imaginer l'alternative — c'est deux étapes cognitives au lieu d'une.\n\n" +
            "La bonne nouvelle, c'est que formuler des ordres efficaces est une compétence qui s'apprend. Et quand les consignes sont claires, courtes et directes, la coopération augmente considérablement — non parce que l'enfant obéit mieux, mais parce qu'il comprend enfin ce qu'on attend de lui.",
        callout: {
            type: "tip",
            text: "Règle simple : si votre consigne contient plus de dix mots ou plus d'une action, elle est probablement trop longue. Testez en comptant sur vos doigts.",
        },
    },

    technique: {
        heading: "La technique",
        body:
            "Voici les cinq principes d'un ordre efficace, adaptés au fonctionnement du cerveau TDAH :\n\n" +
            "1. Approchez-vous. Allez physiquement vers votre enfant. Placez-vous à sa hauteur si possible. Posez une main sur son épaule si cela l'aide à se connecter. Attendez d'avoir son regard avant de parler.\n\n" +
            "2. Soyez bref et direct. Une seule instruction à la fois. « Mets tes chaussures. » Point. Pas « Mets tes chaussures et prends ton manteau et n'oublie pas ton goûter ». Chaque instruction supplémentaire dilue la première.\n\n" +
            "3. Formulez positivement. Dites ce que vous voulez voir, pas ce que vous ne voulez pas voir. Au lieu de « Arrête de courir », dites « Marche ». Au lieu de « Ne crie pas », dites « Parle doucement ». Le cerveau traite plus rapidement une consigne positive.\n\n" +
            "4. Ne posez pas de question. « Est-ce que tu peux mettre la table ? » laisse une porte ouverte au refus. « Mets la table, s'il te plaît » est clair tout en restant respectueux. Le « s'il te plaît » est une politesse, pas une option.\n\n" +
            "5. Attendez en silence. Après avoir donné la consigne, comptez silencieusement jusqu'à cinq ou dix. Ne répétez pas. Ne rajoutez pas d'explication. Le cerveau TDAH a besoin de temps de traitement. Si vous remplissez ce silence avec des mots, vous redémarrez le compteur à zéro.\n\n" +
            "Une erreur fréquente est de répéter la consigne en augmentant le volume. Cela ne fait que provoquer de l'anxiété ou de la résistance. La première formulation, bien faite et suivie de silence, est plus efficace que dix répétitions agacées.\n\n" +
            "Si après dix secondes de silence il ne se passe rien, reformulez une seule fois calmement, en vous assurant du contact visuel : « Léo, regarde-moi. Mets tes chaussures maintenant ». Les étapes suivantes du programme vous donneront des outils pour gérer la non-compliance — pour l'instant, concentrez-vous sur la clarté de la consigne.",
        callout: {
            type: "example",
            text: "Avant : « Allez, combien de fois je t'ai dit de ranger ça, tu laisses toujours tout traîner ! ». Après : s'approcher, main sur l'épaule, contact visuel. « Range le jeu dans la boîte. » Silence. Cinq secondes. L'enfant commence à ranger.",
        },
    },

    scenarios: [
        {
            title: "Le marathon du matin",
            body:
                "Chaque matin, la mère de Sacha, 7 ans, enchaîne : « Lève-toi, habille-toi, déjeune, brosse-toi les dents ! ». Sacha reste en pyjama devant son bol, le regard dans le vide. Sa mère répète trois fois, puis crie. Ils arrivent en retard à l'école.\n\n" +
                "Avec la nouvelle approche : la mère va dans la chambre de Sacha, s'assoit sur le lit, pose une main sur son dos. « Sacha, regarde-moi. Habille-toi. » Elle sort le vêtement du jour pour éliminer la surcharge de choix. Elle attend dix secondes en silence. Sacha commence à enfiler son pantalon. Quand c'est fait, elle revient : « Maintenant, viens déjeuner. » Une seule consigne à la fois, dans l'ordre.\n\n" +
                "Le matin prend le même temps, mais sans cris. En quelques semaines, Sacha commence à anticiper l'étape suivante tout seul.",
        },
        {
            title: "La bataille des devoirs",
            body:
                "Tous les soirs, le père d'Aïcha, 9 ans, dit : « Tu as des devoirs, va les faire dans ta chambre ». Aïcha s'installe devant son cahier, puis trente minutes plus tard, il la retrouve en train de dessiner dans la marge. Il explose : « Tu n'as rien fait ! ».\n\n" +
                "Avec la nouvelle approche : le père s'assoit à côté d'Aïcha. Il ouvre le cahier avec elle. « Lis la première consigne à voix haute. » Quand c'est fait : « Écris la réponse du premier exercice. » Il reste à proximité, silencieux, disponible. Il ne fait pas les devoirs à sa place — il séquence la tâche en micro-étapes et donne une instruction à la fois.\n\n" +
                "Aïcha termine en vingt minutes au lieu de soixante. Son père découvre qu'elle n'était pas paresseuse : elle était submergée par l'ampleur de la tâche.",
        },
        {
            title: "L'heure du coucher",
            body:
                "Chaque soir, la mère d'Émile, 6 ans, lance depuis le salon : « C'est l'heure d'aller au lit ! ». Émile continue de jouer comme s'il n'avait rien entendu. Elle répète. Il négocie. Elle hausse le ton. Il pleure. Le coucher prend une heure.\n\n" +
                "Avec la nouvelle approche : la mère prévient cinq minutes avant (« Dans cinq minutes, c'est le coucher »). Quand le moment arrive, elle va vers Émile, se met à sa hauteur. « Émile, regarde-moi. C'est le moment de mettre ton pyjama. » Elle attend. Émile soupire mais se lève. Ensuite : « Va te brosser les dents. » Puis : « Choisis un livre pour l'histoire. » Trois étapes, trois consignes séparées, données à proximité.\n\n" +
                "Le coucher passe de soixante minutes à vingt-cinq. Émile sait exactement ce qu'on attend de lui et dans quel ordre.",
        },
    ],

    keyTakeaways: [
        "Approchez-vous physiquement et obtenez le contact visuel avant de parler — un ordre crié à distance est rarement traité par le cerveau TDAH.",
        "Une seule instruction à la fois, dix mots maximum — la mémoire de travail de votre enfant ne peut pas stocker une liste.",
        "Formulez positivement (dites ce qu'il faut faire) et directement (affirmation, pas question).",
        "Après la consigne, attendez 5 à 10 secondes en silence — le cerveau a besoin de temps de traitement.",
        "Ne répétez pas en boucle : une consigne claire suivie de silence est plus efficace que dix rappels agacés.",
    ],

    practiceExercise:
        "Choisissez trois moments récurrents de la journée (matin, devoirs, coucher). Pour chacun, réécrivez vos consignes habituelles en appliquant les cinq principes : approche, brièveté, formulation positive, affirmation, silence. Notez dans l'application la consigne « avant » et la consigne « après ». Pratiquez pendant une semaine et observez : le nombre de répétitions diminue-t-il ? Le niveau de tension baisse-t-il ? Notez vos observations chaque soir.",
};
