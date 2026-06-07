// AUTO-GENERATED from apps/web/src/lib/resources-data.tsx — do not edit by hand.
// Knowledge-base articles ported to portable blocks for in-app native rendering.
export type Block =
  | { type: "h2" | "h3" | "p" | "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "takeaways"; title: string; items: string[] }
  | { type: "stats"; items: { value: string; label: string }[] }
  | { type: "comparison"; helpsTitle: string; hurtsTitle: string; helps: string[]; hurts: string[] }
  | { type: "callout"; variant: "phone" | "encouragement"; title?: string; text: string };
export type KnowledgeArticle = {
  slug: string; title: string; excerpt: string; cluster: string; readTime: string;
  body: Block[]; faq: { q: string; a: string }[];
};
export const knowledgeArticles: KnowledgeArticle[] = [
  {
    "slug": "crise-tdah-enfant-guide-complet",
    "title": "Crise TDAH chez l'enfant : le guide complet",
    "excerpt": "Le guide de référence pour comprendre et traverser les crises TDAH : mécanismes neurologiques, co-régulation, plan d'action avant, pendant et après.",
    "cluster": "Pillar · Connaissance TDAH",
    "readTime": "20 min",
    "body": [
      {
        "type": "p",
        "text": "Il est 19h47. Votre enfant vient de renverser son verre d'eau. Vous dites « ce n'est pas grave », et la crise démarre. Cris, larmes, porte qui claque, insultes. Quarante minutes plus tard, il pleure dans vos bras sans comprendre ce qui s'est passé. Vous non plus."
      },
      {
        "type": "p",
        "text": "Bienvenue dans le quotidien des familles TDAH. Cet article explique ce qui se passe réellement dans le cerveau de votre enfant pendant une crise, pourquoi les stratégies classiques ne marchent pas, et ce qui marche vraiment, en s'appuyant sur les travaux du Dr Russell Barkley et les recherches récentes en neurosciences du développement."
      },
      {
        "type": "takeaways",
        "title": "Ce qu'il faut retenir",
        "items": [
          "Une crise TDAH est neurologique, pas un caprice — son cerveau ne « choisit » pas.",
          "Pendant l'explosion, le raisonnement ne fonctionne pas. C'est votre calme qui apaise le sien.",
          "Identifier les déclencheurs (sommeil, faim, transitions) prévient 80 % des crises.",
          "Vous lisez cet article : c'est déjà une étape immense pour votre enfant."
        ]
      },
      {
        "type": "stats",
        "items": [
          {
            "value": "75 %",
            "label": "des enfants TDAH vivent une dysrégulation émotionnelle"
          },
          {
            "value": "3 ans",
            "label": "de retard moyen du développement du cortex préfrontal"
          },
          {
            "value": "60-70 %",
            "label": "de baisse des crises avec un suivi adapté en 12-18 mois"
          }
        ]
      },
      {
        "type": "h2",
        "text": "Une crise TDAH n'est pas un caprice"
      },
      {
        "type": "p",
        "text": "75 % des enfants TDAH présentent une dysrégulation émotionnelle significative. Ce n'est plus considéré comme un effet secondaire du trouble : c'est une dimension centrale du TDAH, reconnue depuis les travaux récents du Dr Barkley."
      },
      {
        "type": "p",
        "text": "Ce que vous observez comme une crise disproportionnée est en réalité un emballement neurologique : l'amygdale (centre d'alerte du cerveau) s'active trop vite et trop fort, tandis que le cortex préfrontal (la régulation) se développe plus lentement chez l'enfant TDAH. Résultat : le signal « urgence » passe avant que le « frein » puisse s'activer."
      },
      {
        "type": "h2",
        "text": "Les 3 phases d'une crise"
      },
      {
        "type": "h3",
        "text": "1. La montée (2 à 10 minutes)"
      },
      {
        "type": "p",
        "text": "Signes avant-coureurs : accélération du débit verbal, voix qui monte, mâchoire serrée, gestes plus brusques, regard qui fuit ou qui fixe. C'est la seule phase où l'enfant peut encore entendre une voix calme. Agir ici vaut 10× agir plus tard."
      },
      {
        "type": "h3",
        "text": "2. L'explosion (5 à 40 minutes)"
      },
      {
        "type": "p",
        "text": "Le cerveau rationnel est hors ligne. L'enfant ne vous entend pas au sens propre : ses fonctions auditives d'intégration sont submergées. Toute tentative d'explication, de punition, de négociation aggrave la crise."
      },
      {
        "type": "h3",
        "text": "3. La redescente (10 à 30 minutes)"
      },
      {
        "type": "p",
        "text": "Épuisement, culpabilité, parfois amnésie partielle de la crise. C'est le moment du réconfort, pas de la leçon."
      },
      {
        "type": "p",
        "text": "Note : certains enfants ne s'explosent pas, ils se figent. Silence, regard absent, immobilité. Si c'est le profil de votre enfant, lisez l'article dédié à la déconnexion émotionnelle ."
      },
      {
        "type": "h2",
        "text": "Le plan d'action : avant, pendant, après"
      },
      {
        "type": "h3",
        "text": "AVANT : construire le kit anti-crise"
      },
      {
        "type": "ul",
        "items": [
          "Identifier les déclencheurs récurrents (faim, fatigue, transition, bruit, frustration scolaire). Les noter dans un journal pendant 3 semaines révèle 80 % des patterns. Le manque de sommeil en est un particulièrement sournois, lire les troubles du sommeil TDAH .",
          "Co-construire une liste d'activités apaisantes avec l'enfant, hors crise. Objets doux, musique précise, coin refuge, respiration dessinée. Cette liste doit être visible au moment où il en a besoin.",
          "Anticiper les transitions : prévenir 10 puis 5 puis 2 minutes avant un changement d'activité."
        ]
      },
      {
        "type": "h3",
        "text": "PENDANT : co-réguler, ne pas raisonner"
      },
      {
        "type": "ul",
        "items": [
          "Baisser sa propre activation avant toute chose. Respirer 4-7-8, s'asseoir, parler bas. Votre système nerveux calme le sien, c'est la co-régulation .",
          "Réduire les stimuli : lumière tamisée, frères et sœurs à distance, téléphone éteint.",
          "Phrases courtes, voix basse : « Je suis là. » « Je ne pars pas. » « On respire ensemble. » Jamais de questions, jamais de « pourquoi ».",
          "Pas de contact imposé. Proposer, ne pas forcer. Beaucoup d'enfants TDAH sont hypersensibles au toucher en crise."
        ]
      },
      {
        "type": "h3",
        "text": "APRÈS : réparer et apprendre"
      },
      {
        "type": "ul",
        "items": [
          "Réconfort sans jugement d'abord. Hydratation, câlin si accepté, moment calme.",
          "Débrief différé (le lendemain, pas à chaud) : « Tu te souviens de ce qui s'est passé ? Qu'est-ce qui aurait pu aider ? »",
          "Noter la crise : déclencheur, durée, ce qui a marché, ce qui a aggravé. C'est le matériau d'or pour votre RDV pédopsy."
        ]
      },
      {
        "type": "quote",
        "text": "« Pendant des mois, je criais aussi fort que lui. Un soir, je me suis assise par terre au milieu du couloir, j'ai fermé les yeux et j'ai juste respiré. Il m'a regardée, surpris. Au bout de deux minutes, il s'est assis en face de moi. On n'a rien dit. C'est la première crise qu'on a traversée ensemble sans que je me sente nulle après. »"
      },
      {
        "type": "p",
        "text": "Mère d'un garçon de 8 ans, diagnostiqué TDAH mixte"
      },
      {
        "type": "h2",
        "text": "Ce qui aide vs ce qui aggrave"
      },
      {
        "type": "comparison",
        "helpsTitle": "Ce qui aide",
        "hurtsTitle": "Ce qui aggrave",
        "helps": [
          "Respirer avant de parler, baisser sa voix",
          "S'asseoir à sa hauteur, proposer (sans imposer) le contact",
          "Phrases courtes répétées : « Je suis là. »",
          "Réduire les stimuli (lumière, fratrie, écrans)",
          "Réparer après, à froid, sans culpabiliser"
        ],
        "hurts": [
          "Lever la voix ou crier",
          "Menacer (« si tu continues, je… »)",
          "Isoler de force dans sa chambre pendant l'explosion",
          "Argumenter, expliquer, raisonner pendant la crise",
          "Punir à chaud, comparer à un frère ou une sœur"
        ]
      },
      {
        "type": "h2",
        "text": "Quand consulter un professionnel ?"
      },
      {
        "type": "p",
        "text": "Si les crises durent plus de 45 minutes, reviennent plusieurs fois par jour, mettent en danger (auto-agression, violence physique), ou si vous vous sentez épuisé·e au point de perdre vos propres moyens : consultez un pédopsychiatre ou un médecin généraliste. Un tracking écrit de 2-3 semaines accélère drastiquement le diagnostic."
      },
      {
        "type": "h2",
        "text": "Pourquoi tenir un journal change tout"
      },
      {
        "type": "p",
        "text": "Les crises semblent aléatoires quand on les vit. Elles le sont rarement quand on les note. Un simple journal de 2 minutes par soir (date, contexte, intensité, déclencheur supposé) révèle en quelques semaines les patterns invisibles : manque de sommeil du dimanche, retour d'école le jeudi, transitions du lundi matin."
      },
      {
        "type": "p",
        "text": "C'est aussi ce que demandera le pédopsychiatre pour poser ou ajuster un diagnostic. Parent qui arrive avec 3 mois de données = consultation utile. Parent qui arrive avec des souvenirs = consultation qui tourne en rond."
      },
      {
        "type": "h2",
        "text": "Crises à l'école : dialoguer avec l'enseignant"
      },
      {
        "type": "p",
        "text": "Les crises ne s'arrêtent pas à la porte de la maison. Beaucoup d'enfants TDAH explosent à l'école, ou, au contraire, se contiennent toute la journée et craquent le soir à la maison. Dans les deux cas, un dialogue avec l'enseignant est indispensable."
      },
      {
        "type": "h3",
        "text": "Ce que l'enseignant doit savoir"
      },
      {
        "type": "ul",
        "items": [
          "Le TDAH est neurologique, pas éducatif. L'enfant ne « choisit » pas de perturber la classe.",
          "Les transitions sont les moments à risque : changement de matière, récréation, retour en classe. Un signal verbal ou visuel 5 minutes avant aide considérablement.",
          "L'isolement punitif aggrave. Un « coin calme » proposé (pas imposé) avec un objet sensoriel est plus efficace qu'une mise à l'écart humiliante.",
          "Le carnet de liaison n'est pas un outil de punition. Si chaque soir l'enfant rentre avec « comportement inacceptable », le carnet devient une source d'anxiété, pas d'amélioration."
        ]
      },
      {
        "type": "h3",
        "text": "Comment aborder la conversation"
      },
      {
        "type": "p",
        "text": "Demandez un rendez-vous calme (pas sur le pas de la porte à 16h30). Apportez une fiche synthétique : diagnostic, déclencheurs connus, ce qui aide, ce qui aggrave. Proposez un plan concret : « Quand vous voyez [signe de montée], est-ce que [action spécifique] serait possible ? »"
      },
      {
        "type": "callout",
        "variant": "phone",
        "title": "Ce que vous pouvez dire",
        "text": "« Mon fils a un TDAH diagnostiqué. Les crises ne sont pas du mauvais comportement, son cerveau réagit trop vite. Est-ce qu'on pourrait se voir 20 minutes pour mettre en place 2-3 aménagements simples qui aident tout le monde ? »"
      },
      {
        "type": "p",
        "text": "Si l'école refuse tout aménagement, un courrier du pédopsychiatre ou une saisine de la MDPH pour un PAP (Plan d'Accompagnement Personnalisé) peut débloquer la situation."
      },
      {
        "type": "h2",
        "text": "Spécificités selon l'âge de l'enfant"
      },
      {
        "type": "h3",
        "text": "3-6 ans : crises motrices et hypersensibilité"
      },
      {
        "type": "p",
        "text": "À cet âge, les crises prennent souvent une forme très physique : se jeter au sol, taper, se rouler, mordre. Le vocabulaire est limité, l'enfant ne peut pas nommer ce qu'il ressent. Priorité absolue : la sécurité (retirer les objets dangereux, écarter les autres enfants) et la simplicité des phrases (« Je te vois. C'est très fort. Je reste. »)."
      },
      {
        "type": "h3",
        "text": "7-10 ans : crises déclenchées à l'école"
      },
      {
        "type": "p",
        "text": "Les fonctions exécutives sont massivement sollicitées par la scolarité (devoirs, consignes, transitions). Le « crash du retour d'école » est classique : l'enfant a tenu toute la journée, le soir il craque. Prévoir une plage de décompression de 30 minutes avant toute sollicitation (devoirs, questions, transitions) change radicalement la dynamique familiale."
      },
      {
        "type": "h3",
        "text": "11-14 ans : crises identitaires et conflits"
      },
      {
        "type": "p",
        "text": "À l'adolescence, les crises se chargent d'enjeux identitaires : ça ne veut plus seulement dire « je suis submergé·e », ça peut dire « je ne suis pas comme les autres, et je le sais ». Le rôle parental évolue : moins de guidance directive, plus d'écoute active, plus de validation des sentiments (« Je comprends que ce soit injuste pour toi »). Les crises restent neurologiques mais leur contenu devient plus verbal, plus conflictuel."
      },
      {
        "type": "h2",
        "text": "Crises et fratrie : protéger tout le monde"
      },
      {
        "type": "p",
        "text": "Les frères et sœurs non-TDAH sont souvent les grands oubliés de l'équation. Ils assistent aux crises, se sentent parfois menacés, parfois coupables d'exister sans difficulté. Trois règles indispensables :"
      },
      {
        "type": "ul",
        "items": [
          "Pendant la crise : déplacer les frères/sœurs dans une autre pièce, avec une activité calme. Pas de spectateurs.",
          "Après la crise : nommer ce qui s'est passé avec eux, sans diaboliser l'enfant TDAH. « Ton frère a été très en colère, son cerveau a du mal à freiner. Ça n'est pas contre toi. »",
          "En dehors des crises : ménager du temps exclusif pour chaque enfant non-TDAH. 20 minutes seul·e avec un parent, une fois par semaine, change énormément."
        ]
      },
      {
        "type": "h2",
        "text": "L'impact des crises répétées sur le couple parental"
      },
      {
        "type": "p",
        "text": "Les crises TDAH ne touchent pas que l'enfant. Elles usent le couple parental de manière insidieuse. Les désaccords sur « la bonne approche » sont la première source de conflit : l'un veut être ferme, l'autre veut apaiser, et les deux finissent par se reprocher l'échec de l'autre."
      },
      {
        "type": "p",
        "text": "Quelques repères pour protéger votre couple :"
      },
      {
        "type": "ul",
        "items": [
          "Jamais de désaccord éducatif devant l'enfant en crise. On suit la stratégie du parent présent, on débriefe à deux après.",
          "Alternez les rôles. Si c'est toujours le même parent qui gère les crises, l'épuisement et le ressentiment s'installent. « Ce soir c'est toi, demain c'est moi » protège les deux.",
          "Nommez l'usure. Dire « je suis à bout ce soir, prends le relais » n'est pas un aveu de faiblesse, c'est de la co-régulation parentale.",
          "Parlez TDAH à deux, pas en crise. Un créneau hebdomadaire de 15 minutes (« comment on se sent, qu'est-ce qui a marché cette semaine ») suffit à maintenir l'alliance."
        ]
      },
      {
        "type": "quote",
        "text": "« On se disputait tous les soirs sur comment gérer les crises de notre fille. Le pédopsy nous a dit : \"Le problème n'est pas que vous n'êtes pas d'accord, c'est que vous en discutez à chaud devant elle.\" On a instauré un point du dimanche soir, 15 minutes à la table de la cuisine. En trois semaines, nos disputes ont baissé de moitié. Les crises aussi. »"
      },
      {
        "type": "p",
        "text": "Couple de parents, fille de 10 ans TDAH prédominance inattentive"
      },
      {
        "type": "h2",
        "text": "Le plan de crise écrit : votre outil le plus simple"
      },
      {
        "type": "p",
        "text": "Prenez une feuille A4, écrivez à la main, affichez sur le frigo. Trois colonnes :"
      },
      {
        "type": "ol",
        "items": [
          "Signes de montée chez mon enfant (ce qu'il fait, dit, son visage), 3 à 5 signes concrets.",
          "Ce que je fais (mes gestes concrets), respirer, baisser la voix, m'asseoir, proposer l'eau.",
          "Ce que je ne fais plus jamais, crier, menacer, isoler de force, comparer."
        ]
      },
      {
        "type": "p",
        "text": "Relire ce plan une fois par semaine vaut dix conseils généraux. Il vous reconnecte à VOS stratégies, pour VOTRE enfant, sur lesquelles vous avez pris un engagement à froid."
      },
      {
        "type": "p",
        "text": "📄 Télécharger le modèle de plan de crise (PDF gratuit)"
      },
      {
        "type": "h2",
        "text": "Faut-il parler du traitement médicamenteux ?"
      },
      {
        "type": "p",
        "text": "C'est un sujet qui divise les familles, rarement neutre. Quelques repères factuels :"
      },
      {
        "type": "ul",
        "items": [
          "Les psychostimulants (méthylphénidate) sont les médicaments les plus étudiés en pédiatrie, leur rapport bénéfice/risque est documenté depuis 60 ans.",
          "Ils améliorent l'attention et l'impulsivité (donc indirectement réduisent la fréquence des crises), mais n'agissent pas directement sur la dysrégulation émotionnelle.",
          "Ils ne remplacent jamais l'accompagnement comportemental (programme Barkley PEHP, thérapie familiale, aménagements scolaires).",
          "La décision appartient au pédopsychiatre, avec le parent. Un traitement peut être démarré, ajusté, arrêté, ce n'est jamais un engagement à vie décidé dans l'urgence."
        ]
      },
      {
        "type": "p",
        "text": "Le tracking écrit (symptômes, crises, sommeil) est la donnée n°1 que demandera le médecin pour décider. 4 à 8 semaines de notes valent mieux que toute description orale."
      },
      {
        "type": "h2",
        "text": "Quand l'enfant se fait du mal pendant une crise"
      },
      {
        "type": "p",
        "text": "Certains enfants TDAH, particulièrement ceux avec une dysrégulation émotionnelle sévère, présentent des comportements d'auto-agression pendant les crises : se cogner la tête contre un mur, se griffer, se mordre, se tirer les cheveux. C'est terrifiant pour le parent, mais c'est un signal, pas une manipulation."
      },
      {
        "type": "p",
        "text": "Pendant la crise : sécurisez l'environnement (coussin entre la tête et le mur, retirer les objets coupants), restez présent sans contenir physiquement (sauf danger immédiat). Ne dites pas « arrête de te faire du mal », il ne peut pas s'arrêter, et cette phrase ajoute de la culpabilité à la détresse."
      },
      {
        "type": "p",
        "text": "Après la crise : nommez ce que vous avez observé sans dramatiser : « Tu t'es cogné la tête. Je vois que c'était très fort. » Notez la fréquence, l'intensité et le contexte."
      },
      {
        "type": "p",
        "text": "Quand consulter en urgence : si l'auto-agression laisse des marques visibles, se répète quotidiennement, ou si l'enfant exprime verbalement vouloir « disparaître » ou « ne plus être là ». Dans ce cas, contactez votre pédopsychiatre ou le 3114 (numéro national de prévention du suicide, 24h/24)."
      },
      {
        "type": "quote",
        "text": "« La première fois que ma fille s'est cognée la tête contre le mur, j'ai paniqué. J'ai tout arrêté, j'ai pris rendez-vous en urgence chez le pédopsy. Il m'a expliqué que c'était une forme de décharge sensorielle, pas un signe de folie. Depuis, je mets un coussin, je reste à côté, et je note. En trois mois, la fréquence a chuté de 80 %. »"
      },
      {
        "type": "p",
        "text": "Mère d'une fille de 6 ans, TDAH mixte avec dysrégulation émotionnelle"
      },
      {
        "type": "h2",
        "text": "Ressources complémentaires et où se faire aider"
      },
      {
        "type": "ul",
        "items": [
          "HyperSupers – TDAH France : association de parents, groupes locaux, formation PEHP",
          "CMP / CMPP : consultations gratuites (délais longs) avec pédopsychiatre et équipe pluridisciplinaire",
          "Pédopsychiatre libéral : délais plus courts, coût variable, souvent non remboursé",
          "Neuropsychologue : bilan des fonctions exécutives, très utile pour l'école",
          "MDPH : reconnaissance du TDAH comme situation de handicap, déclenche les aménagements scolaires (AESH, tiers temps…)"
        ]
      },
      {
        "type": "callout",
        "variant": "encouragement",
        "text": "Si vous êtes en train de lire ces lignes alors que la maison est en plein chaos, soufflez. Vous faites déjà beaucoup. Le simple fait de chercher à comprendre est ce qui change le plus la trajectoire de votre enfant. Vous n'êtes pas seul·e."
      },
      {
        "type": "h2",
        "text": "La bonne nouvelle : les crises diminuent"
      },
      {
        "type": "p",
        "text": "Si vous lisez cet article en plein chaos, voici ce qu'il faut garder en tête : les crises TDAH diminuent avec le temps. Pas parce que le TDAH disparaît, il ne disparaît pas, mais parce que trois facteurs convergent :"
      },
      {
        "type": "ul",
        "items": [
          "Le cerveau mature. Le cortex préfrontal se développe plus lentement chez l'enfant TDAH (environ 3 ans de retard), mais il se développe quand même. Un enfant de 12 ans a physiologiquement plus de « freins » qu'un enfant de 7 ans.",
          "L'enfant apprend. Avec le temps et la répétition, les stratégies de régulation s'intègrent. La respiration, le coin calme, le vocabulaire émotionnel, tout cela finit par devenir automatique, même si le chemin est long.",
          "Vous apprenez aussi. Vous identifiez les déclencheurs plus vite, vous réagissez avec moins de panique, vous anticipez mieux. Votre seuil de tolérance change, non pas parce que vous acceptez le chaos, mais parce que vous savez exactement quoi faire."
        ]
      },
      {
        "type": "p",
        "text": "Une étude longitudinale du Dr Barkley montre que les familles qui combinent un suivi comportemental (type PEHP), un traitement médicamenteux adapté et des aménagements scolaires voient une réduction de 60 à 70 % de la fréquence des crises en 12 à 18 mois. Ce n'est pas magique, c'est le résultat d'un travail quotidien, structuré, et soutenu."
      },
      {
        "type": "p",
        "text": "Le fait que vous soyez en train de lire cet article est déjà un signal fort : vous cherchez à comprendre, pas à contrôler. C'est exactement ce dont votre enfant a besoin."
      },
      {
        "type": "h2",
        "text": "En résumé"
      },
      {
        "type": "ul",
        "items": [
          "Une crise TDAH est neurologique, pas comportementale.",
          "Le raisonnement ne fonctionne que hors crise.",
          "La co-régulation parentale est le levier n°1.",
          "Anticiper les déclencheurs vaut mieux que gérer les explosions.",
          "Tenir un journal transforme le chaos en information utile.",
          "Protéger la fratrie fait partie du plan.",
          "Un traitement médicamenteux se décide avec données écrites.",
          "L'auto-agression est un signal, pas une manipulation.",
          "L'alliance du couple parental se protège activement.",
          "L'école est un partenaire à informer, pas un adversaire."
        ]
      }
    ],
    "faq": [
      {
        "q": "Combien de temps dure une crise TDAH en moyenne ?",
        "a": "Une crise TDAH dure généralement entre 15 et 45 minutes, en 3 phases : montée (2-10 min), explosion (5-40 min), redescente (10-30 min). Une crise qui dépasse 60 minutes ou se répète plusieurs fois par jour justifie une consultation avec un pédopsychiatre."
      },
      {
        "q": "Dois-je punir mon enfant après une crise TDAH ?",
        "a": "Non. Punir à chaud aggrave l'anxiété et renforce le cercle vicieux parent-enfant sans rien apprendre. Privilégiez le réconfort à chaud, puis un débrief calme le lendemain pour comprendre le déclencheur et anticiper."
      },
      {
        "q": "Pourquoi mon enfant TDAH ne m'entend pas en crise ?",
        "a": "Pendant l'explosion émotionnelle, son cortex préfrontal (raison, langage) est hors ligne. Il n'entend littéralement plus vos phrases complexes. Seul votre ton de voix et votre posture calme (co-régulation) peuvent l'atteindre."
      },
      {
        "q": "La co-régulation parent-enfant, ça marche vraiment avec le TDAH ?",
        "a": "Oui. C'est biologique : un système nerveux parental calme apaise physiologiquement un système nerveux enfant activé. C'est le levier n°1 identifié par le Dr Russell Barkley dans son programme PEHP. Respirer, baisser le volume, s'asseoir à la hauteur de l'enfant — ces gestes sont plus efficaces qu'une explication rationnelle."
      },
      {
        "q": "Crise TDAH ou crise de caprice : comment faire la différence ?",
        "a": "Une crise TDAH est neurologique (disproportionnée, répétée, non contrôlable par l'enfant, souvent suivie de culpabilité) ; un caprice est comportemental (visée d'obtenir quelque chose, l'enfant peut l'arrêter si l'adulte tient la limite). Dans le TDAH, l'enfant ne peut pas « décider » de se calmer."
      },
      {
        "q": "Que faire quand mon enfant TDAH crie dans un lieu public ?",
        "a": "Sortez du lieu si possible (voiture, couloir, extérieur). Réduisez les stimuli. Baissez la voix, parlez peu. Ignorez les regards — ce n'est pas une épreuve de parentalité notée, c'est un moment neurologique à traverser ensemble."
      },
      {
        "q": "Les médicaments calment-ils les crises TDAH ?",
        "a": "Les traitements psychostimulants (méthylphénidate) améliorent l'attention et l'impulsivité, donc indirectement peuvent réduire la fréquence des crises. Ils ne remplacent pas l'accompagnement comportemental (Barkley PEHP). La décision médicamenteuse appartient au pédopsychiatre."
      },
      {
        "q": "Comment aider mon enfant à redescendre après une crise ?",
        "a": "Eau fraîche, lumière tamisée, silence ou musique douce, couverture lourde si apprécié, présence parentale sans contact imposé. Évitez absolument : débrief à chaud, explication, punition, comparaison avec les frères/sœurs."
      },
      {
        "q": "Un journal des crises aide-t-il vraiment ?",
        "a": "Oui. Noter 2 minutes par soir (date, contexte, intensité, déclencheur supposé) révèle en 2-3 semaines 80 % des patterns (ex. dimanche soir, retour d'école du jeudi). Ces données accélèrent drastiquement la consultation chez le pédopsychiatre."
      },
      {
        "q": "Que faire si je crie moi-même pendant la crise de mon enfant ?",
        "a": "Réparez à froid. Dites à votre enfant : « J'ai crié, je n'aurais pas dû, j'étais débordé·e, je suis désolé·e. » Cette réparation renforce le lien plus qu'un sans-faute, et vous lui apprenez comment un adulte assume une erreur émotionnelle."
      }
    ]
  },
  {
    "slug": "dysregulation-emotionnelle-tdah",
    "title": "Dysrégulation émotionnelle et TDAH : comprendre les réactions intenses",
    "excerpt": "Pourquoi votre enfant TDAH réagit trop fort, trop vite, trop longtemps — et ce que la science dit pour l'aider.",
    "cluster": "Connaissance TDAH",
    "readTime": "8 min",
    "body": [
      {
        "type": "p",
        "text": "La dysrégulation émotionnelle est aujourd'hui reconnue comme une dimension centrale du TDAH, et non un simple effet secondaire. Chez votre enfant, le cerveau réagit trop fort, trop vite, trop longtemps à une émotion. Ce n'est ni un caprice, ni un manque d'éducation."
      },
      {
        "type": "takeaways",
        "title": "Ce qu'il faut retenir",
        "items": [
          "La dysrégulation émotionnelle touche 3 enfants TDAH sur 4 — ce n'est ni rare ni un échec.",
          "Son cerveau amplifie les émotions et freine plus tard que la moyenne.",
          "Nommer l'émotion sans la juger aide le cerveau à se reconnecter."
        ]
      },
      {
        "type": "h2",
        "text": "Les chiffres clés"
      },
      {
        "type": "stats",
        "items": [
          {
            "value": "75 %",
            "label": "des enfants TDAH vivent une dysrégulation émotionnelle significative"
          },
          {
            "value": "75 %",
            "label": "d'héritabilité — le TDAH est largement génétique"
          },
          {
            "value": "3 ans",
            "label": "de retard moyen du cortex préfrontal (régulation)"
          }
        ]
      },
      {
        "type": "h2",
        "text": "Comment cela se manifeste-t-il ?"
      },
      {
        "type": "h3",
        "text": "Hypersensibilité émotionnelle"
      },
      {
        "type": "p",
        "text": "Votre enfant « absorbe » les émotions des autres. Une remarque anodine peut provoquer des pleurs ou une colère vive. Les émotions sont vécues de manière amplifiée, comme si le volume était bloqué sur 11."
      },
      {
        "type": "h3",
        "text": "Irritabilité et crises explosives"
      },
      {
        "type": "p",
        "text": "Réactions de colère disproportionnées par rapport au déclencheur, agressivité réactionnelle (pas préméditée), difficulté à revenir au calme après un débordement."
      },
      {
        "type": "h3",
        "text": "Faible tolérance à la frustration"
      },
      {
        "type": "p",
        "text": "L'attente, le refus, le changement de plan déclenchent des réactions intenses. Les transitions entre activités sont particulièrement difficiles."
      },
      {
        "type": "h2",
        "text": "Pourquoi cela arrive : la neurologie"
      },
      {
        "type": "ul",
        "items": [
          "Cortex préfrontal immature : la zone du contrôle des impulsions et de la régulation se développe plus lentement.",
          "Amygdale hyperactive : le centre de détection des menaces s'active plus facilement et plus intensément.",
          "Déficit en dopamine et noradrénaline : deux neurotransmetteurs essentiels à la régulation émotionnelle, moins disponibles chez l'enfant TDAH."
        ]
      },
      {
        "type": "h2",
        "text": "Le cercle vicieux parent-enfant"
      },
      {
        "type": "p",
        "text": "Une étude de Hong Kong (2024) a mis en évidence une relation bidirectionnelle : les difficultés émotionnelles de l'enfant aggravent le stress parental, qui en retour renforce la dysrégulation de l'enfant. Comprendre ce cercle permet de le briser pas par plus de contrôle, mais par plus de co-régulation."
      },
      {
        "type": "h2",
        "text": "3 stratégies concrètes pour le quotidien"
      },
      {
        "type": "h3",
        "text": "1. Nommer l'émotion sans la juger"
      },
      {
        "type": "p",
        "text": "« Tu es très en colère là. C'est ok. » Nommer aide le cortex préfrontal à reprendre la main. Ne surtout pas minimiser (« ce n'est pas grave »)."
      },
      {
        "type": "h3",
        "text": "2. Construire une « boîte à outils émotions »"
      },
      {
        "type": "p",
        "text": "Hors crise, co-construisez une liste d'activités apaisantes personnalisées : musique, objets sensoriels, respiration dessinée, coin refuge. L'enfant TDAH en crise n'invente rien, il se raccroche à ce qui existe déjà."
      },
      {
        "type": "h3",
        "text": "3. Suivre les déclencheurs"
      },
      {
        "type": "p",
        "text": "Noter pendant 3 semaines ce qui précède chaque crise. Faim ? Fatigue ? Retour d'école ? Transition mal préparée ? 80 % des patterns apparaissent."
      }
    ],
    "faq": []
  },
  {
    "slug": "co-regulation-parent-enfant-tdah",
    "title": "Co-régulation parent-enfant TDAH : 7 gestes pour désamorcer une crise",
    "excerpt": "Rester calme quand votre enfant ne l'est plus : le guide des gestes concrets, testés par des parents TDAH.",
    "cluster": "Guide de gestion Barkley",
    "readTime": "7 min",
    "body": [
      {
        "type": "p",
        "text": "La co-régulation, c'est le fait qu'un système nerveux calme en apaise un autre en alerte. C'est biologique, pas magique. Et c'est le levier n°1 pour désamorcer une crise TDAH, à condition d'arriver à rester calme soi-même."
      },
      {
        "type": "takeaways",
        "title": "Ce qu'il faut retenir",
        "items": [
          "Co-réguler, c'est apaiser par votre propre calme — pas par votre raison.",
          "7 gestes concrets, testables ce soir, sans matériel.",
          "Vous allez craquer parfois. C'est normal — réparer renforce le lien."
        ]
      },
      {
        "type": "h2",
        "text": "Pourquoi « co-réguler avant de corriger » ?"
      },
      {
        "type": "p",
        "text": "Le cerveau d'un enfant en crise est en mode survie. Le cortex préfrontal (raison, langage, contrôle) est hors ligne. Lui parler raison à ce moment, c'est crier dans un téléphone éteint. La seule chose qu'il peut encore capter, c'est votre régulation physiologique : votre ton, votre respiration, votre posture."
      },
      {
        "type": "h2",
        "text": "Les 7 gestes concrets"
      },
      {
        "type": "h3",
        "text": "1. Respirer AVANT de parler"
      },
      {
        "type": "p",
        "text": "Inspirez 4 secondes, retenez 7, expirez 8. Deux cycles suffisent à faire redescendre votre propre activation. Votre enfant vous sent respirer."
      },
      {
        "type": "h3",
        "text": "2. Baisser le volume, pas monter"
      },
      {
        "type": "p",
        "text": "Plus il crie, plus vous chuchotez. Le contraste force son cerveau à se reconnecter à vous."
      },
      {
        "type": "h3",
        "text": "3. S'asseoir ou se baisser à sa hauteur"
      },
      {
        "type": "p",
        "text": "Se mettre au-dessus (debout) est perçu comme une menace en crise. S'asseoir = signal d'apaisement."
      },
      {
        "type": "h3",
        "text": "4. Phrases ultra-courtes, répétées"
      },
      {
        "type": "p",
        "text": "« Je suis là. » « Je ne pars pas. » « On est ensemble. » Jamais d'explications, de « pourquoi », de conditions."
      },
      {
        "type": "h3",
        "text": "5. Proposer le contact, ne pas l'imposer"
      },
      {
        "type": "p",
        "text": "« Tu veux que je te prenne dans les bras ? » S'il dit non, respectez. Beaucoup d'enfants TDAH sont hypersensibles au toucher en crise."
      },
      {
        "type": "h3",
        "text": "6. Réduire les stimuli"
      },
      {
        "type": "p",
        "text": "Lumière tamisée, fratrie à distance, téléphones éteints, TV coupée. Le cerveau en crise ne supporte plus le sur-stimulus."
      },
      {
        "type": "h3",
        "text": "7. Accepter de ne rien « résoudre » pendant la crise"
      },
      {
        "type": "p",
        "text": "Votre seul objectif pendant l'explosion : être un ancrage. Pas éduquer, pas corriger, pas poser de limites. Tout ça viendra après, à froid."
      },
      {
        "type": "h2",
        "text": "Le piège du « parent parfait »"
      },
      {
        "type": "p",
        "text": "Vous allez craquer. Crier parfois. Ne pas réussir à respirer. C'est normal, vos propres fonctions exécutives sont épuisées. Le programme Barkley (PEHP) intègre dès l'étape 1 la bienveillance envers soi-même comme condition de réussite. Un parent qui se culpabilise est un parent qui dysrégule plus."
      },
      {
        "type": "h2",
        "text": "Réparer après avoir craqué"
      },
      {
        "type": "p",
        "text": "Réparer renforce le lien plus qu'un « sans-faute ». Dites à votre enfant, à froid : « J'ai crié tout à l'heure, je n'aurais pas dû. Je suis désolé·e. J'étais débordé·e. » Vous lui montrez comment un adulte reconnaît une erreur émotionnelle. C'est le plus puissant apprentissage que vous puissiez lui offrir."
      }
    ],
    "faq": []
  },
  {
    "slug": "deconnexion-emotionnelle-tdah",
    "title": "Déconnexion émotionnelle TDAH : quand votre enfant se ferme",
    "excerpt": "Votre enfant se fige, se ferme, semble absent ? Ce n'est pas de la bouderie — c'est une réponse neurologique à protéger.",
    "cluster": "Connaissance TDAH",
    "readTime": "6 min",
    "body": [
      {
        "type": "p",
        "text": "Toutes les crises TDAH ne sont pas explosives. Certains enfants se ferment : silence, regard absent, immobilité. Beaucoup de parents interprètent cela comme de la bouderie ou de la provocation. C'est une erreur, et elle coûte cher."
      },
      {
        "type": "takeaways",
        "title": "Ce qu'il faut retenir",
        "items": [
          "Le figement est la 3ᵉ réponse au stress, à côté du combat et de la fuite.",
          "Ce n'est pas une bouderie : c'est une protection neurologique.",
          "Réduire la pression, attendre — le figement se dissipe seul en 5 à 20 min."
        ]
      },
      {
        "type": "h2",
        "text": "Qu'est-ce que le figement ?"
      },
      {
        "type": "p",
        "text": "Le figement (ou freeze response) est la troisième réponse du système nerveux face à une menace, aux côtés du combat et de la fuite. Quand le cerveau estime qu'il ne peut ni lutter ni fuir, il déconnecte. C'est un mécanisme de protection neurologique, pas un choix comportemental."
      },
      {
        "type": "h2",
        "text": "Comment le reconnaître ?"
      },
      {
        "type": "ul",
        "items": [
          "Regard fixe ou absent, comme « ailleurs »",
          "Silence prolongé, ne répond pas aux questions",
          "Corps immobile ou au contraire très tendu",
          "Respiration superficielle",
          "Peau qui peut pâlir ou rougir",
          "Impression que l'enfant ne vous entend plus"
        ]
      },
      {
        "type": "h2",
        "text": "Pourquoi c'est fréquent chez l'enfant TDAH"
      },
      {
        "type": "p",
        "text": "L'enfant TDAH vit en hyperactivation chronique : son système nerveux est souvent en alerte. Quand la charge émotionnelle devient trop forte (conflit, réprimande, déception), le figement peut s'enclencher très vite. C'est particulièrement fréquent chez les filles TDAH, dont le trouble est souvent sous-diagnostiqué parce qu'il passe par le repli plutôt que par l'explosion."
      },
      {
        "type": "h2",
        "text": "Ce qui aide vs ce qui aggrave"
      },
      {
        "type": "comparison",
        "helpsTitle": "Ce qui aide",
        "hurtsTitle": "Ce qui aggrave",
        "helps": [
          "Réduire la pression : s'éloigner, baisser la voix, arrêter les questions",
          "Donner un repère : « Je reste à côté, tu me dis quand tu es prêt »",
          "Proposer un ancrage sensoriel : eau fraîche, couverture lourde, musique douce",
          "Attendre. Le figement se dissipe seul en 5 à 20 min sans pression"
        ],
        "hurts": [
          "Insister : « Réponds-moi quand je te parle ! »",
          "Secouer, toucher brusquement, forcer le regard",
          "Interpréter comme de la provocation",
          "Punir le silence"
        ]
      },
      {
        "type": "h2",
        "text": "Quand s'inquiéter ?"
      },
      {
        "type": "p",
        "text": "Si le figement dure plus de 30 minutes, revient plusieurs fois par semaine, s'accompagne de troubles du sommeil ou d'anxiété diffuse, parlez-en à un pédopsychiatre ou un pédopsychologue. Ce peut être un signal d'anxiété généralisée associée au TDAH."
      }
    ],
    "faq": []
  },
  {
    "slug": "fonctions-executives-tdah-enfant",
    "title": "Fonctions exécutives et TDAH : l'enfant qui oublie tout",
    "excerpt": "Votre enfant oublie son cartable, ses consignes, vos demandes ? Ce n'est pas de la mauvaise volonté : c'est la mémoire de travail.",
    "cluster": "Connaissance TDAH",
    "readTime": "9 min",
    "body": [
      {
        "type": "p",
        "text": "« Je te l'ai dit trois fois ! » Cette phrase revient 20 fois par jour dans les familles TDAH. Mais votre enfant ne fait pas semblant d'oublier : ses fonctions exécutives, l'ensemble des processus cérébraux qui permettent de planifier, mémoriser à court terme, inhiber, organiser, présentent un déficit spécifique."
      },
      {
        "type": "takeaways",
        "title": "Ce qu'il faut retenir",
        "items": [
          "Sa mémoire de travail est ~30 % plus courte qu'un enfant non-TDAH du même âge.",
          "Fragmenter les consignes (une à la fois) change tout au quotidien.",
          "Externaliser la mémoire (listes, photos, chronos) n'est pas tricher — c'est une prothèse cognitive.",
          "Renforcer positivement réveille la dopamine. Punir l'oubli aggrave l'anxiété."
        ]
      },
      {
        "type": "h2",
        "text": "Les 6 fonctions exécutives touchées par le TDAH"
      },
      {
        "type": "ol",
        "items": [
          "Mémoire de travail : capacité à maintenir une information en tête pendant quelques secondes le temps de l'utiliser. Très déficitaire dans le TDAH.",
          "Inhibition : capacité à freiner une impulsion, à attendre son tour, à ne pas couper la parole.",
          "Flexibilité cognitive : capacité à passer d'une tâche à une autre, à s'adapter à un changement.",
          "Planification : décomposer un objectif en étapes et anticiper.",
          "Organisation : ranger ses affaires, hiérarchiser les priorités.",
          "Auto-régulation émotionnelle (voir article dédié)."
        ]
      },
      {
        "type": "h2",
        "text": "La mémoire de travail : le cœur du problème"
      },
      {
        "type": "p",
        "text": "La mémoire de travail d'un enfant TDAH a une capacité réduite d'environ 30 % par rapport à un enfant non-TDAH de même âge. Concrètement : quand vous dites « va chercher ton cartable, tes chaussures et ton manteau », il part, arrive dans l'entrée, et ne sait plus ce qu'il est venu faire."
      },
      {
        "type": "h2",
        "text": "Ce qui aide au quotidien"
      },
      {
        "type": "h3",
        "text": "Fragmenter les consignes"
      },
      {
        "type": "p",
        "text": "Une action à la fois. « Va chercher ton cartable. » Attendre. Puis « Maintenant, tes chaussures. » Agaçant au début, salvateur à l'usage."
      },
      {
        "type": "h3",
        "text": "Externaliser la mémoire"
      },
      {
        "type": "ul",
        "items": [
          "Listes visuelles avec dessins ou photos (routine du matin, du soir)",
          "Chronomètre visible pour les transitions",
          "Tableau blanc dans l'entrée avec les « à ne pas oublier »",
          "Sac d'école toujours fait la veille"
        ]
      },
      {
        "type": "h3",
        "text": "Renforcer, ne pas punir"
      },
      {
        "type": "p",
        "text": "Punir un oubli aggrave l'anxiété et n'améliore pas la mémoire. Renforcer positivement chaque réussite, même minuscule, active les circuits de la dopamine, justement déficitaire dans le TDAH. Un tableau de récompenses bien conçu n'est pas un gadget : c'est une prothèse neurologique."
      },
      {
        "type": "h3",
        "text": "Anticiper les devoirs"
      },
      {
        "type": "ul",
        "items": [
          "Environnement calme, sans écran visible, sans fratrie",
          "Séquences courtes (15-20 min) avec pauses actives",
          "Checklist visuelle des matières à faire",
          "Pas de devoirs après 19h (cerveau épuisé)"
        ]
      },
      {
        "type": "h2",
        "text": "À l'école : les aménagements possibles"
      },
      {
        "type": "ul",
        "items": [
          "PAP (Plan d'Accompagnement Personnalisé) : tiers temps, consignes écrites, place devant",
          "Cahier de texte partagé avec les parents",
          "Photocopies des cours pour compenser la difficulté à prendre en notes"
        ]
      }
    ],
    "faq": []
  },
  {
    "slug": "hypersensibilite-sensorielle-tdah",
    "title": "Hypersensibilité sensorielle et TDAH : quand tout est trop fort",
    "excerpt": "Les coutures qui grattent, le bruit du lave-vaisselle, la lumière du plafonnier : comprendre l'hyperréactivité sensorielle TDAH.",
    "cluster": "Connaissance TDAH",
    "readTime": "7 min",
    "body": [
      {
        "type": "p",
        "text": "Votre enfant refuse un pull à cause d'une étiquette, met ses mains sur ses oreilles dans la cantine, pleure en sortant au soleil ? L'hypersensibilité sensorielle touche environ 1 enfant TDAH sur 2. Ce n'est ni de la comédie, ni un caprice."
      },
      {
        "type": "takeaways",
        "title": "Ce qu'il faut retenir",
        "items": [
          "Son cerveau filtre moins bien les stimuli — tout arrive en même temps, fort.",
          "« Tenir » toute la journée à l'école épuise ses ressources : c'est le crash du retour.",
          "Identifier 3-4 déclencheurs sensoriels propres à votre enfant règle 80 % du problème."
        ]
      },
      {
        "type": "stats",
        "items": [
          {
            "value": "1 sur 2",
            "label": "des enfants TDAH ont une hypersensibilité sensorielle"
          },
          {
            "value": "5 canaux",
            "label": "souvent touchés : auditif, tactile, visuel, gustatif, proprioceptif"
          },
          {
            "value": "30 min",
            "label": "de décompression post-école — un game changer"
          }
        ]
      },
      {
        "type": "h2",
        "text": "Qu'est-ce que l'hypersensibilité sensorielle ?"
      },
      {
        "type": "p",
        "text": "C'est une réaction amplifiée aux stimuli sensoriels : bruits, lumières, textures, odeurs, températures. Le cerveau de l'enfant TDAH filtre moins bien les stimulations de fond, elles arrivent toutes au premier plan en même temps."
      },
      {
        "type": "h2",
        "text": "Les 5 canaux sensoriels les plus touchés"
      },
      {
        "type": "ul",
        "items": [
          "Auditif : bruit de l'aspirateur, sèche-cheveux, cantine, cour de récréation.",
          "Tactile : coutures, étiquettes, tissus synthétiques, bas de jean, chaussettes.",
          "Visuel : lumières vives, néons, écrans, foule.",
          "Gustatif / olfactif : textures alimentaires, odeurs fortes, mélanges dans l'assiette.",
          "Proprioceptif : besoin de pression corporelle (câlins serrés, couverture lourde)."
        ]
      },
      {
        "type": "h2",
        "text": "Pourquoi ça déclenche des crises"
      },
      {
        "type": "p",
        "text": "Une hyperréactivité sensorielle non apaisée épuise les ressources cognitives. L'enfant passe ses journées à « tenir » contre le bruit ou les textures. Le soir, il n'en peut plus : une frustration mineure déclenche une crise majeure. C'est ce qu'on appelle le « crash du retour d'école »."
      },
      {
        "type": "h2",
        "text": "Aménagements concrets"
      },
      {
        "type": "h3",
        "text": "À la maison"
      },
      {
        "type": "ul",
        "items": [
          "Casque anti-bruit disponible dès qu'il en a besoin",
          "Vêtements sans couture, sans étiquette, coton doux uniquement",
          "Lumières chaudes, éviter les néons",
          "Coin refuge calme, sombre, avec couverture lourde",
          "Routine de décompression post-école (30 min silence)"
        ]
      },
      {
        "type": "h3",
        "text": "À l'école"
      },
      {
        "type": "ul",
        "items": [
          "Bouchons d'oreilles ou casque en cantine",
          "Place éloignée de la fenêtre et du radiateur",
          "Sortie 2 min avant la sonnerie pour éviter la foule"
        ]
      },
      {
        "type": "h2",
        "text": "Identifier les déclencheurs propres à votre enfant"
      },
      {
        "type": "p",
        "text": "Chaque enfant TDAH a son profil sensoriel. Noter pendant 2 semaines les situations de crise + l'environnement (bruit, foule, lumière, vêtement du jour) révèle rapidement les 3-4 déclencheurs majeurs. Une fois identifiés, 80 % du travail est fait."
      }
    ],
    "faq": []
  },
  {
    "slug": "troubles-sommeil-tdah-enfant",
    "title": "Troubles du sommeil TDAH : pourquoi mon enfant ne dort pas",
    "excerpt": "70 % des enfants TDAH ont des troubles du sommeil. Endormissement, réveils nocturnes, routine, mélatonine — ce qu'il faut savoir.",
    "cluster": "Connaissance TDAH",
    "readTime": "10 min",
    "body": [
      {
        "type": "p",
        "text": "70 % des enfants TDAH présentent des troubles du sommeil. Endormissement qui dure 1 h, réveils nocturnes, matins impossibles. Le sommeil est à la fois la cause et la conséquence du TDAH, un cercle vicieux qu'on peut casser."
      },
      {
        "type": "takeaways",
        "title": "Ce qu'il faut retenir",
        "items": [
          "Soigner le sommeil, c'est soigner le TDAH — les symptômes du jour s'aggravent de 30 à 50 % avec une mauvaise nuit.",
          "Une routine en 4 paliers (1h30 / 45 min / 30 min / coucher) marche pour la plupart des enfants.",
          "La mélatonine en prescription médicale peut aider — jamais en automédication."
        ]
      },
      {
        "type": "stats",
        "items": [
          {
            "value": "70 %",
            "label": "des enfants TDAH ont des troubles du sommeil"
          },
          {
            "value": "+1 h",
            "label": "de retard de phase circadien en moyenne"
          },
          {
            "value": "30-50 %",
            "label": "d'aggravation des symptômes le lendemain d'une mauvaise nuit"
          }
        ]
      },
      {
        "type": "h2",
        "text": "Pourquoi l'enfant TDAH dort mal"
      },
      {
        "type": "ul",
        "items": [
          "Retard de phase circadien : le « signal de sommeil » arrive en moyenne 1 h plus tard que chez l'enfant non-TDAH.",
          "Hyperactivité mentale au coucher : les pensées s'accélèrent quand le corps s'arrête.",
          "Déficit en mélatonine : production naturelle souvent décalée ou diminuée.",
          "Hyperréactivité sensorielle : bruits, lumière, textures empêchent la détente.",
          "Anxiété du soir : ruminations, peur du lendemain."
        ]
      },
      {
        "type": "h2",
        "text": "Les conséquences d'un sommeil dégradé"
      },
      {
        "type": "p",
        "text": "Un enfant TDAH qui dort mal voit ses symptômes s'aggraver de 30 à 50 % le lendemain : irritabilité, impulsivité, inattention. Les crises sont plus fréquentes, les apprentissages plus difficiles. Soigner le sommeil, c'est soigner le TDAH."
      },
      {
        "type": "h2",
        "text": "Construire une routine du soir qui marche"
      },
      {
        "type": "h3",
        "text": "1 h 30 avant le coucher"
      },
      {
        "type": "ul",
        "items": [
          "Dîner léger, éviter le sucre rapide",
          "Arrêt total des écrans",
          "Lumières baissées dans toute la maison"
        ]
      },
      {
        "type": "h3",
        "text": "45 min avant"
      },
      {
        "type": "ul",
        "items": [
          "Bain tiède (pas chaud), la baisse de température corporelle induit le sommeil",
          "Pyjama doux, sans couture",
          "Brossage des dents, toilette"
        ]
      },
      {
        "type": "h3",
        "text": "30 min avant"
      },
      {
        "type": "ul",
        "items": [
          "Histoire ou musique douce au lit",
          "Lampe tamisée ambre uniquement",
          "Pas de conversations stimulantes"
        ]
      },
      {
        "type": "h3",
        "text": "Au moment du coucher"
      },
      {
        "type": "ul",
        "items": [
          "Couverture lourde si l'enfant aime la pression",
          "Bruit blanc ou musique calme en boucle",
          "Rituel court et stable (3 phrases identiques chaque soir)"
        ]
      },
      {
        "type": "h2",
        "text": "Et la mélatonine ?"
      },
      {
        "type": "p",
        "text": "La mélatonine en prescription médicale (pas en automédication !) a montré son efficacité chez l'enfant TDAH dans plusieurs études récentes. Elle ne remplace jamais une bonne hygiène de sommeil mais peut aider à resynchroniser le cycle circadien. À discuter impérativement avec le pédiatre ou le pédopsychiatre."
      },
      {
        "type": "h2",
        "text": "Le journal du sommeil : votre meilleur allié"
      },
      {
        "type": "p",
        "text": "Notez pendant 2-3 semaines : heure du coucher, durée d'endormissement, réveils nocturnes, heure de lever, qualité perçue. Ce simple tableau révèle les patterns (dimanche soir catastrophique, jeudi atroce) et donne au médecin exactement ce dont il a besoin pour ajuster un éventuel traitement."
      }
    ],
    "faq": []
  },
  {
    "slug": "mini-guide-grands-parents-tdah",
    "title": "Votre petit-enfant TDAH n'est pas mal élevé",
    "excerpt": "Vos enfants vous parlent du TDAH de votre petit-enfant ? Ce mini-guide de 4 minutes vous aidera à mieux comprendre sans jargon médical.",
    "cluster": "Ressources pour l'entourage",
    "readTime": "4 min",
    "body": [
      {
        "type": "p",
        "text": "Vos enfants traversent une période compliquée avec votre petit-enfant. Ils vous ont parlé de « TDAH ». Vous ne savez pas exactement ce que ça recouvre, peut-être vous dites-vous que de votre temps, on appelait ça autrement. Ce mini-guide est fait pour vous. Il se lit en 4 minutes. Il n'est pas écrit pour vous faire la leçon, il est écrit pour que vous puissiez être un·e meilleur·e allié·e, parce que votre rôle compte énormément."
      },
      {
        "type": "takeaways",
        "title": "Ce qu'il faut retenir",
        "items": [
          "Le TDAH est un fonctionnement cérébral, pas un échec éducatif.",
          "Votre petit-enfant a besoin de votre regard bienveillant, pas de discipline supplémentaire.",
          "Soutenir ses parents fatigués vaut autant que jouer avec lui."
        ]
      },
      {
        "type": "h2",
        "text": "C'est quoi, le TDAH ?"
      },
      {
        "type": "p",
        "text": "Le TDAH (Trouble du Déficit de l'Attention avec ou sans Hyperactivité) est un fonctionnement cérébral différent, reconnu par la médecine depuis plus de 50 ans. Ce n'est pas une invention récente, ce n'est pas une mode, ce n'est pas un manque d'éducation."
      },
      {
        "type": "p",
        "text": "Concrètement : certaines zones du cerveau de votre petit-enfant se développent plus lentement que la moyenne, celles qui contrôlent l'attention, l'impulsivité, la régulation des émotions. Résultat : il ou elle vit les frustrations 3 à 4 fois plus fort qu'un autre enfant de son âge, sans pouvoir « juste se calmer ». On appelle ça la dysrégulation émotionnelle, et ça concerne 75 % des enfants TDAH."
      },
      {
        "type": "p",
        "text": "Le TDAH a une composante héréditaire à 75 %. Votre petit-enfant est né avec. Il ne l'a pas choisi, ses parents non plus."
      },
      {
        "type": "h2",
        "text": "3 idées reçues qu'il vaut mieux laisser de côté"
      },
      {
        "type": "h3",
        "text": "« De mon temps, une bonne fessée suffisait »"
      },
      {
        "type": "p",
        "text": "À votre époque, beaucoup d'enfants TDAH existaient déjà, ils étaient simplement appelés autrement (« agité », « dans la lune », « pas sérieux »). Et beaucoup ont gardé des blessures de punitions qui ne soignaient rien. La punition chez un enfant TDAH aggrave l'anxiété sans améliorer le comportement, parce que le problème n'est pas une mauvaise volonté : c'est une régulation cérébrale qui n'est pas encore mûre."
      },
      {
        "type": "h3",
        "text": "« C'est parce qu'il passe trop de temps devant les écrans »"
      },
      {
        "type": "p",
        "text": "Les écrans peuvent aggraver les symptômes d'un enfant TDAH, c'est vrai. Mais ils ne sont jamais la cause du TDAH, qui est neurologique et génétique. Un enfant TDAH sans écran reste un enfant TDAH."
      },
      {
        "type": "h3",
        "text": "« Chez moi, il se tient bien, c'est donc ses parents le problème »"
      },
      {
        "type": "p",
        "text": "Cette phrase, même si elle part d'une bonne intention, peut profondément blesser ses parents. Un enfant TDAH peut « tenir » dans un environnement nouveau, avec un adulte différent, quelques heures. Puis il craque, souvent en voiture sur le retour, ou le soir à la maison. On appelle ça l'effet Cocotte-minute : il contient, puis ça sort. Ce n'est pas que ses parents s'y prennent mal, c'est que l'enfant se détend enfin quand il est en sécurité chez lui."
      },
      {
        "type": "h2",
        "text": "Ce que votre petit-enfant ressent (et qu'il ne dit pas)"
      },
      {
        "type": "ul",
        "items": [
          "Il se voit différent des autres enfants, et il le vit mal",
          "Il a peur de décevoir, énormément",
          "Il se sent souvent « trop » (trop bruyant, trop remuant, trop sensible)",
          "Il cherche votre approbation bien plus que vous ne l'imaginez"
        ]
      },
      {
        "type": "h2",
        "text": "5 gestes simples qui aident vraiment"
      },
      {
        "type": "h3",
        "text": "1. Lui offrir de la présence calme"
      },
      {
        "type": "p",
        "text": "Pas de programmes chargés, pas d'activités épuisantes. Un après-midi avec vous, à faire un gâteau tranquillement, vaut de l'or."
      },
      {
        "type": "h3",
        "text": "2. Prévenir les transitions"
      },
      {
        "type": "p",
        "text": "« Dans 10 minutes, on passera à table. Dans 5 minutes, on range. » Prévenir 2-3 fois avant un changement évite bien des crises."
      },
      {
        "type": "h3",
        "text": "3. Valider ses émotions, même fortes"
      },
      {
        "type": "p",
        "text": "Quand il est en colère, dites-lui simplement : « Je vois que c'est très difficile là. Je reste avec toi. » Ne pas minimiser (« c'est pas grave »), ne pas argumenter, ne pas hausser le ton."
      },
      {
        "type": "h3",
        "text": "4. Le féliciter pour des choses précises"
      },
      {
        "type": "p",
        "text": "« Tu as attendu ton tour, c'était dur et tu l'as fait, bravo. » Plutôt que « tu es sage ». Les enfants TDAH ont besoin d'entendre leurs réussites concrètes, leur cerveau les oublie sinon."
      },
      {
        "type": "h3",
        "text": "5. Soutenir ses parents"
      },
      {
        "type": "p",
        "text": "Ses parents sont souvent épuisés et parfois culpabilisés par l'entourage. Un « je vois que vous faites de votre mieux, je suis avec vous » vaut mille conseils. Proposer de garder l'enfant une soirée pour qu'ils soufflent aussi, c'est un cadeau immense."
      },
      {
        "type": "h2",
        "text": "Ce qu'il vaut mieux éviter de dire à ses parents"
      },
      {
        "type": "p",
        "text": "Ces phrases, dites sans mauvaise intention, blessent énormément :"
      },
      {
        "type": "ul",
        "items": [
          "« Tu devrais être plus ferme. »",
          "« De mon temps, on n'avait pas tous ces diagnostics. »",
          "« Il fait ça pour t'embêter. »",
          "« Il a juste besoin d'une bonne correction. »",
          "« C'est parce que tu travailles trop / pas assez. »"
        ]
      },
      {
        "type": "p",
        "text": "Si ces phrases vous sont déjà sorties, ce n'est pas grave. Personne n'est parfait. Vos enfants savent que vous les aimez. Mais les remplacer par « qu'est-ce qui vous aiderait en ce moment ? » change tout."
      },
      {
        "type": "h2",
        "text": "En résumé"
      },
      {
        "type": "ul",
        "items": [
          "Le TDAH est un fonctionnement cérébral différent, pas un échec éducatif.",
          "Votre petit-enfant vous aime et a besoin de vous.",
          "Votre soutien moral à ses parents est aussi précieux que votre affection pour lui.",
          "Une présence calme vaut mille conseils."
        ]
      },
      {
        "type": "p",
        "text": "Merci d'avoir pris 4 minutes pour lire ça. Votre rôle de grand-parent compte énormément. Votre petit-enfant, même quand il crie ou pleure, a besoin de votre regard bienveillant. Vous avez déjà, juste en lisant jusqu'ici, commencé à être un·e meilleur·e allié·e."
      }
    ],
    "faq": []
  },
  {
    "slug": "mini-guide-co-parent-tdah",
    "title": "TDAH : parler d'une seule voix, même séparés",
    "excerpt": "Votre enfant TDAH a deux maisons ? 5 règles simples pour éviter qu'il paie le prix de vos désaccords éducatifs.",
    "cluster": "Ressources pour l'entourage",
    "readTime": "5 min",
    "body": [
      {
        "type": "p",
        "text": "Vous coparentez un enfant TDAH, que vous soyez en couple, séparés, divorcés, en garde alternée. Vous lisez ceci parce qu'un des deux parents veut qu'on avance ensemble. Bonne nouvelle : votre enfant a besoin de cohérence, pas de perfection. Voici 5 règles simples pour lui offrir ça, sans épuiser votre relation adulte."
      },
      {
        "type": "takeaways",
        "title": "Ce qu'il faut retenir",
        "items": [
          "5 règles cardinales communes — le reste, libre chez chacun.",
          "Ne jamais critiquer l'autre parent devant l'enfant : il en tire la conclusion qu'il est le problème.",
          "Partager des observations factuelles, pas des interprétations.",
          "Se relayer dans la fatigue, plutôt que se concurrencer."
        ]
      },
      {
        "type": "h2",
        "text": "Pourquoi la cohérence compte plus pour lui que pour les autres enfants"
      },
      {
        "type": "p",
        "text": "Un enfant TDAH a une mémoire de travail réduite et des fonctions exécutives immatures. Concrètement : s'il doit retenir que chez papa on mange avec les mains pour les frites mais pas chez maman, il plante. S'il entend que le coucher est à 20h30 ici et 21h15 là-bas, il oublie les deux. Multiplier les règles, c'est augmenter sa charge cognitive, et donc ses crises."
      },
      {
        "type": "h2",
        "text": "Règle 1, Tenir les mêmes 5 règles cardinales"
      },
      {
        "type": "p",
        "text": "Pas besoin d'harmoniser votre déco, vos menus ou vos sorties. Tenez-vous d'accord sur 5 règles maximum, celles qui structurent la journée d'un enfant TDAH :"
      },
      {
        "type": "ul",
        "items": [
          "Heure du coucher (même horaire chez les deux parents)",
          "Temps d'écran quotidien (même limite, même règle)",
          "Moment et durée des devoirs",
          "Comportements non négociables (violence, insultes)",
          "Rituels d'apaisement en cas de crise"
        ]
      },
      {
        "type": "p",
        "text": "Le reste : chacun sa maison, chacun son style. C'est sain."
      },
      {
        "type": "h2",
        "text": "Règle 2, Ne jamais critiquer l'autre parent devant l'enfant"
      },
      {
        "type": "p",
        "text": "« Chez ta mère c'est le bazar. » « Ton père ne sait pas s'y prendre. » Un enfant TDAH absorbe ces phrases comme un buvard, et il en tire une conclusion terrible : « C'est moi le problème entre eux. » Les désaccords adultes se règlent entre adultes, hors de la présence de l'enfant, idéalement par message écrit à froid."
      },
      {
        "type": "h2",
        "text": "Règle 3, Partager ce que vous observez, pas vos interprétations"
      },
      {
        "type": "p",
        "text": "Oui : « Il n'a pas dormi avant 23h vendredi. » Non : « Il n'a pas dormi parce que tu le laisses regarder la télé trop tard. »"
      },
      {
        "type": "p",
        "text": "Partager des faits (heures, événements, crises, déclencheurs) est utile et aide le pédopsy. Partager des interprétations ouvre un procès. C'est exactement ce que fait une appli comme Tokō : un journal de faits observables, pas un tribunal."
      },
      {
        "type": "h2",
        "text": "Règle 4, Se relayer, pas se concurrencer"
      },
      {
        "type": "p",
        "text": "Un parent épuisé ne peut pas co-réguler calmement une crise. Si l'autre parent a passé un week-end difficile, ne marquez pas un point, proposez du relais. Un enfant TDAH épuise deux adultes ; vos énergies doivent se compenser, pas s'ajouter dans un même moment."
      },
      {
        "type": "h2",
        "text": "Règle 5, Partager un outil de suivi commun"
      },
      {
        "type": "p",
        "text": "Si vous êtes d'accord, partager un outil (un carnet, une appli, un tableau) où les deux parents notent les observations permet :"
      },
      {
        "type": "ul",
        "items": [
          "D'éviter les guerres de souvenirs en consultation",
          "De voir les patterns sur la durée, pas sur un week-end",
          "De rendre l'enfant moins messager entre vous"
        ]
      },
      {
        "type": "h2",
        "text": "Et si l'autre parent ne veut pas collaborer ?"
      },
      {
        "type": "p",
        "text": "C'est une situation douloureuse mais fréquente. Quelques repères :"
      },
      {
        "type": "ul",
        "items": [
          "Ne tentez pas de convaincre par le conflit, ça échoue toujours",
          "Partagez du contenu éducatif neutre (comme cet article), sans pression",
          "Proposez une consultation commune avec le pédopsy (un tiers neutre change tout)",
          "Concentrez-vous sur ce que vous pouvez tenir chez vous. Un environnement stable chez un seul parent vaut mieux que deux environnements instables."
        ]
      },
      {
        "type": "h2",
        "text": "En résumé"
      },
      {
        "type": "ul",
        "items": [
          "5 règles cardinales communes, le reste libre chez chacun",
          "Ne jamais critiquer l'autre parent devant l'enfant",
          "Partager des observations, pas des jugements",
          "Se relayer dans la fatigue, pas se concurrencer",
          "Un outil commun vaut dix disputes de souvenirs"
        ]
      }
    ],
    "faq": []
  },
  {
    "slug": "mini-guide-parrains-marraines-tdah",
    "title": "Être le parrain cool d'un enfant TDAH",
    "excerpt": "Vos week-ends et votre présence peuvent devenir une vraie bulle d'oxygène. Voici comment — sans jamais épuiser ses parents.",
    "cluster": "Ressources pour l'entourage",
    "readTime": "4 min",
    "body": [
      {
        "type": "p",
        "text": "Vous êtes parrain, marraine, tonton, tata, ou ami·e proche. Votre filleul·e ou le fils/la fille de vos amis a un TDAH. Vous voulez être là, sans gaffer, sans épuiser ses parents. Ce mini-guide est pour vous. En 4 minutes, vous saurez exactement comment jouer votre rôle, qui est immense."
      },
      {
        "type": "takeaways",
        "title": "Ce qu'il faut retenir",
        "items": [
          "Vous êtes un adulte affectueux et non-évaluateur — c'est exactement ce dont l'enfant manque le plus.",
          "Une activité maximum par sortie. Prévenir 5 puis 2 minutes avant chaque transition.",
          "Soulager ses parents un samedi après-midi vaut une thérapie familiale."
        ]
      },
      {
        "type": "h2",
        "text": "Votre place est unique (et précieuse)"
      },
      {
        "type": "p",
        "text": "Vous n'êtes ni un parent, ni un professeur, ni un thérapeute. Vous êtes un adulte affectueux et non-évaluateur. C'est ce dont un enfant TDAH manque le plus : un regard d'adulte qui ne note pas, ne corrige pas, ne punit pas. Juste qui l'aime."
      },
      {
        "type": "h2",
        "text": "3 choses qui font de vous un·e super allié·e"
      },
      {
        "type": "h3",
        "text": "1. Vous n'êtes pas dans l'urgence du quotidien"
      },
      {
        "type": "p",
        "text": "Les parents gèrent les devoirs, les crises du soir, les appels de l'école. Vous, vous venez pour le plaisir. Ça change tout : votre patience est intacte, votre enthousiasme aussi."
      },
      {
        "type": "h3",
        "text": "2. Vous êtes un refuge hors du cercle école/maison"
      },
      {
        "type": "p",
        "text": "Un après-midi chez vous, une balade, une sortie sans enjeu : pour un enfant TDAH qui se sent constamment évalué (par l'école, par la famille, par lui-même), c'est une bulle d'oxygène. Il peut juste être lui, sans devoir réussir quelque chose."
      },
      {
        "type": "h3",
        "text": "3. Vous soulagez ses parents, ils le méritent"
      },
      {
        "type": "p",
        "text": "Parent d'enfant TDAH, c'est fatigant. Vraiment. Proposer de prendre le gamin un samedi après-midi, c'est offrir à ses parents une sieste, une douche tranquille, un café à deux. Vous ne faites pas juste une faveur à l'enfant, vous soignez toute la famille."
      },
      {
        "type": "h2",
        "text": "5 gestes concrets qui marchent"
      },
      {
        "type": "ul",
        "items": [
          "Simplifiez le programme. Une activité maximum par sortie. Un enfant TDAH fatigue vite dans la nouveauté.",
          "Prévenez les transitions. « Dans 10 minutes on part. Dans 5 minutes on range. » Prévenir évite les crises.",
          "Acceptez son intensité. Il parle fort, bouge beaucoup, s'enthousiasme à 200 % ? C'est normal, c'est lui. Ne le rabrouez pas pour « se tenir mieux ».",
          "Créez UN rituel à vous. Le goûter crêpes du dimanche chez vous. Un signe de main secret. Un surnom. Un enfant TDAH adore les repères affectifs stables.",
          "Envoyez un message à ses parents après la garde. « Tout s'est super bien passé, on a fait X, il a mangé Y. Repos pour lui à partir de maintenant. » Ça rassure et ça crédite."
        ]
      },
      {
        "type": "h2",
        "text": "3 pièges dans lesquels ne pas tomber"
      },
      {
        "type": "ul",
        "items": [
          "Le piège du « chez moi il se tient bien ». Si ça se passe bien chez vous, c'est parce que c'est nouveau, calme, sans enjeu. Ne concluez pas que ses parents s'y prennent mal.",
          "Le piège des conseils éducatifs. Ses parents lisent, réfléchissent, consultent. Vos conseils, même bien-intentionnés, peuvent blesser. Demandez plutôt : « De quoi vous auriez besoin ? »",
          "Le piège du « petit caprice ». Ses crises sont neurologiques. Ce n'est pas un caprice. Ne punissez pas, ne moquez pas, ne comparez pas. Restez calme, proposez un retour au calme."
        ]
      },
      {
        "type": "h2",
        "text": "Ce qu'un parent épuisé aimerait entendre de vous"
      },
      {
        "type": "ul",
        "items": [
          "« J'ai vu un article, c'est dingue de découvrir ce que tu vis au quotidien. »",
          "« Tu veux que je le prenne samedi pour te souffler ? »",
          "« T'es un·e bon·ne parent. Je te le dis. »"
        ]
      },
      {
        "type": "h2",
        "text": "En résumé"
      },
      {
        "type": "ul",
        "items": [
          "Votre rôle de parrain/marraine/proche est unique et précieux",
          "Une activité à la fois, prévenir les transitions",
          "Acceptez l'intensité de l'enfant",
          "Soulagez ses parents sans les juger",
          "Un rituel stable avec vous vaut dix sorties spectaculaires"
        ]
      }
    ],
    "faq": []
  },
  {
    "slug": "apres-le-diagnostic-tdah-parcours-de-soins",
    "title": "Après le diagnostic TDAH : votre parcours de soins en 6 étapes",
    "excerpt": "Vous venez d'apprendre le diagnostic. Respirez. Voici 6 étapes concrètes — nom du professionnel, délai, remboursement, et la phrase exacte à dire au téléphone.",
    "cluster": "Parcours de soin en France",
    "readTime": "10 min",
    "body": [
      {
        "type": "p",
        "text": "Vous tenez ce rapport de 2 pages depuis ce matin. Le neuropédiatre a dit « suivi pluridisciplinaire » et vous a souhaité bon courage. Vous ne savez pas par qui commencer. Vous n'êtes pas seul·e. Voici 6 étapes concrètes, à votre rythme."
      },
      {
        "type": "takeaways",
        "title": "Ce qu'il faut retenir",
        "items": [
          "Étapes 1 et 2 (école + MDPH) : à lancer cette semaine. Le reste suit son rythme.",
          "Le TDAH est reconnu ALD : prise en charge à 100 % pour les actes liés.",
          "Un journal d'observations (Tokō ou carnet) accélère drastiquement chaque consultation."
        ]
      },
      {
        "type": "h2",
        "text": "Étape 1 · Informer l'école (cette semaine)"
      },
      {
        "type": "h3",
        "text": "Qui ? À quoi ça sert ?"
      },
      {
        "type": "p",
        "text": "La maîtresse ou le maître de votre enfant, et idéalement le directeur/la directrice. Ils doivent savoir que le diagnostic est posé, pour adapter leur regard et accepter des aménagements en attendant le dossier MDPH."
      },
      {
        "type": "h3",
        "text": "Quand ?"
      },
      {
        "type": "p",
        "text": "Dès cette semaine. N'attendez pas. Un simple email ou un rendez-vous de 15 minutes suffit. L'enseignant·e n'a pas besoin du rapport complet, une information claire suffit."
      },
      {
        "type": "h3",
        "text": "Combien ? Remboursement ?"
      },
      {
        "type": "p",
        "text": "Gratuit."
      },
      {
        "type": "callout",
        "variant": "phone",
        "title": "Ce que vous pouvez dire",
        "text": "« Bonjour, je souhaite vous informer que notre enfant [prénom] vient d'être diagnostiqué·e avec un TDAH. Nous démarrons un suivi avec plusieurs professionnels. J'aimerais qu'on se rencontre 15 minutes pour vous expliquer ce qui peut l'aider en classe, au calme, quand vous avez un moment. »"
      },
      {
        "type": "h3",
        "text": "Documents à apporter"
      },
      {
        "type": "ul",
        "items": [
          "Une courte note (½ page) : diagnostic, comportements observés, aménagements qui aident à la maison.",
          "Pas besoin du rapport médical complet. Votre enfant reste un élève, pas un dossier."
        ]
      },
      {
        "type": "h2",
        "text": "Étape 2 · Déposer le dossier MDPH (cette semaine)"
      },
      {
        "type": "h3",
        "text": "Qui ? À quoi ça sert ?"
      },
      {
        "type": "p",
        "text": "La MDPH (Maison Départementale des Personnes Handicapées) de votre département examine les demandes d'aménagements scolaires officiels (PAP, PPS), d'AESH (accompagnant·e), et de prise en charge de certains soins (ergothérapeute, psychomotricien)."
      },
      {
        "type": "h3",
        "text": "Quand ?"
      },
      {
        "type": "p",
        "text": "Cette semaine. Le délai de traitement est de 4 à 8 mois. Plus vous commencez tôt, plus les aides arrivent tôt. C'est le point le plus souvent négligé par les parents, et celui qui coûte le plus de temps perdu."
      },
      {
        "type": "h3",
        "text": "Combien ? Remboursement ?"
      },
      {
        "type": "p",
        "text": "Gratuit."
      },
      {
        "type": "callout",
        "variant": "phone",
        "title": "Ce que vous pouvez dire",
        "text": "« Bonjour, je souhaite déposer un dossier MDPH pour mon enfant qui vient d'être diagnostiqué·e TDAH. Pouvez-vous m'envoyer le formulaire de demande et la liste des pièces à joindre ? »"
      },
      {
        "type": "h3",
        "text": "Documents à apporter"
      },
      {
        "type": "ul",
        "items": [
          "Rapport de diagnostic (neuropédiatre ou pédopsychiatre)",
          "Certificat médical (Cerfa n°15695*01) rempli par votre médecin",
          "Livret de famille, justificatif de domicile",
          "Projet de vie : quelques lignes sur les difficultés et besoins de l'enfant"
        ]
      },
      {
        "type": "h2",
        "text": "Étape 3 · Pédopsychiatre (mois 1 à 2)"
      },
      {
        "type": "h3",
        "text": "Qui ? À quoi ça sert ?"
      },
      {
        "type": "p",
        "text": "Spécialiste de santé mentale de l'enfant. Confirme le diagnostic, évalue les troubles associés (anxiété, troubles du sommeil, TSA, DYS), et peut prescrire un traitement médicamenteux si nécessaire."
      },
      {
        "type": "h3",
        "text": "Quand ?"
      },
      {
        "type": "p",
        "text": "Dans les 2 mois après le diagnostic. Premier rendez-vous : 60 à 90 minutes. Suivi ensuite tous les 3 à 6 mois."
      },
      {
        "type": "h3",
        "text": "Combien ? Remboursement ?"
      },
      {
        "type": "p",
        "text": "Secteur public (CMP, hôpital) : gratuit, mais délai de 3 à 12 mois. Secteur libéral : 50 à 120 € par séance, remboursé à 70 % par la Sécu si le pédopsychiatre est conventionné, le reste par votre mutuelle. Avec la reconnaissance ALD (affection longue durée), la prise en charge monte à 100 % pour les actes liés au TDAH."
      },
      {
        "type": "callout",
        "variant": "phone",
        "title": "Ce que vous pouvez dire",
        "text": "« Bonjour, je cherche un premier rendez-vous pour mon enfant de [âge] ans qui vient d'être diagnostiqué·e TDAH par un neuropédiatre. Suivez-vous régulièrement des enfants TDAH ? Quel est votre délai pour un premier rendez-vous ? »"
      },
      {
        "type": "h3",
        "text": "Documents à apporter"
      },
      {
        "type": "ul",
        "items": [
          "Rapport de diagnostic du neuropédiatre",
          "Bilans déjà réalisés (psychologue, orthophoniste)",
          "Observations écrites : comportements à la maison, à l'école, fréquence des crises",
          "Carnet de santé de l'enfant"
        ]
      },
      {
        "type": "h2",
        "text": "Étape 4 · Psychologue TCC (mois 2 à 3)"
      },
      {
        "type": "h3",
        "text": "Qui ? À quoi ça sert ?"
      },
      {
        "type": "p",
        "text": "Psychologue formé·e aux thérapies cognitivo-comportementales (TCC). Travaille avec l'enfant sur la gestion des émotions, l'estime de soi, les habiletés sociales, et la mise en place de stratégies concrètes pour le quotidien."
      },
      {
        "type": "h3",
        "text": "Quand ?"
      },
      {
        "type": "p",
        "text": "À partir du mois 2 ou 3, une fois le diagnostic confirmé par le pédopsychiatre. 1 séance par semaine ou toutes les 2 semaines, pendant 6 à 12 mois selon les besoins."
      },
      {
        "type": "h3",
        "text": "Combien ? Remboursement ?"
      },
      {
        "type": "p",
        "text": "Mon Soutien Psy : 12 séances/an remboursées à 100 % sur orientation du médecin traitant (liste de psychologues conventionnés). Hors dispositif : 50 à 80 € par séance , partiellement remboursé par les mutuelles."
      },
      {
        "type": "callout",
        "variant": "phone",
        "title": "Ce que vous pouvez dire",
        "text": "« Bonjour, je cherche un·e psychologue pour mon enfant de [âge] ans diagnostiqué·e TDAH. Travaillez-vous en TCC avec les enfants TDAH ? Êtes-vous conventionné·e Mon Soutien Psy ? »"
      },
      {
        "type": "h3",
        "text": "Documents à apporter"
      },
      {
        "type": "ul",
        "items": [
          "Rapport de diagnostic",
          "Orientation écrite du médecin traitant (pour Mon Soutien Psy)",
          "Observations du quotidien (crises, déclencheurs, contextes)"
        ]
      },
      {
        "type": "h2",
        "text": "Étape 5 · Orthophoniste (si troubles du langage)"
      },
      {
        "type": "h3",
        "text": "Qui ? À quoi ça sert ?"
      },
      {
        "type": "p",
        "text": "Prise en charge des difficultés de langage oral, de lecture, de compréhension, de fluidité verbale. Conditionnel : uniquement si le bilan révèle un trouble associé (DYS) ou des difficultés de communication."
      },
      {
        "type": "h3",
        "text": "Quand ?"
      },
      {
        "type": "p",
        "text": "Si votre enfant a des difficultés scolaires en lecture, écriture ou expression orale. Un bilan orthophonique (1 à 2 séances) précède toute rééducation."
      },
      {
        "type": "h3",
        "text": "Combien ? Remboursement ?"
      },
      {
        "type": "p",
        "text": "Sur prescription du médecin traitant : remboursé à 60 % par la Sécu, le reste par la mutuelle. Séance : 30 à 50 €. Délai pour trouver un·e orthophoniste : 6 à 18 mois selon la région."
      },
      {
        "type": "callout",
        "variant": "phone",
        "title": "Ce que vous pouvez dire",
        "text": "« Bonjour, je cherche un·e orthophoniste pour mon enfant de [âge] ans, diagnostiqué·e TDAH, qui présente [préciser : difficultés de lecture / de langage oral…]. Acceptez-vous de nouveaux patients ? Quel est votre délai ? »"
      },
      {
        "type": "h3",
        "text": "Documents à apporter"
      },
      {
        "type": "ul",
        "items": [
          "Ordonnance du médecin traitant",
          "Rapport de diagnostic TDAH",
          "Bulletins scolaires récents"
        ]
      },
      {
        "type": "h2",
        "text": "Étape 6 · Psychomotricien·ne ou Ergothérapeute (si besoin)"
      },
      {
        "type": "h3",
        "text": "Qui ? À quoi ça sert ?"
      },
      {
        "type": "p",
        "text": "Psychomotricien·ne : travaille la coordination motrice, l'équilibre, la régulation sensorielle (utile si votre enfant est hypersensible au bruit, au toucher, aux textures). Ergothérapeute : propose des aménagements concrets (matériel scolaire adapté, organisation de l'espace, outils d'autonomie quotidienne)."
      },
      {
        "type": "h3",
        "text": "Quand ?"
      },
      {
        "type": "p",
        "text": "Sur recommandation du pédopsychiatre ou du neuropédiatre, selon les besoins spécifiques de votre enfant. Pas systématique."
      },
      {
        "type": "h3",
        "text": "Combien ? Remboursement ?"
      },
      {
        "type": "p",
        "text": "Hors nomenclature Sécurité sociale dans la plupart des cas : 40 à 70 € par séance, à votre charge. Certaines mutuelles remboursent un forfait annuel. La MDPH peut financer partiellement via l'AEEH (Allocation d'Éducation de l'Enfant Handicapé), raison de plus pour déposer le dossier tôt (étape 2)."
      },
      {
        "type": "callout",
        "variant": "phone",
        "title": "Ce que vous pouvez dire",
        "text": "« Bonjour, je cherche un·e psychomotricien·ne [ou ergothérapeute] qui travaille avec des enfants TDAH. Mon enfant de [âge] ans présente [difficultés motrices / hypersensibilité sensorielle / besoin d'aménagements scolaires]. Avez-vous de la place ? »"
      },
      {
        "type": "h3",
        "text": "Documents à apporter"
      },
      {
        "type": "ul",
        "items": [
          "Prescription ou recommandation du médecin",
          "Rapport de diagnostic TDAH",
          "Bilans antérieurs si existants"
        ]
      },
      {
        "type": "h2",
        "text": "Vous n'êtes pas seul·e"
      },
      {
        "type": "p",
        "text": "Ces 6 étapes peuvent s'étaler sur 6 à 12 mois. Vous n'avez pas à tout faire cette semaine. Commencez par les étapes 1 et 2 (école + MDPH), puis laissez les rendez-vous médicaux arriver à leur rythme. Notez chaque appel, chaque rendez-vous, chaque question, un journal structuré vaut mille souvenirs éparpillés."
      },
      {
        "type": "p",
        "text": "Si vous doutez d'un professionnel, demandez un second avis. Si vous doutez de vous, relisez cette phrase : vous avez ouvert cette app, lu ce guide, et commencé à agir. C'est déjà énorme."
      }
    ],
    "faq": [
      {
        "q": "Dois-je attendre d'avoir tous les professionnels avant d'agir ?",
        "a": "Non. Le dossier MDPH et le contact avec l'école peuvent démarrer dès cette semaine, en parallèle des rendez-vous médicaux. Le délai MDPH (4 à 8 semaines) ne doit pas bloquer le reste."
      },
      {
        "q": "Tous les pédopsychiatres comprennent-ils le TDAH ?",
        "a": "Non. Demandez explicitement si le praticien suit régulièrement des enfants TDAH. Un pédopsychiatre généraliste peut être compétent, mais un praticien qui voit peu de TDAH peut orienter maladroitement. N'hésitez pas à poser la question lors de la prise de rendez-vous."
      },
      {
        "q": "Est-ce que je dois tout payer moi-même ?",
        "a": "Non. Le TDAH est reconnu comme ALD (affection longue durée), ce qui ouvre une prise en charge à 100 % pour les actes médicaux liés. Certaines consultations psychologiques sont remboursées (Mon Soutien Psy, 20 séances/an). L'ergothérapeute et le psychomotricien restent majoritairement à votre charge, sauf prise en charge MDPH."
      },
      {
        "q": "Combien de temps pour obtenir un rendez-vous ?",
        "a": "En secteur public (CMP, CMPP, hôpital), comptez 3 à 12 mois. En secteur libéral, 1 à 3 mois. Inscrivez-vous sur plusieurs listes d'attente simultanément, cela multiplie vos chances."
      },
      {
        "q": "Mon enfant a besoin d'un traitement médicamenteux ?",
        "a": "C'est une décision strictement médicale, à prendre avec votre neuropédiatre ou pédopsychiatre après un bilan complet. Cet article ne répond pas à cette question : il vous aide à trouver les bons professionnels pour la poser."
      },
      {
        "q": "PAP ou PPS : quelle différence à l'école ?",
        "a": "Le PAP (Plan d'Accompagnement Personnalisé) est mis en place par l'école, sans MDPH, pour des aménagements simples (tiers-temps, placement, consignes reformulées). Le PPS (Projet Personnalisé de Scolarisation) passe par la MDPH et peut inclure une AESH (accompagnante) si les troubles sont importants."
      }
    ]
  },
  {
    "slug": "medication-tdah-mythes-parents",
    "title": "Médication TDAH : les mythes que tout parent entend",
    "excerpt": "« Les médicaments vont le zombifier. » Non. 70 à 80 % des enfants TDAH répondent bien à un traitement correctement dosé. Voici ce que disent vraiment les données.",
    "cluster": "Parcours de soin en France",
    "readTime": "6 min",
    "body": [
      {
        "type": "p",
        "text": "Quand le pédopsychiatre prononce le mot « méthylphénidate », la plupart des parents entendent « drogue ». Les forums, les grands-parents et parfois même le médecin traitant ajoutent leur couche de mythes. Déconstruisons les cinq plus tenaces, données en main."
      },
      {
        "type": "takeaways",
        "title": "Ce qu'il faut retenir",
        "items": [
          "Les médicaments ne changent pas la personnalité — un enfant « éteint » est probablement surdosé.",
          "70-80 % des enfants TDAH répondent positivement à un traitement bien dosé.",
          "Aucun risque accru de dépendance — au contraire, le non-traitement augmente le risque addictif."
        ]
      },
      {
        "type": "stats",
        "items": [
          {
            "value": "70-80 %",
            "label": "des enfants TDAH répondent à un psychostimulant correctement dosé"
          },
          {
            "value": "60 ans",
            "label": "de recul scientifique sur le méthylphénidate"
          },
          {
            "value": "0",
            "label": "risque accru de dépendance documenté (INSERM 2022)"
          }
        ]
      },
      {
        "type": "h2",
        "text": "Mythe 1 : « Les médicaments vont le zombifier »"
      },
      {
        "type": "p",
        "text": "Le méthylphénidate et les amphétamines réduisent la distractibilité et l'impulsivité. Ils n'effacent pas la personnalité de votre enfant. Un enfant qui semble « éteint » sous traitement est probablement surdosé, c'est un signal pour ajuster, pas pour arrêter."
      },
      {
        "type": "h2",
        "text": "Mythe 2 : « Si les médicaments ne marchent pas, c'est que ce n'est pas un vrai TDAH »"
      },
      {
        "type": "p",
        "text": "70 à 80 % des enfants TDAH répondent positivement à un psychostimulant correctement dosé (HAS 2017, INSERM 2022). Quand ça « ne marche pas », c'est souvent que la dose est trop basse. Un traitement sous-dosé = pas d'effet visible ≠ échec du traitement. L'ajustement (titration) prend parfois plusieurs semaines."
      },
      {
        "type": "h2",
        "text": "Mythe 3 : « Il faut d'abord tout essayer avant la chimie »"
      },
      {
        "type": "p",
        "text": "Les approches non médicamenteuses (psychoéducation, Barkley PEHP, aménagements scolaires) sont complémentaires, pas des alternatives. Pour un TDAH modéré à sévère, retarder le traitement médicamenteux en espérant que « ça passe » expose l'enfant à l'échec scolaire, au rejet social et à une estime de soi en chute libre."
      },
      {
        "type": "h2",
        "text": "Mythe 4 : « Les effets secondaires sont terribles »"
      },
      {
        "type": "p",
        "text": "Les effets secondaires les plus fréquents, perte d'appétit en journée, endormissement retardé, parfois tics, sont gérables avec un ajustement de dose, d'horaire ou de molécule. Ils doivent être surveillés, pas redoutés. Un suivi régulier avec le prescripteur est indispensable."
      },
      {
        "type": "h2",
        "text": "Mythe 5 : « Les médicaments rendent dépendant »"
      },
      {
        "type": "p",
        "text": "Plus de 30 ans de recul (INSERM 2022) : aucun risque accru de dépendance chez les enfants traités pour un TDAH diagnostiqué. En revanche, le non-traitement augmente le risque de conduites addictives à l'adolescence, les données sont claires."
      },
      {
        "type": "h2",
        "text": "Ce qui compte vraiment"
      },
      {
        "type": "p",
        "text": "La décision médicamenteuse appartient au pédopsychiatre, en dialogue avec vous. Votre rôle : observer, noter les effets (positifs et négatifs) au quotidien, et en parler en consultation. C'est exactement ce que permet le suivi des symptômes dans Tokō."
      },
      {
        "type": "p",
        "text": "Chaque stratégie comportementale s'ajoute au traitement, elle ne le remplace pas. À combiner avec une évaluation médicale régulière par le spécialiste qui suit votre enfant."
      }
    ],
    "faq": [
      {
        "q": "Le méthylphénidate change-t-il la personnalité de mon enfant ?",
        "a": "Non. Le méthylphénidate améliore l'attention et réduit l'impulsivité, il ne touche pas à la personnalité. Si votre enfant semble « éteint », c'est un signe de surdosage — parlez-en à son médecin pour ajuster la dose."
      },
      {
        "q": "Les traitements TDAH créent-ils une dépendance ?",
        "a": "Les études sur plus de 30 ans (INSERM 2022) ne montrent aucun risque accru de dépendance chez les enfants traités pour un TDAH diagnostiqué. Au contraire, le non-traitement augmente le risque de conduites addictives à l'adolescence."
      },
      {
        "q": "Peut-on se passer de médicaments avec le TDAH ?",
        "a": "Pour un TDAH léger, les approches comportementales seules peuvent suffire. Pour un TDAH modéré à sévère, les recommandations HAS 2017 et AAP 2019 indiquent une combinaison médicament + accompagnement comportemental comme traitement de référence."
      }
    ]
  },
  {
    "slug": "tdah-ecrans-ne-causent-pas",
    "title": "Les écrans n'ont pas causé le TDAH de votre enfant",
    "excerpt": "Non, les écrans n'ont pas « donné » le TDAH à votre enfant. Ce qu'ils font vraiment, et les règles qui marchent pour les familles TDAH.",
    "cluster": "Connaissance TDAH",
    "readTime": "5 min",
    "body": [
      {
        "type": "p",
        "text": "« Si tu lui avais moins donné la tablette… » Cette phrase, vous l'avez entendue. De vos parents, d'un collègue, d'un article Facebook partagé 12 000 fois. Elle est fausse, et elle vous fait du mal."
      },
      {
        "type": "takeaways",
        "title": "Ce qu'il faut retenir",
        "items": [
          "Le TDAH est héréditaire à 75-80 %. Les écrans ne le « donnent » pas.",
          "Les écrans peuvent aggraver les symptômes dans l'instant — c'est un problème de gestion, pas de cause.",
          "La culpabilité ne soigne rien. Cadrer plutôt que supprimer fonctionne mieux."
        ]
      },
      {
        "type": "h2",
        "text": "Le TDAH est neurodéveloppemental, pas environnemental"
      },
      {
        "type": "p",
        "text": "Le TDAH est héréditaire à 75-80 % (méta-analyses Faraone et al., 2021). C'est l'un des troubles psychiatriques les plus génétiquement déterminés. Souvent, l'un des deux parents a lui-même un TDAH, diagnostiqué ou non."
      },
      {
        "type": "p",
        "text": "Les écrans n'existaient pas en 1902 quand le Dr George Still a décrit les premiers cas. Le TDAH existait déjà. Il existera avec ou sans iPad."
      },
      {
        "type": "h2",
        "text": "Ce que les écrans font vraiment"
      },
      {
        "type": "p",
        "text": "Les écrans ne causent pas le TDAH, mais ils peuvent exacerber la dysrégulation dans l'instant :"
      },
      {
        "type": "ul",
        "items": [
          "Surcharge sensorielle : lumière, son, mouvement rapide, le cerveau TDAH, déjà en difficulté de filtrage, est submergé.",
          "Hijacking dopaminergique : les jeux et réseaux sociaux libèrent de la dopamine immédiate. Le cerveau TDAH, en déficit dopaminergique chronique, s'y accroche plus fort.",
          "Transition difficile : éteindre un écran = passer d'une activité à haute stimulation à une activité à basse stimulation. C'est un déclencheur de crise classique."
        ]
      },
      {
        "type": "p",
        "text": "C'est un problème de gestion, pas de causalité."
      },
      {
        "type": "h2",
        "text": "Les règles qui marchent pour les familles TDAH"
      },
      {
        "type": "ul",
        "items": [
          "Timer visible : un sablier ou un minuteur que l'enfant voit. L'abstrait « encore 10 minutes » ne fonctionne pas avec un cerveau qui ne perçoit pas le temps.",
          "Récompense immédiate : « Tu as éteint quand le timer a sonné → tu gagnes ta star tout de suite. » Approche Barkley : immédiat, fréquent, saillant.",
          "Transition douce : prévenez 5 minutes avant, puis 2 minutes avant. Proposez une activité de remplacement concrète (pas « va jouer »).",
          "Pas de suppression totale : l'interdiction génère frustration et conflits sans traiter le problème. Cadrer, pas punir."
        ]
      },
      {
        "type": "h2",
        "text": "La culpabilité ne soigne rien"
      },
      {
        "type": "p",
        "text": "Vous n'avez pas « donné » le TDAH à votre enfant en le laissant regarder un dessin animé. Le TDAH est neurobiologique. Votre énergie est mieux investie dans la gestion au quotidien que dans la culpabilité rétrospective."
      },
      {
        "type": "p",
        "text": "Si quelqu'un vous ressort la phrase sur les écrans, vous avez maintenant la réponse : 75-80 % d'héritabilité, c'est la science, pas Facebook."
      }
    ],
    "faq": [
      {
        "q": "Les écrans peuvent-ils aggraver les symptômes TDAH ?",
        "a": "Les écrans ne causent pas le TDAH, mais ils peuvent exacerber la dysrégulation dans l'instant : surcharge sensorielle, hijacking dopaminergique, difficulté de transition quand on éteint. C'est un problème de gestion, pas de causalité."
      },
      {
        "q": "Faut-il supprimer tous les écrans pour un enfant TDAH ?",
        "a": "Non. L'interdiction totale génère frustration et conflits sans traiter le problème. Mieux vaut des règles claires : durée définie, timer visible, récompense immédiate pour le respect du temps (approche Barkley). L'ennemi n'est pas l'écran, c'est l'absence de cadre."
      }
    ]
  },
  {
    "slug": "motivation-delai-tdah-pourquoi-punition-echoue",
    "title": "Motivation, punition et TDAH : pourquoi le long terme ne marche pas",
    "excerpt": "Votre enfant n'est pas paresseux. Son cerveau sous-évalue les récompenses différées. Comprendre l'aversion au délai pour remplacer la punition par ce qui fonctionne.",
    "cluster": "Guide de gestion Barkley",
    "readTime": "6 min",
    "body": [
      {
        "type": "p",
        "text": "« Il s'en fiche des conséquences. » « Elle est incapable de se motiver. » « Si je ne punis pas, il ne comprendra jamais. » Ces phrases reviennent dans chaque famille TDAH. Elles partent d'un malentendu fondamental sur le cerveau de votre enfant."
      },
      {
        "type": "takeaways",
        "title": "Ce qu'il faut retenir",
        "items": [
          "Le cerveau TDAH sous-évalue les récompenses différées — ce n'est ni de la paresse ni du choix.",
          "La punition différée n'enseigne rien : la connexion cause-conséquence est perdue.",
          "Ce qui marche : récompenses immédiates, fréquentes et visibles (autocollants, points, étoiles)."
        ]
      },
      {
        "type": "h2",
        "text": "L'aversion au délai : la clé que personne n'explique"
      },
      {
        "type": "p",
        "text": "Le Dr Edmund Sonuga-Barke a démontré que le cerveau TDAH présente une aversion au délai : il sous-évalue massivement une récompense quand elle est éloignée dans le temps. Le Dr Russell Barkley parle de myopie temporelle, votre enfant ne « voit » littéralement pas les conséquences lointaines."
      },
      {
        "type": "p",
        "text": "Concrètement : « de bonnes notes dans 4 mois » a la même valeur motivationnelle pour votre enfant TDAH que « peut-être un jour quelque chose de vague ». Son cerveau n'est pas paresseux, il est neurobiologiquement incapable de pondérer cette information comme un cerveau neurotypique le ferait."
      },
      {
        "type": "h2",
        "text": "Pourquoi la punition échoue"
      },
      {
        "type": "ul",
        "items": [
          "Différée : « Privé de sortie samedi pour ton comportement de lundi », le lien cause-conséquence est perdu.",
          "Aversive sans apprentissage : la punition dit « ne fais pas ça » mais n'enseigne pas quoi faire à la place.",
          "Érosion du lien : les punitions répétées génèrent honte, anxiété et opposition, pas de l'obéissance."
        ]
      },
      {
        "type": "h2",
        "text": "Ce qui marche : immédiat, fréquent, saillant"
      },
      {
        "type": "p",
        "text": "Le programme Barkley PEHP repose sur trois principes simples :"
      },
      {
        "type": "ul",
        "items": [
          "Immédiat : la récompense arrive dans les secondes qui suivent le comportement souhaité. Pas demain, pas samedi. Maintenant.",
          "Fréquent : un enfant TDAH a besoin de plus de feedback positif qu'un enfant neurotypique. Pas 1 compliment par jour, 10, 15.",
          "Saillant : la récompense doit être concrète et visible. Un autocollant, une étoile, un point sur un tableau. Pas une phrase abstraite (« tu seras fier de toi »)."
        ]
      },
      {
        "type": "h3",
        "text": "Exemple concret : les devoirs à 17h"
      },
      {
        "type": "p",
        "text": "❌ « Si tu fais tes devoirs toute la semaine, tu auras un cadeau samedi. » → Trop loin. Le cerveau TDAH décroche au mot « semaine »."
      },
      {
        "type": "p",
        "text": "✅ « Tu as ouvert ton cahier et fait 10 minutes → tu as gagné ta star tout de suite. » → Immédiateté + visibilité = motivation."
      },
      {
        "type": "p",
        "text": "C'est exactement le principe du programme Barkley intégré dans Tokō : un tableau de points quotidien, visuel, avec récompenses immédiates et progressives."
      },
      {
        "type": "h2",
        "text": "Ce n'est pas de la paresse, c'est de la neurologie"
      },
      {
        "type": "p",
        "text": "Votre enfant ne « choisit » pas de s'en ficher. Son cerveau fonctionne différemment. Adapter vos attentes à sa neurologie, ce n'est pas le « gâter », c'est lui donner les outils qui correspondent à son câblage cérébral."
      },
      {
        "type": "p",
        "text": "Cette approche s'ajoute, elle ne remplace pas, l'évaluation médicale et le suivi par le spécialiste qui accompagne votre enfant."
      }
    ],
    "faq": [
      {
        "q": "Pourquoi mon enfant TDAH ne veut-il pas faire ses devoirs pour avoir de bonnes notes ?",
        "a": "Le cerveau TDAH ne peut pas « valoriser » une récompense située dans 4 mois (le bulletin). Ce n'est pas un choix ni de la paresse — c'est un déficit neurobiologique dans le circuit de la récompense. La solution : une récompense immédiate à chaque session de devoirs faite."
      },
      {
        "q": "La punition ne lui apprend-elle pas les limites ?",
        "a": "Une punition différée (privation de sortie le week-end pour un comportement du lundi) n'enseigne rien au cerveau TDAH car la connexion cause → conséquence est perdue. Les conséquences immédiates, courtes et prévisibles sont bien plus efficaces."
      }
    ]
  },
  {
    "slug": "parent-tdah-gerer-mes-propres-crises",
    "title": "Gérer mes propres crises de parent TDAH : la co-régulation commence par moi",
    "excerpt": "Vous avez crié. Vous avez claqué une porte. Vous n'êtes pas un mauvais parent — vous êtes un parent épuisé face à un enfant dysrégulé. Voici comment commencer par vous.",
    "cluster": "Ressources pour les parents",
    "readTime": "6 min",
    "body": [
      {
        "type": "p",
        "text": "Il est 19h30. Votre enfant vient de faire sa troisième crise de la soirée. Vous sentez le sang monter, la mâchoire se serrer, les mots durs arriver. Vous criez. Ou vous partez en claquant la porte. Ou vous pleurez une fois qu'il est couché. Les trois sont normaux. Aucun ne fait de vous un mauvais parent."
      },
      {
        "type": "callout",
        "variant": "encouragement",
        "text": "Si vous lisez cet article, vous prenez déjà soin de vous, et donc de votre enfant. Vous n'êtes pas un mauvais parent. Vous êtes un parent fatigué qui se relève. C'est tout autre chose."
      },
      {
        "type": "takeaways",
        "title": "Ce qu'il faut retenir",
        "items": [
          "Vivre avec un enfant TDAH est une exposition chronique au stress — pas un échec moral.",
          "Le masque à oxygène, c'est pour vous d'abord. Sans cela, aucune technique ne tient.",
          "Réparer après avoir craqué renforce le lien plus qu'un sans-faute impossible."
        ]
      },
      {
        "type": "h2",
        "text": "La biologie du parent épuisé"
      },
      {
        "type": "p",
        "text": "Vivre avec un enfant TDAH dysrégulé, c'est une exposition chronique au stress. Votre système nerveux fonctionne en mode alerte permanent : cortisol élevé, sommeil fragmenté, hypervigilance. Au bout de quelques mois, votre seuil de tolérance s'effondre, c'est physiologique, pas moral."
      },
      {
        "type": "p",
        "text": "La co-régulation (calmer votre enfant par votre propre calme) suppose que votre système nerveux soit régulé d'abord. Si vous êtes au bord de l'explosion, aucune technique parentale ne tiendra. Le masque à oxygène, c'est pour vous d'abord."
      },
      {
        "type": "h2",
        "text": "5 micro-pratiques pour vous réguler en 90 secondes"
      },
      {
        "type": "h3",
        "text": "1. La règle des 90 secondes"
      },
      {
        "type": "p",
        "text": "Une émotion intense dure physiologiquement 90 secondes (Dr. Jill Bolte Taylor). Si vous tenez 90 secondes sans agir, la vague retombe. Comptez dans votre tête, ou serrez un glaçon dans la main, la sensation physique ancre l'attention."
      },
      {
        "type": "h3",
        "text": "2. Respiration carrée (box breathing)"
      },
      {
        "type": "p",
        "text": "Inspirez 4 secondes → bloquez 4 secondes → expirez 4 secondes → bloquez 4 secondes. Trois cycles suffisent pour activer le nerf vague et faire baisser la fréquence cardiaque. Faites-le debout dans la cuisine, personne ne le remarque."
      },
      {
        "type": "h3",
        "text": "3. Aller aux toilettes"
      },
      {
        "type": "p",
        "text": "Oui, c'est une stratégie valide. « Je reviens dans 2 minutes », vous fermez la porte, vous respirez. Votre enfant ne va pas mourir en 2 minutes. Vous, vous allez redescendre assez pour ne pas dire quelque chose que vous regretteriez."
      },
      {
        "type": "h3",
        "text": "4. Baisser le volume"
      },
      {
        "type": "p",
        "text": "Plus l'enfant crie, plus vous parlez bas. C'est contre-intuitif mais puissant : votre voix basse force son cerveau à se calmer pour entendre. Et votre propre ton calme vous calme aussi (feedback somatique)."
      },
      {
        "type": "h3",
        "text": "5. Le mantra de sortie"
      },
      {
        "type": "p",
        "text": "Choisissez une phrase courte que vous répétez en boucle intérieure : « Ce n'est pas contre moi. » « C'est son cerveau, pas un choix. » « Je peux revenir dans 2 minutes. » La phrase remplace la narration toxique (« j'en peux plus, il me rend fou »)."
      },
      {
        "type": "h2",
        "text": "Après : la réparation"
      },
      {
        "type": "p",
        "text": "Vous avez crié. C'est fait. Ce qui compte maintenant : la réparation. Le lendemain, quand tout est calme, dites simplement :"
      },
      {
        "type": "p",
        "text": "« Hier soir j'ai crié très fort, et je suis désolé·e. J'étais fatigué·e et débordé·e. Ce n'est pas ta faute. Je t'aime même quand je suis en colère. »"
      },
      {
        "type": "p",
        "text": "Cette réparation renforce le lien plus qu'un sans-faute. Elle apprend à votre enfant que les adultes aussi perdent le contrôle, et surtout qu'on peut revenir, s'excuser et réparer."
      },
      {
        "type": "h2",
        "text": "Quand c'est trop : les signaux d'alerte"
      },
      {
        "type": "ul",
        "items": [
          "Vous dormez mal depuis plus de 2 semaines (pas à cause de l'enfant)",
          "Vous avez du ressentiment chronique envers votre enfant",
          "Vous pensez régulièrement « je n'en peux plus » ou « il serait mieux sans moi »",
          "Vous évitez le contact physique avec votre enfant"
        ]
      },
      {
        "type": "p",
        "text": "Un seul de ces signes justifie d'appeler pour vous. Pas pour votre enfant, pour vous. Médecin traitant, psychologue, ligne d'écoute (3114, numéro national de prévention du suicide, 24h/24)."
      },
      {
        "type": "h2",
        "text": "Vous n'êtes pas seul·e"
      },
      {
        "type": "p",
        "text": "Vous avez ouvert cette page. Vous cherchez des solutions. Vous n'êtes pas un parent défaillant, vous êtes un parent épuisé qui se bat pour son enfant. La co-régulation commence par prendre soin de vous. Ce n'est pas de l'égoïsme, c'est de la survie parentale."
      }
    ],
    "faq": [
      {
        "q": "Est-ce normal de crier sur mon enfant TDAH ?",
        "a": "Oui. L'exposition chronique à la dysrégulation d'un enfant active votre propre système de stress. Crier n'est pas un échec moral — c'est un signe d'épuisement nerveux. Ce qui compte, c'est la réparation après et la mise en place de stratégies pour baisser votre charge globale."
      },
      {
        "q": "Comment savoir si j'ai besoin d'une aide extérieure ?",
        "a": "Signaux d'alerte : troubles du sommeil récurrents, pensées de type « je n'en peux plus / il serait mieux sans moi », ressentiment persistant envers votre enfant, irritabilité permanente. Un seul de ces signes justifie de parler à un professionnel — pour vous, pas pour votre enfant."
      }
    ]
  }
];

// Article metadata (featured flag + related slugs + last review date) ported
// from apps/web/src/lib/resources-data.tsx for the featured hero and the
// "À lire ensuite" section.
export const ARTICLE_META: Record<string, { featured?: boolean; related?: string[]; lastReviewedAt?: string }> = {
  "crise-tdah-enfant-guide-complet": { featured: true, related: ["apres-le-diagnostic-tdah-parcours-de-soins", "dysregulation-emotionnelle-tdah", "co-regulation-parent-enfant-tdah", "deconnexion-emotionnelle-tdah"] },
  "dysregulation-emotionnelle-tdah": { related: ["crise-tdah-enfant-guide-complet", "co-regulation-parent-enfant-tdah", "deconnexion-emotionnelle-tdah"] },
  "co-regulation-parent-enfant-tdah": { related: ["crise-tdah-enfant-guide-complet", "dysregulation-emotionnelle-tdah"] },
  "deconnexion-emotionnelle-tdah": { related: ["dysregulation-emotionnelle-tdah", "crise-tdah-enfant-guide-complet"] },
  "fonctions-executives-tdah-enfant": { related: ["apres-le-diagnostic-tdah-parcours-de-soins", "troubles-sommeil-tdah-enfant", "dysregulation-emotionnelle-tdah"] },
  "hypersensibilite-sensorielle-tdah": { related: ["troubles-sommeil-tdah-enfant", "dysregulation-emotionnelle-tdah"] },
  "troubles-sommeil-tdah-enfant": { related: ["hypersensibilite-sensorielle-tdah", "dysregulation-emotionnelle-tdah"] },
  "mini-guide-grands-parents-tdah": { related: ["dysregulation-emotionnelle-tdah", "co-regulation-parent-enfant-tdah"] },
  "mini-guide-co-parent-tdah": { related: ["co-regulation-parent-enfant-tdah", "dysregulation-emotionnelle-tdah"] },
  "mini-guide-parrains-marraines-tdah": { related: ["mini-guide-grands-parents-tdah", "co-regulation-parent-enfant-tdah"] },
  "apres-le-diagnostic-tdah-parcours-de-soins": { related: ["crise-tdah-enfant-guide-complet", "fonctions-executives-tdah-enfant"], lastReviewedAt: "2026-04-05" },
  "medication-tdah-mythes-parents": { related: ["apres-le-diagnostic-tdah-parcours-de-soins", "dysregulation-emotionnelle-tdah", "motivation-delai-tdah-pourquoi-punition-echoue"], lastReviewedAt: "2026-04-07" },
  "tdah-ecrans-ne-causent-pas": { related: ["medication-tdah-mythes-parents", "fonctions-executives-tdah-enfant", "dysregulation-emotionnelle-tdah"], lastReviewedAt: "2026-04-07" },
  "motivation-delai-tdah-pourquoi-punition-echoue": { related: ["medication-tdah-mythes-parents", "fonctions-executives-tdah-enfant", "co-regulation-parent-enfant-tdah"], lastReviewedAt: "2026-04-07" },
  "parent-tdah-gerer-mes-propres-crises": { related: ["co-regulation-parent-enfant-tdah", "dysregulation-emotionnelle-tdah", "crise-tdah-enfant-guide-complet"], lastReviewedAt: "2026-04-07" },
};

export const featuredArticle = (): KnowledgeArticle | undefined =>
  knowledgeArticles.find((a) => ARTICLE_META[a.slug]?.featured);

export function relatedArticles(slug: string): KnowledgeArticle[] {
  const slugs = ARTICLE_META[slug]?.related ?? [];
  return slugs
    .map((s) => knowledgeArticles.find((a) => a.slug === s))
    .filter((a): a is KnowledgeArticle => !!a);
}
