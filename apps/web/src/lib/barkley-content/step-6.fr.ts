import type { StepContent } from "./types";

export const step6Content: StepContent = {
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
};
