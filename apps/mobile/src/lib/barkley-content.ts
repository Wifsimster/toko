// Self-contained Barkley parent-training content + quizzes (French only).
// Ported verbatim from the web app so the mobile app can render the 10-step
// program offline. No external imports, no i18n.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Callout = {
    type: "tip" | "warning" | "example";
    text: string;
};

export type ContentSection = {
    heading: string;
    body: string;
    callout?: Callout;
};

export type Scenario = {
    title: string;
    body: string;
};

export type StepContent = {
    stepNumber: number;
    title: string;
    intro: string;
    understand: ContentSection;
    technique: ContentSection;
    scenarios: Scenario[];
    keyTakeaways: string[];
    practiceExercise: string;
};

export type QuizQuestion = {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
};

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

const STEPS: Record<number, StepContent> = {
    1: {
        stepNumber: 1,
        title: "Pourquoi mon enfant se comporte-t-il ainsi ?",
        intro:
            "Votre enfant oublie son cartable pour la troisième fois cette semaine. Il explose de colère parce que ses pâtes ne sont pas « les bonnes ». Il met vingt minutes à mettre ses chaussures alors que vous êtes déjà en retard. Vous vous dites peut-être : « Il le fait exprès », « Il est paresseux » ou « Il me provoque ». Ces pensées sont normales — mais elles reposent sur un malentendu. Ce premier module, inspiré de l'approche du Dr Russell Barkley, vous propose de changer de regard sur le comportement de votre enfant. Non pas pour l'excuser, mais pour mieux le comprendre — et donc mieux l'aider.",
        understand: {
            heading: "Comprendre",
            body:
                "Le TDAH n'est pas un problème de volonté, de caractère ou d'éducation. C'est un trouble neurodéveloppemental qui affecte les fonctions exécutives du cerveau : la capacité à planifier, à freiner une impulsion, à gérer ses émotions, à garder une consigne en mémoire de travail et à se motiver pour une tâche non stimulante.\n\n" +
                "Imaginez un chef d'orchestre distrait : les musiciens (les compétences de votre enfant) sont bien là, mais personne ne coordonne l'ensemble au bon moment. Votre enfant sait qu'il doit ranger son cartable. Il sait qu'on ne crie pas à table. Mais entre savoir et faire, il y a un fossé neurologique que la volonté seule ne peut pas combler.\n\n" +
                "Quand un parent interprète ces difficultés comme de la provocation ou de la paresse, un cercle vicieux s'installe : plus on punit, plus l'enfant se sent incompris, plus il réagit, plus le parent se sent démuni. Barkley appelle cela le « piège coercitif ». Le parent hausse le ton, l'enfant résiste, le parent cède ou explose, et le schéma se répète.\n\n" +
                "Reconnaître que le cerveau de votre enfant fonctionne différemment ne signifie pas tout accepter. Cela signifie ajuster vos attentes et vos stratégies pour travailler avec son cerveau, et non contre lui. Un enfant myope n'est pas puni parce qu'il ne voit pas le tableau : on lui donne des lunettes. Les étapes de ce programme sont les lunettes de votre parentalité.",
            callout: {
                type: "tip",
                text: "Petit exercice mental : la prochaine fois que vous pensez « il le fait exprès », reformulez intérieurement en « il n'y arrive pas encore ». Ce simple changement de mot modifie toute votre posture.",
            },
        },
        technique: {
            heading: "La technique",
            body:
                "La technique clé de cette étape est le recadrage cognitif parental. Il s'agit d'apprendre à distinguer le « ne veut pas » du « ne peut pas encore ».\n\n" +
                "Concrètement, tenez un petit carnet (ou utilisez les notes de l'application) et, pendant une semaine, notez chaque situation difficile en deux colonnes :\n\n" +
                "— Colonne 1 : « Ce que j'ai pensé sur le moment » (ex. : « Il me provoque »)\n" +
                "— Colonne 2 : « Quelle fonction exécutive était en jeu ? » (ex. : mémoire de travail, inhibition, régulation émotionnelle)\n\n" +
                "Vous n'avez pas besoin d'être neuropsychologue. Les grandes catégories sont simples :\n" +
                "• Mémoire de travail : il oublie les consignes, perd ses affaires.\n" +
                "• Inhibition : il agit avant de réfléchir, coupe la parole, touche à tout.\n" +
                "• Régulation émotionnelle : il explose de colère ou de tristesse de manière disproportionnée.\n" +
                "• Flexibilité : il supporte mal les changements de plan ou les transitions.\n" +
                "• Planification : il ne sait pas par où commencer, il est débordé par les étapes.\n\n" +
                "En identifiant la fonction exécutive en difficulté, vous passez du jugement (« il est insupportable ») à l'analyse (« il a du mal à freiner son impulsion »). Et c'est à partir de cette analyse que les stratégies des prochaines étapes deviennent possibles.",
            callout: {
                type: "warning",
                text: "Ce programme s'inspire des travaux du Dr Barkley mais ne remplace pas un suivi professionnel. Si votre enfant n'a pas encore été évalué, consultez un professionnel de santé spécialisé.",
            },
        },
        scenarios: [
            {
                title: "Le cartable oublié",
                body:
                    "Lundi matin, Théo, 8 ans, arrive à l'école sans son cartable — resté dans l'entrée. Sa mère, excédée, lui dit : « Tu ne fais jamais attention ! ». Théo baisse la tête. Le soir, rebelote avec le carnet de liaison. Sa mère pense qu'il s'en fiche.\n\n" +
                    "En réalité, Théo a une mémoire de travail fragile. Il avait en tête de prendre son cartable, mais entre le moment où il a enfilé ses chaussures et celui où il a caressé le chat, l'information s'est effacée. Ce n'est pas de l'indifférence : c'est un déficit de maintien de l'information en temps réel.\n\n" +
                    "Une approche ajustée : placer le cartable devant la porte d'entrée (adapter l'environnement) et vérifier avec lui avant de partir (soutien externe à la mémoire de travail).",
            },
            {
                title: "L'explosion à table",
                body:
                    "Mercredi soir, Inès, 6 ans, repousse violemment son assiette en criant « C'est dégoûtant ! ». Son père lève le ton : « On ne parle pas comme ça ! ». Inès fond en larmes et quitte la table. Le père pense qu'elle est capricieuse.\n\n" +
                    "Inès sort d'une journée de classe où elle a dû contenir ses impulsions pendant six heures. Sa capacité de régulation émotionnelle est épuisée. L'assiette n'est que le déclencheur, pas la cause. C'est comme un barrage qui cède après une journée de pluie.\n\n" +
                    "Une approche ajustée : prévoir un temps calme de dix minutes en rentrant de l'école, proposer un choix limité pour le dîner, et accueillir l'émotion (« Tu as l'air épuisée ») avant de recadrer le comportement.",
            },
            {
                title: "Les devoirs impossibles",
                body:
                    "Samedi après-midi, Lucas, 10 ans, doit faire un exercice de maths. Au bout de deux minutes, il se lève, joue avec son stylo, regarde par la fenêtre. Son père s'énerve : « Concentre-toi, c'est pas compliqué ! ». Lucas explose : « De toute façon je suis nul ! ».\n\n" +
                    "Lucas a en réalité deux difficultés combinées : un déficit de planification (il ne sait pas par quelle étape commencer) et un défaut d'auto-motivation (la tâche n'est pas stimulante, son cerveau ne produit pas assez de dopamine pour s'y engager). Ce n'est pas de la paresse.\n\n" +
                    "Une approche ajustée : découper l'exercice en micro-étapes (« Fais juste le premier calcul »), utiliser un minuteur de cinq minutes avec une pause ensuite, et valoriser l'effort plutôt que le résultat.",
            },
        ],
        keyTakeaways: [
            "Le TDAH est un trouble neurologique des fonctions exécutives, pas un manque de volonté ou d'éducation.",
            "Le piège coercitif (punir → résistance → escalade) s'installe quand on confond « ne veut pas » et « ne peut pas encore ».",
            "Identifier la fonction exécutive en difficulté (mémoire, inhibition, émotion, flexibilité, planification) permet de passer du jugement à la stratégie.",
            "Adapter l'environnement et soutenir de l'extérieur ce que le cerveau ne fait pas encore seul est la clé.",
            "Comprendre n'est pas excuser : c'est le premier pas pour aider efficacement.",
        ],
        practiceExercise:
            "Cette semaine, choisissez trois situations difficiles avec votre enfant. Pour chacune, notez dans l'application : (1) ce qui s'est passé, (2) ce que vous avez pensé spontanément, (3) quelle fonction exécutive était probablement en jeu. À la fin de la semaine, relisez vos notes. Observez-vous un schéma qui revient ? Partagez votre découverte avec votre co-parent ou une personne de confiance.",
    },
    2: {
        stepNumber: 2,
        title: "Accordez une attention positive à votre enfant",
        intro:
            "Quand le quotidien avec un enfant TDAH est ponctué de crises, d'oublis et de conflits, on finit par ne voir que ce qui ne va pas. Les interactions deviennent un enchaînement de rappels à l'ordre, de soupirs et de reproches. L'enfant, lui, reçoit un message implicite : « Je ne suis remarqué que quand je pose problème ». Ce deuxième module, inspiré de l'approche du Dr Barkley, vous invite à inverser cette dynamique grâce à un outil simple mais puissant : le temps spécial. Quinze à vingt minutes par jour qui peuvent transformer votre relation.",
        understand: {
            heading: "Comprendre",
            body:
                "Les recherches montrent que dans les familles où un enfant présente un TDAH, le ratio d'interactions négatives par rapport aux interactions positives est souvent déséquilibré : on estime que ces enfants reçoivent en moyenne trois à cinq fois plus de remarques négatives que les autres enfants de leur âge.\n\n" +
                "Ce déséquilibre a des conséquences profondes. L'enfant développe une image de lui-même centrée sur l'échec : « Je suis celui qui fait tout mal ». Il perd sa motivation à coopérer, puisque ses efforts passent inaperçus. Et la relation parent-enfant s'érode : on ne profite plus l'un de l'autre, on se subit.\n\n" +
                "L'attention positive n'est pas de la naïveté ni du laxisme. C'est un levier neurobiologique : quand un enfant se sent vu, reconnu et apprécié, son cerveau libère de la dopamine — précisément le neurotransmetteur qui lui fait défaut. L'attention positive est donc un carburant pour la coopération.\n\n" +
                "Barkley insiste sur un point essentiel : cette attention doit être inconditionnelle et prévisible. Ce n'est pas une récompense pour un bon comportement. C'est un socle relationnel que rien ne peut retirer. C'est pourquoi le temps spécial n'est jamais supprimé comme punition — ce serait comme retirer l'amour.",
            callout: {
                type: "tip",
                text: "Pensez au temps spécial comme à un compte en banque émotionnel. Chaque minute investie est un dépôt. Quand viendront les moments difficiles (et ils viendront), vous aurez un capital relationnel dans lequel puiser.",
            },
        },
        technique: {
            heading: "La technique",
            body:
                "Le temps spécial est un moment quotidien de 15 à 20 minutes, en tête-à-tête, où le parent suit le jeu ou l'activité choisie par l'enfant. Voici les règles :\n\n" +
                "1. L'enfant choisit l'activité (dessin, Lego, jeu de société, jouer dehors… tout sauf les écrans).\n\n" +
                "2. Le parent ne donne aucune directive. Pas de « Tu devrais mettre le bleu ici » ni de « Et si on faisait plutôt ça ? ». Vous suivez, vous ne dirigez pas.\n\n" +
                "3. Le parent ne pose pas de questions. Les questions (« C'est quoi ? », « Pourquoi tu fais ça ? ») sont en réalité des demandes déguisées. Remplacez-les par des descriptions : « Tu construis une grande tour » au lieu de « Qu'est-ce que tu fais ? ».\n\n" +
                "4. Le parent ne critique pas. Même subtilement. Pas de « Attention, ça va tomber » ni de soupir quand le jeu est répétitif.\n\n" +
                "5. Le parent décrit et valorise. Commentez ce que vous voyez comme un commentateur sportif bienveillant : « Tu as choisi le rouge, tu poses le bloc très soigneusement, tu te concentres vraiment bien ». Cela s'appelle le running commentary.\n\n" +
                "6. Le temps spécial a un créneau fixe. Annoncez-le : « À 18 h, c'est notre moment rien qu'à nous ». La prévisibilité rassure l'enfant TDAH.\n\n" +
                "7. Le temps spécial n'est jamais retiré. Même après la pire journée. C'est non-négociable. Si l'enfant a eu un comportement difficile, vous pouvez appliquer une conséquence appropriée — mais jamais supprimer ce moment.\n\n" +
                "Les premières séances peuvent être maladroites. Vous allez avoir envie de poser des questions, de corriger, de diriger. C'est normal. Observez ces réflexes sans vous juger. Avec la pratique, le silence actif deviendra naturel.",
            callout: {
                type: "example",
                text: "Phrases utiles pendant le temps spécial : « Oh, tu utilises toutes les couleurs ! », « Tu as trouvé une solution pour empiler ça, bravo », « J'aime bien être là avec toi », « Tu te concentres vraiment bien sur ton dessin ».",
            },
        },
        scenarios: [
            {
                title: "Le temps spécial après une mauvaise journée",
                body:
                    "Jeudi soir, Yanis, 7 ans, a eu trois mots dans son carnet de liaison. Sa mère est fatiguée et découragée. Elle hésite à annuler le temps spécial. « Tu ne mérites pas qu'on joue ensemble ce soir ».\n\n" +
                    "Elle choisit pourtant de le maintenir. Pendant quinze minutes, Yanis lui montre son dernier dessin de dinosaure. Elle décrit : « Tu as fait des écailles sur tout le dos, et là il y a un volcan avec de la lave orange ». Yanis sourit pour la première fois de la soirée. Au coucher, il chuchote : « Maman, merci pour le moment dinosaure ».\n\n" +
                    "Pourquoi ça marche : en maintenant le temps spécial malgré la mauvaise journée, la mère envoie un message puissant — « Je t'aime même quand c'est difficile ». C'est exactement ce dont un enfant TDAH a besoin après une journée d'échecs.",
            },
            {
                title: "Se reconnecter après un conflit",
                body:
                    "Samedi matin, Léa, 9 ans, a crié sur son père parce qu'il a éteint la télévision. Le père a réagi fermement et Léa a boudé dans sa chambre pendant une heure. L'ambiance est tendue.\n\n" +
                    "À 16 h, le père frappe à la porte : « C'est l'heure de notre moment ensemble, tu veux qu'on fasse quoi ? ». Léa hésite, puis sort son jeu de cartes. Pendant vingt minutes, ils jouent en silence, puis Léa commence à raconter sa journée. Le père écoute, décrit, ne juge pas.\n\n" +
                    "Pourquoi ça marche : le temps spécial devient un pont de reconnexion. Le père ne revient pas sur le conflit du matin. Il n'exige pas d'excuses pendant ce moment. Le conflit sera traité à un autre moment, par un autre canal. Le temps spécial reste un espace protégé.",
            },
            {
                title: "L'enfant refuse le temps spécial",
                body:
                    "Les premiers jours, Noah, 11 ans, lève les yeux au ciel : « C'est nul ton truc, je suis plus un bébé ». Sa mère se sent blessée et se demande si ça vaut le coup.\n\n" +
                    "Elle persévère avec légèreté : « OK, je serai dans le salon à 18 h. Si tu veux me montrer un truc ou juste traîner ensemble, je suis là ». Au troisième jour, Noah vient s'asseoir à côté d'elle et lui montre une vidéo sur son téléphone. Elle résiste à l'envie de critiquer le contenu et dit : « Ah, c'est comme ça que ça marche ? Montre-moi ». La semaine suivante, c'est Noah qui rappelle l'heure du temps spécial.\n\n" +
                    "Pourquoi ça marche : avec les préadolescents, il faut adapter le format. L'important n'est pas l'activité, c'est la présence sans jugement. Proposer sans imposer, être disponible sans forcer — ce sont aussi des formes de temps spécial.",
            },
        ],
        keyTakeaways: [
            "Les enfants TDAH reçoivent en moyenne beaucoup plus de remarques négatives que positives — le temps spécial rééquilibre la balance.",
            "Le temps spécial dure 15-20 minutes par jour : pas de directives, pas de questions, pas de critiques, on décrit et on valorise.",
            "Ce moment n'est jamais supprimé, même après un comportement difficile — c'est un socle relationnel inconditionnel.",
            "Avec les préadolescents, adaptez le format : proposer sans imposer, être disponible sans forcer.",
        ],
        practiceExercise:
            "Chaque jour cette semaine, pratiquez le temps spécial pendant 15 à 20 minutes. Choisissez un créneau fixe et annoncez-le à votre enfant. Après chaque séance, notez dans l'application : (1) l'activité choisie par votre enfant, (2) combien de fois vous avez eu envie de diriger, questionner ou corriger, (3) une chose positive que vous avez observée chez votre enfant pendant ce moment. En fin de semaine, relisez vos notes : voyez-vous une évolution dans votre capacité à « lâcher le contrôle » ?",
    },
    3: {
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
    },
    4: {
        stepNumber: 4,
        title: "Apprendre à ne pas interrompre",
        intro:
            "Votre enfant vous interrompt dès que vous décrochez le téléphone ou que vous parlez avec un autre adulte ? Ce comportement, très fréquent chez les enfants présentant un TDAH, n'est pas de la provocation : c'est une difficulté réelle à gérer l'attente et la frustration. L'impulsivité rend le « attends deux minutes » presque impossible sans entraînement. La bonne nouvelle, c'est que la patience s'apprend — à condition de procéder par petites étapes, avec beaucoup de renforcement positif. Dans cette étape, vous allez découvrir comment aider votre enfant à tolérer progressivement des moments où vous n'êtes pas disponible, en commençant par de très courtes durées et en augmentant petit à petit.",
        understand: {
            heading: "Pourquoi votre enfant interrompt-il sans cesse ?",
            body: "Chez l'enfant avec un TDAH, le cortex préfrontal — la zone du cerveau responsable du contrôle des impulsions et de la planification — est encore immature. Quand une pensée ou un besoin surgit, l'enfant ressent une urgence intérieure qui le pousse à agir immédiatement. Attendre, c'est comme lui demander de retenir sa respiration : c'est possible quelques secondes, mais très vite, le besoin de « lâcher » devient irrésistible. De plus, l'enfant n'a souvent aucune notion fiable du temps qui passe. Deux minutes peuvent lui sembler une éternité. Il ne cherche pas à vous embêter : il manque simplement d'outils internes pour gérer ce délai. C'est pourquoi nous allons lui fournir des outils externes — une activité occupation, un signal visuel, et surtout des encouragements fréquents — pour l'aider à construire progressivement cette compétence.",
            callout: {
                type: "tip",
                text: "Commencez par des durées très courtes (2-3 minutes) et augmentez de 1 à 2 minutes par semaine. Mieux vaut un succès de 2 minutes qu'un échec de 10 minutes.",
            },
        },
        technique: {
            heading: "La méthode pas à pas : occuper, signaler, renforcer",
            body: "Avant de commencer une activité où vous serez indisponible (appel téléphonique, préparation du repas, conversation), préparez votre enfant en trois temps. D'abord, donnez-lui une activité qu'il aime — coloriage, construction, jeu calme — et installez-le confortablement. Ensuite, expliquez clairement : « Je vais téléphoner pendant quelques minutes. Tu fais ton dessin, et quand j'ai fini, on jouera ensemble. » Utilisez un signal visuel simple : un geste de la main, un pouce levé, ou un petit carton de couleur posé sur la table pour indiquer « je suis occupé(e) ». Pendant votre activité, tournez-vous régulièrement vers votre enfant (toutes les 1-2 minutes au début) pour lui adresser un sourire, un pouce levé ou un murmure : « Tu joues super bien, bravo ! » Ce renforcement fréquent est essentiel : il montre à l'enfant que vous le voyez, même quand vous êtes occupé(e). Dès que vous avez terminé, félicitez-le chaleureusement : « Tu as attendu tout le temps de mon appel, je suis vraiment fier(e) de toi ! » Si l'enfant interrompt malgré tout, restez neutre : rappelez le signal, redirigez-le vers son activité, et raccourcissez la durée la prochaine fois. Ne grondez pas — ajustez.",
            callout: {
                type: "warning",
                text: "Ne lancez jamais cette technique pour la première fois lors d'un appel important. Entraînez-vous d'abord avec un faux appel ou une conversation brève et peu stressante.",
            },
        },
        scenarios: [
            {
                title: "L'appel téléphonique",
                body: "Maman doit appeler le médecin. Avant de composer le numéro, elle installe Léo (7 ans) à la table avec ses feutres et un cahier de dessin : « Je téléphone au docteur, ça va durer 3 minutes. Tu dessines un dinosaure et tu me le montres quand j'ai fini ? » Pendant l'appel, elle pose la main sur l'épaule de Léo en passant devant lui et lui fait un clin d'œil. Léo commence à se lever après 2 minutes. Elle lui montre deux doigts levés (encore 2 minutes) et murmure « presque fini ». À la fin de l'appel, elle s'exclame : « Wahou, tu as attendu tout seul ! Montre-moi ce dinosaure ! » Léo rayonne. La semaine suivante, elle prolonge à 5 minutes.",
            },
            {
                title: "La préparation du dîner",
                body: "Papa prépare le repas et sait que Théa (6 ans) va venir le solliciter toutes les 30 secondes. Il lui propose un défi : « Tu vas construire la plus haute tour de Kapla possible pendant que je cuisine. Chaque fois que je regarde et que tu construis, tu gagnes un point ! » Toutes les 2 minutes, il se retourne et dit : « Un point ! Ta tour est géniale ! » Au bout de 8 minutes, Théa a accumulé 4 points et sa tour fait 12 étages. Papa prend une photo de la tour et la montre à Maman au dîner. Théa est fière. Le lendemain, elle réclame elle-même le défi de la tour.",
            },
            {
                title: "La discussion avec un autre adulte",
                body: "Les parents de Noé (8 ans) sont en visite chez des amis. Habituellement, Noé interrompt toutes les 30 secondes. Cette fois, Maman a préparé un petit sac d'activités (carnet, crayon, figurine). Avant d'entamer la conversation, elle dit à Noé : « On discute avec Marc et Sophie. Tu as ton sac d'activités. Si tu joues tranquillement, on ira au parc en partant. » Toutes les 3 minutes, Papa lance un regard à Noé et lui fait un pouce levé discret. Noé tient 12 minutes — un record. En partant, les parents tiennent leur promesse et s'arrêtent au parc. Noé associe désormais les visites à quelque chose de positif.",
            },
        ],
        keyTakeaways: [
            "Préparez toujours une activité occupation AVANT de devenir indisponible.",
            "Commencez par 2-3 minutes et augmentez progressivement d'une semaine à l'autre.",
            "Renforcez fréquemment pendant l'attente : un regard, un sourire, un mot suffit.",
            "Si l'enfant échoue, raccourcissez la durée au lieu de punir — il a besoin de réussir pour progresser.",
            "Félicitez chaleureusement chaque réussite, même partielle.",
        ],
        practiceExercise:
            "Cette semaine, choisissez un moment quotidien où vous êtes brièvement indisponible (appel, préparation du repas). Avant de commencer, installez votre enfant avec une activité agréable et expliquez-lui ce que vous allez faire. Fixez un objectif de 3 minutes. Pendant ces 3 minutes, renforcez au moins deux fois (regard, sourire, mot). À la fin, félicitez votre enfant. Notez dans votre journal combien de temps il a tenu et comment il a réagi. La semaine prochaine, ajoutez 1 à 2 minutes.",
    },
    5: {
        stepNumber: 5,
        title: "Le système de jetons",
        intro:
            "Les enfants présentant un TDAH ont besoin de récompenses fréquentes et immédiates pour maintenir leur motivation. Le système de jetons — ou économie de jetons — est l'un des outils les plus efficaces de la psychoéducation parentale. Le principe est simple : votre enfant gagne des points (jetons, autocollants, étoiles) pour des comportements positifs précis, et peut les échanger contre des récompenses choisies ensemble. Ce système fonctionne parce qu'il rend visible et concret ce qui est habituellement abstrait : l'effort et le progrès. Dans cette étape, vous apprendrez à mettre en place ce système étape par étape, en évitant les pièges les plus courants.",
        understand: {
            heading: "Pourquoi un système de jetons fonctionne-t-il ?",
            body: "Le cerveau d'un enfant avec TDAH fonctionne avec un système de récompense atypique : la dopamine, le neurotransmetteur de la motivation, est moins disponible dans certaines zones clés. Résultat : les récompenses lointaines (« si tu es sage toute la semaine ») n'ont presque aucun effet. L'enfant a besoin d'un retour immédiat, visible et tangible pour que son cerveau enregistre le lien entre l'effort et la conséquence positive. Le jeton joue exactement ce rôle : il est donné tout de suite après le comportement souhaité, il est concret (l'enfant le voit, le touche, le compte), et il s'accumule vers une récompense motivante. Contrairement aux punitions, qui génèrent du stress et de l'opposition, les jetons créent un cercle vertueux : plus l'enfant réussit, plus il est motivé à recommencer. Le système de jetons ne remplace pas l'attention positive — il la complète en offrant une structure claire que l'enfant peut comprendre et suivre.",
            callout: {
                type: "tip",
                text: "Commencez avec seulement 2 ou 3 comportements simples et observables. « Ranger ses chaussures en rentrant » est précis. « Être sage » est trop vague et voué à l'échec.",
            },
        },
        technique: {
            heading: "Mettre en place le tableau de jetons",
            body: "Choisissez 2 à 3 comportements positifs que vous souhaitez renforcer. Ils doivent être observables (« mettre son assiette dans l'évier après le repas »), réalistes (l'enfant en est déjà capable au moins une fois sur deux), et formulés positivement (« parler doucement » plutôt que « ne pas crier »). Créez ensemble un tableau visible — sur le frigo, dans la chambre — avec les comportements listés et des cases pour coller des autocollants ou poser des jetons. Impliquez votre enfant dans le choix des récompenses : petites récompenses quotidiennes (15 minutes de jeu supplémentaires, choisir le dessert) et une plus grande récompense hebdomadaire (sortie au parc, film en famille, petit jouet). Fixez un barème clair : par exemple, 1 jeton par comportement réussi, 5 jetons = récompense quotidienne, 20 jetons = récompense hebdomadaire. Quand votre enfant accomplit le comportement ciblé, donnez le jeton immédiatement, avec un commentaire positif : « Tu as rangé tes chaussures sans que je te le demande, bravo ! Voilà ton jeton. » Règle absolue : ne retirez JAMAIS un jeton déjà gagné. Un jeton acquis reste acquis. Si l'enfant a un mauvais comportement, ne touchez pas au tableau — utilisez d'autres conséquences (étape 6). Retirer des jetons détruit la confiance dans le système et décourage l'enfant.",
            callout: {
                type: "warning",
                text: "Ne retirez JAMAIS un jeton déjà gagné, même en cas de mauvais comportement. La perte de jetons détruit la motivation et la confiance dans le système. D'autres conséquences existent pour les comportements négatifs.",
            },
        },
        scenarios: [
            {
                title: "Le premier jour avec le tableau",
                body: "Samedi matin, Maman installe le tableau de jetons avec Inès (7 ans). Elles choisissent ensemble 3 comportements : se brosser les dents sans rappel, mettre ses vêtements sales dans le panier, et dire « s'il te plaît » à table. Inès colle elle-même les images sur le tableau et choisit ses récompenses : 5 étoiles = 20 minutes de tablette, 25 étoiles = sortie à la piscine. Le premier jour, Inès court se brosser les dents avant même qu'on le lui demande. Maman lui donne immédiatement une étoile avec un grand sourire : « Première étoile ! Tu as commencé fort ! » À la fin de la journée, Inès a 4 étoiles et les contemple avec fierté. Le système est lancé.",
            },
            {
                title: "L'enfant perd l'intérêt après une semaine",
                body: "Après 8 jours, Lucas (8 ans) semble se désintéresser du tableau. Papa remarque que les récompenses ne le motivent plus. Au lieu d'abandonner, il s'assoit avec Lucas : « Qu'est-ce qui te ferait plaisir comme récompense cette semaine ? » Lucas propose une soirée crêpes en famille. Papa ajoute cette option au tableau et change l'un des comportements par un nouveau défi que Lucas propose lui-même : « Préparer mon cartable le soir. » Le lendemain, Lucas gagne 3 jetons et retrouve sa motivation. La leçon : le système doit évoluer régulièrement. Changez les récompenses toutes les 2-3 semaines et laissez l'enfant proposer de nouveaux défis.",
            },
            {
                title: "La jalousie du frère ou de la sœur",
                body: "Quand Samir (6 ans, TDAH) commence à accumuler des étoiles, sa grande sœur Lina (9 ans) se plaint : « C'est pas juste, moi aussi je range mes affaires et j'ai rien ! » Les parents avaient anticipé cette réaction. Papa explique à Lina : « Samir a besoin d'un coup de pouce en plus pour apprendre certaines choses, comme toi tu avais besoin de lunettes pour bien voir au tableau. » Pour apaiser la situation, ils proposent à Lina un mini-défi personnel avec sa propre récompense : lire 3 chapitres de son livre = choisir le film du dimanche. Lina est satisfaite. Chaque enfant a son système adapté à ses besoins, et la comparaison cesse naturellement.",
            },
        ],
        keyTakeaways: [
            "Choisissez 2-3 comportements observables, réalistes et formulés positivement.",
            "Donnez le jeton immédiatement après le comportement — le délai tue l'efficacité.",
            "Ne retirez JAMAIS un jeton déjà gagné, quoi qu'il arrive.",
            "Mélangez petites récompenses quotidiennes et grande récompense hebdomadaire.",
            "Faites évoluer les récompenses et les défis toutes les 2-3 semaines pour maintenir la motivation.",
        ],
        practiceExercise:
            "Ce week-end, créez le tableau de jetons avec votre enfant. Laissez-le choisir les couleurs, les autocollants et au moins une récompense. Sélectionnez ensemble 2 comportements simples qu'il réussit déjà parfois. Pendant la première semaine, concentrez-vous uniquement sur le renforcement : donnez les jetons immédiatement et avec enthousiasme. Ne retirez aucun jeton. À la fin de la semaine, faites le compte ensemble et célébrez les progrès. Notez dans votre journal combien de jetons ont été gagnés chaque jour et quelles récompenses ont été échangées.",
    },
    6: {
        stepNumber: 6,
        title: "Le retrait de privilèges",
        intro:
            "Dans les étapes précédentes, vous avez appris à renforcer les comportements positifs avec de l'attention, du temps spécial et des jetons. Mais que faire quand un comportement inacceptable se produit malgré tout ? Le retrait de privilèges — aussi appelé « coût de la réponse » — est une conséquence logique et proportionnée qui aide l'enfant à comprendre le lien entre ses actes et leurs conséquences. Contrairement à la punition arbitraire, le retrait de privilèges est annoncé à l'avance, limité dans le temps et appliqué calmement. C'est un outil éducatif, pas une vengeance. Utilisé correctement, il complète le système de jetons sans le remplacer : on continue de récompenser le positif tout en posant des limites claires sur l'inacceptable.",
        understand: {
            heading: "Pourquoi le retrait de privilèges plutôt que la punition classique ?",
            body: "Les enfants avec un TDAH reçoivent en moyenne trois fois plus de remarques négatives que les autres enfants. Les punitions fréquentes, longues ou disproportionnées — « tu es privé de télé pendant un mois » — ne fonctionnent pas avec ces enfants. Pourquoi ? Parce que leur mémoire de travail limitée rend les conséquences lointaines abstraites et inefficaces. Après deux jours, l'enfant a oublié pourquoi il est puni, et la punition devient une source de rancœur plutôt qu'un apprentissage. Le retrait de privilèges fonctionne différemment : il est court (quelques heures, jamais plus d'une journée), spécifique (un privilège précis, pas « tout »), proportionné au comportement, et surtout annoncé à l'avance. L'enfant sait exactement ce qui se passera s'il franchit la limite. Cette prévisibilité réduit l'anxiété et les crises, car l'enfant n'est pas pris au dépourvu. Un point essentiel : les deux parents doivent appliquer les mêmes conséquences de la même manière. Si Papa laisse passer ce que Maman sanctionne, l'enfant est perdu et teste constamment les limites.",
            callout: {
                type: "example",
                text: "Comparez : « Tu es puni, va dans ta chambre ! » (vague, émotionnel) vs « Tu as tapé ta sœur, tu perds 30 minutes de tablette comme on l'avait dit » (précis, calme, annoncé à l'avance). La deuxième approche enseigne, la première frustre.",
            },
        },
        technique: {
            heading: "Appliquer le retrait de privilèges en 4 temps",
            body: "Premièrement, définissez à l'avance les règles et les conséquences. Choisissez 2 ou 3 comportements inacceptables prioritaires (frapper, casser volontairement, refuser catégoriquement une consigne après 2 rappels). Pour chacun, déterminez un privilège spécifique qui sera retiré et la durée du retrait. Annoncez ces règles à l'enfant dans un moment calme, pas en pleine crise : « À partir de maintenant, si tu tapes quelqu'un, tu perds 30 minutes de tablette. » Deuxièmement, quand le comportement se produit, restez calme. Nommez le comportement et la conséquence d'une voix neutre : « Tu as tapé ta sœur. Tu perds 30 minutes de tablette. » Pas de sermon, pas de « je te l'avais dit », pas de discussion. Troisièmement, appliquez la conséquence immédiatement et tenez-la. Si l'enfant proteste ou négocie, répétez une seule fois calmement et passez à autre chose. Ne relancez pas le débat. Quatrièmement, une fois le retrait terminé, on tourne la page. Pas de rappel culpabilisant, pas de « j'espère que tu as compris ». L'ardoise est effacée. Accueillez l'enfant avec chaleur et cherchez la première occasion de le féliciter pour un comportement positif. L'objectif reste toujours de renforcer le positif bien plus souvent qu'on ne soustrait un privilège.",
            callout: {
                type: "warning",
                text: "Ne retirez jamais un privilège sous le coup de la colère et ne changez jamais la durée en cours de route. Un retrait de 30 minutes reste 30 minutes, même si l'enfant vous provoque. Votre constance est son repère.",
            },
        },
        scenarios: [
            {
                title: "Le vélo non rangé",
                body: "Les parents d'Éva (8 ans) ont établi une règle : le vélo doit être rangé dans le garage après utilisation, sinon Éva perd le droit de l'utiliser le lendemain. Mardi soir, le vélo est resté dans l'allée. Papa dit calmement : « Éva, ton vélo est resté dehors. Comme on en avait parlé, tu ne pourras pas le prendre demain. » Éva proteste : « C'est pas juste, j'ai oublié ! » Papa répond une seule fois : « Je comprends, c'est frustrant. La règle s'applique quand même. Tu pourras le reprendre jeudi. » Le lendemain, Éva est contrariée mais accepte. Jeudi, elle rentre son vélo en premier. Papa la félicite immédiatement : « Tu as rangé ton vélo tout de suite, super ! » La leçon, c'est la constance et le retour rapide au positif.",
            },
            {
                title: "Le refus de faire les devoirs",
                body: "Depuis deux semaines, Axel (9 ans) refuse systématiquement de commencer ses devoirs. Les parents ont prévenu : si les devoirs ne sont pas commencés avant 17h30, le temps d'écran du soir est supprimé. Mercredi, 17h35, Axel n'a pas ouvert son cahier. Maman dit sans hausser le ton : « Il est 17h35, les devoirs ne sont pas commencés. Il n'y aura pas d'écran ce soir. » Axel explose : « C'est nul ! Je déteste les devoirs ! » Maman reste calme : « Je comprends que tu sois en colère. La règle est la même pour tout le monde. On peut commencer les devoirs maintenant si tu veux. » Axel boude 10 minutes, puis s'installe. Les devoirs durent 20 minutes. Maman le félicite : « Tu as bien travaillé, même si c'était difficile de s'y mettre. » Le lendemain, Axel s'installe à 17h15. Maman souligne ce progrès avec enthousiasme.",
            },
            {
                title: "Taper sa sœur",
                body: "Nolan (7 ans) pousse sa petite sœur qui tombe et pleure. La règle est claire depuis le début de la semaine : toute violence physique entraîne la perte de 30 minutes de temps de jeu. Papa intervient immédiatement. Il vérifie d'abord que la petite sœur va bien, puis se tourne vers Nolan : « Tu as poussé ta sœur et elle est tombée. Tu perds 30 minutes de jeu, comme on l'avait dit. » Nolan crie que sa sœur l'avait embêté. Papa ne débat pas : « On parlera de ce qui s'est passé tout à l'heure. Pour l'instant, la conséquence, c'est 30 minutes sans jeu. » Après les 30 minutes, Papa vient vers Nolan sans rancune : « C'est terminé. Si ta sœur t'embête, viens me voir au lieu de pousser, d'accord ? » Puis il organise un jeu ensemble pour repartir sur une note positive. Le message est clair : la violence a une conséquence, mais la relation reste intacte.",
            },
        ],
        keyTakeaways: [
            "Annoncez toujours les règles et conséquences à l'avance, dans un moment calme.",
            "Le retrait doit être court (30 min à 1 journée maximum), spécifique et proportionné.",
            "Appliquez la conséquence calmement, sans sermon ni négociation, et tenez-la jusqu'au bout.",
            "Les deux parents doivent appliquer les mêmes conséquences de la même façon — la cohérence est fondamentale.",
            "Une fois le retrait terminé, tournez la page et cherchez rapidement une occasion de renforcer un comportement positif.",
        ],
        practiceExercise:
            "Avec votre partenaire (ou seul(e) si vous êtes parent solo), choisissez ensemble 2 comportements inacceptables prioritaires chez votre enfant. Pour chacun, décidez d'un privilège spécifique à retirer et d'une durée précise. Formulez la règle en une phrase claire (« Si tu fais X, tu perds Y pendant Z »). Annoncez ces règles à votre enfant lors d'un moment calme cette semaine. Notez dans votre journal les situations où vous avez appliqué la conséquence : étiez-vous calme ? Avez-vous tenu la durée ? Avez-vous renforcé un comportement positif rapidement après ?",
    },
    7: {
        stepNumber: 7,
        title: "Le temps de pause (time-out)",
        intro:
            "Le temps de pause est l'un des outils les plus connus — et les plus mal compris — de la gestion comportementale. Utilisé correctement, ce n'est ni une punition humiliante ni un isolement : c'est un retrait bref dans un endroit calme et ennuyeux qui permet à l'enfant de retrouver son calme et de couper le cycle d'escalade. L'objectif n'est pas de « faire payer » l'enfant, mais de lui offrir une parenthèse pour que son cerveau émotionnel redescende en pression. Ce chapitre vous apprend à appliquer le temps de pause de manière sûre, respectueuse et efficace.",
        understand: {
            heading: "Pourquoi le temps de pause fonctionne",
            body: "Quand un enfant est en pleine crise ou en opposition active, son système nerveux est en mode « combat ou fuite ». Dans cet état, aucun raisonnement, aucune explication ne peut être traité. Le temps de pause retire l'enfant de la situation stimulante et lui donne un espace neutre pour que son activation physiologique retombe. Ce n'est pas le temps de pause lui-même qui éduque : c'est le retour au calme qu'il permet, suivi de la reprise normale de l'activité. La durée recommandée est courte : environ une à deux minutes par année d'âge de l'enfant (par exemple, 4 à 8 minutes pour un enfant de 4 ans). Le chronomètre ne démarre que lorsque l'enfant est assis et calme. Crier, taper du pied ou se lever remet le compteur à zéro. L'endroit choisi doit être visible, sûr et ennuyeux — une chaise dans le couloir, un coin du salon sans jouets. Jamais une pièce fermée à clé, jamais un endroit sombre ou effrayant.",
            callout: {
                type: "warning",
                text: "Le temps de pause ne doit jamais se dérouler dans un placard, une pièce verrouillée ou un lieu où l'enfant ne peut pas être vu. La sécurité physique et émotionnelle est non négociable.",
            },
        },
        technique: {
            heading: "Comment appliquer le temps de pause",
            body: "Étape 1 : Annoncez calmement la conséquence. « Tu as frappé ta sœur, tu vas au temps de pause. » Pas de négociation, pas de long discours. Étape 2 : Accompagnez l'enfant vers l'endroit désigné. S'il refuse, guidez-le fermement mais sans brutalité. Étape 3 : Démarrez le minuteur uniquement quand l'enfant est assis et silencieux. S'il crie ou se lève, dites simplement : « Le temps commence quand tu es assis calmement. » Étape 4 : Quand le temps est écoulé, annoncez la fin d'un ton neutre. « C'est terminé, tu peux revenir. » Étape 5 : Reprenez l'activité normalement. Pas de sermon, pas de « tu as compris ? », pas de punition supplémentaire. L'enfant a fait son temps de pause, l'incident est clos. Si un bon comportement suit rapidement, félicitez-le : cela renforce le contraste entre le comportement problématique et le comportement souhaité.",
            callout: {
                type: "tip",
                text: "Utilisez un minuteur visuel (sablier, minuteur de cuisine) pour que l'enfant voie le temps s'écouler. Cela réduit l'angoisse de l'attente et les demandes répétées « c'est fini ? ».",
            },
        },
        scenarios: [
            {
                title: "Refus provocateur de ranger",
                body: "Vous avez demandé à Nolan, 5 ans, de ranger ses Lego. Il vous regarde dans les yeux et dit « non ». Vous répétez la consigne une fois. Il croise les bras. Vous appliquez le temps de pause : « Tu as choisi de ne pas obéir, tu vas au temps de pause. » Vous l'accompagnez à la chaise. Il crie pendant deux minutes. Vous attendez sans réagir. Quand il se calme, le minuteur de 5 minutes démarre. À la fin, vous dites simplement : « C'est fini. Maintenant, range tes Lego s'il te plaît. » S'il obéit, vous le félicitez immédiatement.",
            },
            {
                title: "Frapper un autre enfant",
                body: "Au parc, Inès, 4 ans, pousse violemment un enfant qui lui a pris sa pelle. Vous intervenez immédiatement : « On ne frappe pas. Temps de pause. » Vous l'asseyez sur un banc à côté de vous. Elle pleure, puis se calme après une minute. Vous lancez le minuteur de 4 minutes. Pendant ce temps, vous restez à côté sans interagir. À la fin, vous dites : « C'est terminé. Tu peux retourner jouer. Si quelqu'un prend ton jouet, tu viens me voir. » Pas de rappel de la faute, pas de « tu vois ce que ça fait ».",
            },
            {
                title: "Non-compliance répétée",
                body: "Depuis le matin, Sacha, 6 ans, refuse chaque consigne : s'habiller, petit-déjeuner, mettre ses chaussures. À la troisième consigne ignorée, vous appliquez le temps de pause. Après le retour au calme, Sacha coopère pour mettre ses chaussures. Vous saisissez l'occasion : « Merci d'avoir mis tes chaussures, c'est super. » Ce contraste entre la conséquence négative et le renforcement positif immédiat aide l'enfant à comprendre quel comportement est attendu — sans avoir besoin d'un long discours moralisateur.",
            },
        ],
        keyTakeaways: [
            "Le temps de pause est un outil de régulation, pas une punition : il permet au cerveau de l'enfant de redescendre en activation.",
            "Durée courte : 1 à 2 minutes par année d'âge, le chronomètre démarre quand l'enfant est calme et assis.",
            "L'endroit doit être visible, sûr et ennuyeux — jamais un lieu fermé, sombre ou effrayant.",
            "Après le temps de pause, on reprend normalement : pas de sermon, pas de punition supplémentaire.",
            "Félicitez le premier bon comportement qui suit pour renforcer le contraste positif.",
        ],
        practiceExercise:
            "Cette semaine, identifiez un comportement précis qui justifie un temps de pause (frapper, cracher, refus provocateur répété). Préparez l'endroit à l'avance : choisissez une chaise ou un coin calme et ennuyeux. Expliquez la règle à l'enfant à un moment calme : « Si tu frappes, tu iras au temps de pause sur cette chaise. » La prochaine fois que le comportement se produit, appliquez la procédure complète. Notez dans votre journal comment cela s'est passé : durée avant le calme, réaction de l'enfant au retour, votre propre niveau de stress.",
    },
    8: {
        stepNumber: 8,
        title: "Gérer les comportements à l'extérieur",
        intro:
            "Jusqu'ici, vous avez appris à gérer les comportements difficiles à la maison, dans un environnement que vous contrôlez. Mais la vraie vie ne se passe pas qu'entre quatre murs : il y a les courses au supermarché, les repas au restaurant, les visites chez les grands-parents, les sorties scolaires. Ces situations sont souvent les plus redoutées par les parents, car le regard des autres ajoute une pression énorme. Ce chapitre vous donne une méthode simple pour anticiper, encadrer et gérer les comportements de votre enfant en dehors de la maison — sans céder à la honte ni à l'improvisation.",
        understand: {
            heading: "Pourquoi les sorties sont plus difficiles",
            body: "Les environnements extérieurs cumulent tous les facteurs de difficulté pour un enfant avec un TDAH ou des troubles du comportement : stimulations sensorielles intenses (bruit, lumière, foule), rupture de routine, attente prolongée, et moins de structure. Le cerveau de l'enfant est bombardé d'informations et ses capacités d'autorégulation — déjà fragiles — sont mises à rude épreuve. À cela s'ajoute la pression sociale que vous ressentez en tant que parent : le regard désapprobateur d'une dame au supermarché, le soupir du serveur au restaurant, le commentaire de belle-maman. Cette pression vous pousse soit à céder pour avoir la paix (ce qui renforce le comportement indésirable), soit à sur-réagir par embarras. La clé est de préparer la sortie comme on prépare une expédition : avec un plan clair, des règles annoncées à l'avance, et des conséquences prévues.",
            callout: {
                type: "tip",
                text: "Avant de partir, prenez 2 minutes pour énoncer 2-3 règles simples ET la récompense prévue : « Au magasin, tu restes à côté du caddie, tu ne touches pas aux produits, et tu parles doucement. Si tu y arrives, tu pourras choisir un yaourt. »",
            },
        },
        technique: {
            heading: "La méthode « Préparer-Renforcer-Appliquer »",
            body: "Avant la sortie : Choisissez 2 à 3 règles maximum, formulées positivement (« tu marches à côté de moi » plutôt que « ne cours pas partout »). Annoncez clairement la récompense si les règles sont respectées ET la conséquence si elles ne le sont pas. Faites répéter les règles à l'enfant pour vérifier qu'il a compris. Pendant la sortie : Donnez du feedback positif fréquent. Ne vous contentez pas d'attendre la fin pour évaluer. Toutes les 3 à 5 minutes, remarquez à voix haute ce qui va bien : « Tu marches super bien à côté de moi, bravo. » « J'aime comment tu attends patiemment. » Ce flux de renforcement positif maintient la motivation de l'enfant et l'aide à rester sur la bonne trajectoire. Si le comportement dérape : Appliquez la conséquence prévue calmement, même en public. Si vous aviez annoncé que vous quitteriez le magasin en cas de crise, faites-le. Oui, c'est gênant. Oui, vous abandonnerez peut-être un caddie plein. Mais tenir parole une fois vous évitera des dizaines de crises futures. L'enfant apprend que les règles s'appliquent partout, pas seulement à la maison.",
            callout: {
                type: "example",
                text: "« Avant d'entrer chez mamie, rappelle-moi les règles ? — On dit bonjour, on ne saute pas sur le canapé, on demande avant de prendre quelque chose. — Parfait ! Et si tu y arrives pendant toute la visite, on s'arrêtera au parc sur le chemin du retour. »",
            },
        },
        scenarios: [
            {
                title: "Crise au supermarché",
                body: "Léa, 5 ans, veut un paquet de bonbons. Vous avez dit non. Elle se jette au sol en hurlant. Les gens vous regardent. Vous vous accroupissez calmement : « Je comprends que tu es déçue. La règle est la règle. Si tu te relèves et que tu m'aides à trouver les pommes, tu pourras choisir ton yaourt comme prévu. » Si Léa continue, vous appliquez le plan B : vous quittez le rayon avec elle, vous attendez dans un coin calme du magasin qu'elle se calme. Pas de bonbons, pas de yaourt non plus. La prochaine fois, Léa saura que la conséquence est réelle — et les prochaines courses se passeront mieux.",
            },
            {
                title: "Agitation au restaurant",
                body: "Vous êtes au restaurant avec Adam, 6 ans. Après 10 minutes, il gigote, monte sur la banquette, parle fort. Avant de venir, vous aviez prévu : un petit sac d'activités (carnet, crayons), des règles claires (« on reste assis, on parle doucement »), et une récompense (« dessert si les règles sont respectées »). Vous commencez par le positif : « Adam, tu as très bien commandé tout seul, bravo ! » Puis vous redirigez : « Tiens, tu veux dessiner en attendant le plat ? » Si l'agitation persiste malgré les rappels, vous appliquez calmement : « Si tu ne restes pas assis, on devra partir sans dessert. » Soyez prêt à partir si nécessaire.",
            },
            {
                title: "Visite chez les grands-parents",
                body: "Chez mamie Colette, les règles sont différentes : tout est permis, les bonbons coulent à flot, et mamie sape votre autorité d'un « laisse-le, il est petit ». Avant la visite, prenez un moment seul avec les grands-parents pour expliquer votre démarche : « Nous travaillons sur des règles claires avec Hugo. Voici ce qu'on lui demande. Ça nous aiderait beaucoup que vous suiviez le même cadre pendant la visite. » Pendant la visite, appliquez les mêmes principes : feedback positif fréquent, conséquences calmes si nécessaire. Si mamie résiste, restez ferme mais diplomate. L'objectif est la cohérence pour l'enfant.",
            },
        ],
        keyTakeaways: [
            "Préparez chaque sortie avec 2-3 règles simples, une récompense ET une conséquence annoncées à l'avance.",
            "Donnez du feedback positif toutes les 3 à 5 minutes pendant la sortie — n'attendez pas la fin pour féliciter.",
            "Tenez parole sur les conséquences même en public : une fois suffit pour établir la crédibilité des règles.",
            "Généralisez les stratégies à tous les environnements : grands-parents, école, activités extrascolaires.",
            "Le regard des autres n'est pas votre problème — la cohérence éducative de votre enfant, si.",
        ],
        practiceExercise:
            "Choisissez une sortie prévue cette semaine (courses, visite familiale, restaurant). Avant de partir, asseyez-vous avec votre enfant et établissez ensemble 2-3 règles et la récompense associée. Pendant la sortie, mettez une alarme discrète sur votre téléphone toutes les 5 minutes pour vous rappeler de donner un feedback positif. Après la sortie, notez dans votre journal : les règles ont-elles été respectées ? Avez-vous réussi à donner du renforcement positif régulier ? Si une conséquence a été nécessaire, l'avez-vous appliquée ?",
    },
    9: {
        stepNumber: 9,
        title: "Gérer les problèmes futurs",
        intro:
            "Vous disposez maintenant d'une boîte à outils complète : attention positive, consignes efficaces, systèmes de récompenses, temps de pause, gestion des sorties. Mais la parentalité n'est pas un problème qu'on résout une fois pour toutes. Votre enfant grandit, change, et de nouveaux défis apparaîtront : mensonges, conflits fraternels, transitions scolaires, amitiés compliquées. Ce chapitre vous apprend à utiliser une méthode d'analyse systématique — l'analyse ABC — pour décoder n'importe quel nouveau comportement et y répondre avec les outils que vous maîtrisez déjà. L'objectif est de devenir votre propre expert.",
        understand: {
            heading: "L'analyse ABC : décoder le comportement",
            body: "L'analyse ABC (Antécédent — Comportement — Conséquence) est un outil fondamental en psychologie comportementale. Pour chaque comportement problématique, posez-vous trois questions. Antécédent : que s'est-il passé juste avant ? Quel était le contexte, l'heure, l'état émotionnel de l'enfant, la demande formulée ? Comportement : que s'est-il passé exactement ? Décrivez les faits observables, pas votre interprétation. « Il a crié et lancé son cahier » plutôt que « il a fait une crise de nerfs ». Conséquence : que s'est-il passé après ? Comment avez-vous réagi ? Le comportement a-t-il permis à l'enfant d'obtenir quelque chose (attention, évitement d'une tâche, objet désiré) ? Cette analyse révèle la fonction du comportement. Un enfant qui ment pour éviter une punition n'a pas le même besoin qu'un enfant qui ment pour attirer l'attention. La réponse sera donc différente. En identifiant le « pourquoi » caché derrière le comportement, vous choisissez l'outil le plus adapté dans votre boîte à outils.",
            callout: {
                type: "tip",
                text: "Tenez un mini-journal ABC pendant une semaine sur un comportement précis. Trois colonnes : Avant / Comportement / Après. Les patterns apparaissent souvent dès le troisième ou quatrième épisode.",
            },
        },
        technique: {
            heading: "Anticiper plutôt que réagir",
            body: "La plupart des crises ne tombent pas du ciel. Elles suivent des schémas prévisibles : fatigue, faim, transitions, frustration liée à une tâche difficile. Une fois que vous avez identifié le pattern grâce à l'analyse ABC, vous pouvez intervenir en amont. Modifiez l'antécédent : si les devoirs déclenchent systématiquement une crise à 18h quand l'enfant est épuisé, essayez de les déplacer juste après le goûter. Renforcez le comportement alternatif : si l'enfant ment pour éviter la punition, assurez-vous que dire la vérité est moins coûteux que mentir. « Merci de m'avoir dit la vérité, c'est courageux. La conséquence sera plus légère. » Préparez l'enfant aux transitions : les changements sont difficiles pour les enfants avec un TDAH. Cinq minutes avant la fin d'une activité agréable, prévenez : « Dans 5 minutes, on éteint la tablette. » Puis à 2 minutes. Puis à 1 minute. Chaque nouveau défi est une occasion de réutiliser vos outils dans une nouvelle combinaison. Vous n'avez pas besoin d'une nouvelle méthode à chaque problème : vous avez besoin d'appliquer la bonne méthode au bon moment.",
            callout: {
                type: "example",
                text: "Analyse ABC d'un mensonge : Antécédent → vous demandez « qui a renversé le verre ? » sur un ton sévère. Comportement → l'enfant dit « c'est pas moi ». Conséquence → vous vous énervez davantage. Solution : changez l'antécédent en adoptant un ton neutre et en valorisant la vérité.",
            },
        },
        scenarios: [
            {
                title: "L'enfant commence à mentir",
                body: "Maël, 7 ans, nie systématiquement ses bêtises. Votre analyse ABC révèle un pattern : quand vous découvrez une bêtise et posez la question sur un ton accusateur, Maël ment. Quand il dit la vérité, la punition est la même que quand il ment. Il n'a donc aucun intérêt à être honnête. Vous changez d'approche : vous adoptez un ton neutre quand vous posez la question, et vous différenciez clairement les conséquences. « Tu as renversé le jus. Merci de me l'avoir dit. Prends l'éponge et nettoie, s'il te plaît. » Versus : « Tu as menti sur le jus. Tu nettoies ET tu perds 5 minutes de tablette. » En quelques semaines, Maël ment beaucoup moins — parce que la vérité est devenue moins coûteuse.",
            },
            {
                title: "Transition vers une nouvelle année scolaire",
                body: "Septembre approche et Jade, 8 ans, est de plus en plus anxieuse : clignements d'yeux, difficulté d'endormissement, opposition croissante. Vous anticipez en appliquant les outils connus. Vous reprenez des routines scolaires une semaine avant la rentrée (coucher plus tôt, réveil progressif). Vous visitez l'école ensemble pour réduire l'inconnu. Vous instaurez un tableau de récompenses spécial rentrée avec des objectifs simples : préparer son cartable le soir, se lever sans crier. Vous maintenez l'attention positive intense : « Tu as super bien préparé tes affaires, je suis fier de toi. » L'anticipation transforme une période de crise en une transition gérable.",
            },
            {
                title: "Conflits fraternels qui s'intensifient",
                body: "Depuis quelques semaines, les disputes entre Théo (9 ans) et sa petite sœur Léna (6 ans) dégénèrent systématiquement. Votre analyse ABC montre que les conflits surviennent toujours quand les deux enfants partagent un espace sans activité structurée, et que Théo reçoit de l'attention (même négative) quand il embête Léna. Vous réorganisez : des plages de jeu séparées alternent avec des activités communes supervisées. Vous renforcez massivement le jeu coopératif : « Vous jouez ensemble depuis 10 minutes sans vous disputer, c'est génial ! Vous gagnez chacun un jeton. » Les conflits ne disparaissent pas mais leur fréquence chute nettement.",
            },
        ],
        keyTakeaways: [
            "L'analyse ABC (Antécédent-Comportement-Conséquence) est votre outil d'investigation pour tout nouveau problème.",
            "La plupart des comportements ont une fonction : obtenir quelque chose ou éviter quelque chose. Identifiez la fonction avant de choisir l'outil.",
            "Anticiper vaut mieux que réagir : modifiez l'antécédent quand c'est possible plutôt que de gérer la crise.",
            "Vous n'avez pas besoin de nouvelles méthodes — vous avez besoin d'appliquer les bonnes méthodes au bon moment.",
        ],
        practiceExercise:
            "Choisissez un comportement récurrent qui vous pose problème en ce moment. Pendant les 5 prochains jours, tenez un mini-journal ABC à chaque occurrence : notez ce qui précède (antécédent), le comportement exact (observable), et ce qui suit (votre réaction et le résultat). À la fin de la semaine, relisez vos notes et cherchez le pattern. Identifiez un antécédent modifiable ou une conséquence à ajuster, puis testez ce changement pendant la semaine suivante.",
    },
    10: {
        stepNumber: 10,
        title: "Bilan et maintien des acquis",
        intro:
            "Vous êtes arrivé à la dernière étape de ce programme. Prenez un moment pour mesurer le chemin parcouru : vous avez appris à observer, à renforcer positivement, à poser des consignes efficaces, à utiliser des systèmes de récompenses, à appliquer le temps de pause, à gérer les sorties et à analyser les comportements nouveaux. Ce n'est pas rien. Mais cette étape n'est pas une fin — c'est un nouveau départ. Les principes que vous avez intégrés vous accompagneront pendant des années, à travers les différentes phases du développement de votre enfant. Ce chapitre vous aide à faire le bilan, identifier ce qui fonctionne le mieux pour votre famille, et maintenir les acquis sur la durée.",
        understand: {
            heading: "Pourquoi le maintien est un défi",
            body: "Les études montrent que les progrès comportementaux obtenus avec les programmes parentaux tendent à s'éroder avec le temps si les parents ne maintiennent pas activement les pratiques apprises. Ce n'est pas un échec : c'est la nature humaine. La vie reprend le dessus, les vieilles habitudes reviennent, le stress quotidien érode la constance. Les périodes de transition sont particulièrement à risque : vacances, déménagement, naissance d'un nouvel enfant, changement d'école. Pendant ces périodes, il est normal d'observer une régression temporaire chez l'enfant — et chez vous. L'important n'est pas de ne jamais rechuter, mais de savoir comment remonter en selle rapidement. Votre enfant grandit, et ses besoins évoluent. Un système de jetons qui fonctionnait à 5 ans semblera infantilisant à 9 ans. Les consignes doivent évoluer avec l'âge. Mais les principes fondamentaux restent les mêmes : attention positive, consignes claires, conséquences prévisibles, anticipation plutôt que réaction.",
            callout: {
                type: "tip",
                text: "Programmez un « bilan parental » mensuel de 15 minutes : relisez votre journal, identifiez ce qui fonctionne et ce qui a glissé, et choisissez un seul point à réajuster pour le mois suivant.",
            },
        },
        technique: {
            heading: "Votre plan de maintien personnalisé",
            body: "Faites le bilan maintenant. Prenez votre journal et répondez honnêtement : quels sont les 2-3 outils que vous utilisez le plus naturellement ? Quels comportements de votre enfant se sont le plus améliorés ? Quels outils avez-vous du mal à appliquer régulièrement ? Quelles situations restent difficiles ? Ce bilan vous donne votre profil personnel. Concentrez-vous sur vos forces : continuez ce qui marche. Et pour les points faibles, ne cherchez pas à tout corriger en même temps — choisissez un seul aspect à travailler chaque mois. Adaptez les outils à l'âge. À mesure que votre enfant grandit, faites-le participer davantage : négociez les règles ensemble, laissez-le choisir ses propres récompenses, impliquez-le dans la résolution de problèmes. Un adolescent coopérera davantage avec un système qu'il a co-construit qu'avec un système imposé. Communiquez avec les autres adultes. Partagez vos stratégies avec l'autre parent, les grands-parents, les enseignants, la nounou, le centre de loisirs. Plus les adultes autour de l'enfant sont cohérents, plus les progrès sont durables. Préparez un résumé simple : les 3 règles principales, comment on renforce, quelle conséquence pour quel comportement. Prenez soin de vous. La parentalité d'un enfant avec des difficultés comportementales est épuisante. Votre propre bien-être n'est pas un luxe, c'est une condition de réussite. Un parent épuisé ne peut pas être constant. Identifiez ce qui vous ressource et protégez ces moments.",
            callout: {
                type: "warning",
                text: "Ne visez pas la perfection. Un parent qui applique les bons principes 70 % du temps obtient d'excellents résultats. Les 30 % restants sont normaux — c'est la vie, pas un échec.",
            },
        },
        scenarios: [
            {
                title: "Régression pendant les vacances d'été",
                body: "Après deux mois de vacances sans structure, Emma, 7 ans, a perdu la plupart de ses bonnes habitudes. Les routines du matin sont un champ de bataille, les crises ont repris. Plutôt que de vous décourager, vous reconnaissez le pattern : absence de routine = régression prévisible. Vous réinstallez le tableau de routines, vous reprenez l'attention positive intense des premiers jours du programme, et vous réintroduisez le système de jetons. En une à deux semaines, les habitudes reviennent. C'est normal : vous ne repartez pas de zéro, vous réactivez des compétences qui étaient en sommeil.",
            },
            {
                title: "Entrée dans l'adolescence",
                body: "Lucas a 11 ans, et les jetons ne l'intéressent plus. Il négocie tout, remet en question chaque règle, veut plus d'autonomie. C'est un développement sain — mais déstabilisant. Vous adaptez vos outils : les récompenses deviennent du temps d'écran, des sorties avec les copains, de l'argent de poche. Les consignes se négocient ensemble lors d'une « réunion familiale » hebdomadaire. Le temps de pause se transforme en « temps de retrait volontaire » que Lucas peut s'accorder lui-même quand il sent qu'il s'énerve. Les principes sont identiques — attention positive, conséquences claires, anticipation — mais la forme évolue avec l'âge.",
            },
            {
                title: "Transmettre les stratégies à un nouveau soignant",
                body: "Votre fille Lina, 6 ans, va chez une nouvelle assistante maternelle trois jours par semaine. Vous préparez un document simple d'une page : les 3 règles principales de Lina, comment la féliciter efficacement, quoi faire en cas de refus (une consigne, un avertissement, un temps de pause de 6 minutes). Vous prenez 15 minutes avec l'assistante maternelle pour expliquer la démarche et répondre à ses questions. Vous lui proposez de noter les comportements positifs et négatifs pour en discuter chaque semaine. Cette cohérence entre les environnements accélère les progrès de Lina et rassure la nouvelle soignante.",
            },
        ],
        keyTakeaways: [
            "Les progrès demandent un maintien actif : programmez un bilan mensuel pour rester sur la bonne trajectoire.",
            "Les régressions sont normales, surtout lors des transitions. Réactivez les outils de base sans culpabiliser.",
            "Adaptez la forme des outils à l'âge de l'enfant, mais gardez les mêmes principes fondamentaux.",
            "Partagez vos stratégies avec tous les adultes impliqués pour garantir la cohérence éducative.",
            "Prenez soin de vous : un parent épuisé ne peut pas être constant, et la constance est la clé.",
        ],
        practiceExercise:
            "Prenez 20 minutes cette semaine pour faire votre bilan complet. Relisez votre journal depuis le début du programme. Notez vos 3 plus grandes victoires et les 2 domaines où vous voulez progresser. Rédigez une « fiche mémo » d'une page résumant les règles, les récompenses et les conséquences qui fonctionnent le mieux pour votre enfant. Partagez cette fiche avec au moins un autre adulte impliqué dans la vie de votre enfant. Enfin, choisissez un seul objectif d'amélioration pour le mois prochain et notez-le clairement.",
    },
};

// ---------------------------------------------------------------------------
// Quizzes
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getStepContent(stepNumber: number): StepContent | undefined {
    return STEPS[stepNumber];
}

export function getAllStepTitles(): { stepNumber: number; title: string }[] {
    return Object.values(STEPS).map((s) => ({
        stepNumber: s.stepNumber,
        title: s.title,
    }));
}

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
