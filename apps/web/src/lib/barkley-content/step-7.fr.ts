import type { StepContent } from "./types";

export const step7Content: StepContent = {
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
};
