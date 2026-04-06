import type { StepContent } from "./types";

export const step1Content: StepContent = {
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
};
