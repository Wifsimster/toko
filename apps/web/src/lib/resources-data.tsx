import { Link } from "@tanstack/react-router";
import type { ResourceArticle } from "./resources-types";

export const articles: ResourceArticle[] = [
  // ─── Pillar ────────────────────────────────────────────────────────
  {
    slug: "crise-tdah-enfant-guide-complet",
    title: "Crise TDAH chez l'enfant : le guide complet",
    metaTitle:
      "Crise TDAH enfant : que faire ? Guide complet 2026 | Tokō",
    metaDescription:
      "Votre enfant TDAH fait des crises violentes ? Comprendre le cerveau TDAH en crise, désamorcer, co-réguler. Guide complet par des parents, pour des parents.",
    excerpt:
      "Le guide de référence pour comprendre et traverser les crises TDAH : mécanismes neurologiques, co-régulation, plan d'action avant, pendant et après.",
    cluster: "Pillar · Crises & émotions",
    readTime: "15 min",
    ctaLabel: "Construire ma liste de crise",
    ctaTarget: "crisis-list",
    related: [
      "dysregulation-emotionnelle-tdah",
      "co-regulation-parent-enfant-tdah",
      "deconnexion-emotionnelle-tdah",
    ],
    featured: true,
    faq: [
      {
        question: "Combien de temps dure une crise TDAH en moyenne ?",
        answer:
          "Une crise TDAH dure généralement entre 15 et 45 minutes, en 3 phases : montée (2-10 min), explosion (5-40 min), redescente (10-30 min). Une crise qui dépasse 60 minutes ou se répète plusieurs fois par jour justifie une consultation avec un pédopsychiatre.",
      },
      {
        question: "Dois-je punir mon enfant après une crise TDAH ?",
        answer:
          "Non. Punir à chaud aggrave l'anxiété et renforce le cercle vicieux parent-enfant sans rien apprendre. Privilégiez le réconfort à chaud, puis un débrief calme le lendemain pour comprendre le déclencheur et anticiper.",
      },
      {
        question: "Pourquoi mon enfant TDAH ne m'entend pas en crise ?",
        answer:
          "Pendant l'explosion émotionnelle, son cortex préfrontal (raison, langage) est hors ligne. Il n'entend littéralement plus vos phrases complexes. Seul votre ton de voix et votre posture calme (co-régulation) peuvent l'atteindre.",
      },
      {
        question:
          "La co-régulation parent-enfant, ça marche vraiment avec le TDAH ?",
        answer:
          "Oui. C'est biologique : un système nerveux parental calme apaise physiologiquement un système nerveux enfant activé. C'est le levier n°1 identifié par le Dr Russell Barkley dans son programme PEHP. Respirer, baisser le volume, s'asseoir à la hauteur de l'enfant — ces gestes sont plus efficaces qu'une explication rationnelle.",
      },
      {
        question:
          "Crise TDAH ou crise de caprice : comment faire la différence ?",
        answer:
          "Une crise TDAH est neurologique (disproportionnée, répétée, non contrôlable par l'enfant, souvent suivie de culpabilité) ; un caprice est comportemental (visée d'obtenir quelque chose, l'enfant peut l'arrêter si l'adulte tient la limite). Dans le TDAH, l'enfant ne peut pas « décider » de se calmer.",
      },
      {
        question: "Que faire quand mon enfant TDAH crie dans un lieu public ?",
        answer:
          "Sortez du lieu si possible (voiture, couloir, extérieur). Réduisez les stimuli. Baissez la voix, parlez peu. Ignorez les regards — ce n'est pas une épreuve de parentalité notée, c'est un moment neurologique à traverser ensemble.",
      },
      {
        question: "Les médicaments calment-ils les crises TDAH ?",
        answer:
          "Les traitements psychostimulants (méthylphénidate) améliorent l'attention et l'impulsivité, donc indirectement peuvent réduire la fréquence des crises. Ils ne remplacent pas l'accompagnement comportemental (Barkley PEHP). La décision médicamenteuse appartient au pédopsychiatre.",
      },
      {
        question: "Comment aider mon enfant à redescendre après une crise ?",
        answer:
          "Eau fraîche, lumière tamisée, silence ou musique douce, couverture lourde si apprécié, présence parentale sans contact imposé. Évitez absolument : débrief à chaud, explication, punition, comparaison avec les frères/sœurs.",
      },
      {
        question: "Un journal des crises aide-t-il vraiment ?",
        answer:
          "Oui. Noter 2 minutes par soir (date, contexte, intensité, déclencheur supposé) révèle en 2-3 semaines 80 % des patterns (ex. dimanche soir, retour d'école du jeudi). Ces données accélèrent drastiquement la consultation chez le pédopsychiatre.",
      },
      {
        question: "Que faire si je crie moi-même pendant la crise de mon enfant ?",
        answer:
          "Réparez à froid. Dites à votre enfant : « J'ai crié, je n'aurais pas dû, j'étais débordé·e, je suis désolé·e. » Cette réparation renforce le lien plus qu'un sans-faute, et vous lui apprenez comment un adulte assume une erreur émotionnelle.",
      },
    ],
    content: (
      <>
        <p className="lead">
          Il est 19h47. Votre enfant vient de renverser son verre d'eau. Vous
          dites « ce n'est pas grave » — et la crise démarre. Cris, larmes,
          porte qui claque, insultes. Quarante minutes plus tard, il pleure
          dans vos bras sans comprendre ce qui s'est passé. Vous non plus.
        </p>
        <p>
          Bienvenue dans le quotidien des familles TDAH. Cet article explique
          ce qui se passe réellement dans le cerveau de votre enfant pendant
          une crise, pourquoi les stratégies classiques ne marchent pas, et ce
          qui marche vraiment — en s'appuyant sur les travaux du Dr Russell
          Barkley et les recherches récentes en neurosciences du développement.
        </p>

        <h2>Une crise TDAH n'est pas un caprice</h2>
        <p>
          <strong>75 % des enfants TDAH</strong> présentent une{" "}
          <Link
            to="/ressources/$slug"
            params={{ slug: "dysregulation-emotionnelle-tdah" }}
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            dysrégulation émotionnelle
          </Link>{" "}
          significative. Ce n'est plus considéré comme un effet secondaire du
          trouble : c'est une dimension centrale du TDAH, reconnue depuis les
          travaux récents du Dr Barkley.
        </p>
        <p>
          Ce que vous observez comme une crise disproportionnée est en réalité
          un <strong>emballement neurologique</strong> : l'amygdale (centre
          d'alerte du cerveau) s'active trop vite et trop fort, tandis que le
          cortex préfrontal (la régulation) se développe plus lentement chez
          l'enfant TDAH. Résultat : le signal « urgence » passe avant que le
          « frein » puisse s'activer.
        </p>

        <h2>Les 3 phases d'une crise</h2>
        <h3>1. La montée (2 à 10 minutes)</h3>
        <p>
          Signes avant-coureurs : accélération du débit verbal, voix qui monte,
          mâchoire serrée, gestes plus brusques, regard qui fuit ou qui fixe.
          C'est la seule phase où l'enfant peut encore entendre une voix
          calme. <strong>Agir ici vaut 10× agir plus tard.</strong>
        </p>
        <h3>2. L'explosion (5 à 40 minutes)</h3>
        <p>
          Le cerveau rationnel est hors ligne. L'enfant ne vous entend pas au
          sens propre : ses fonctions auditives d'intégration sont submergées.
          Toute tentative d'explication, de punition, de négociation
          <strong> aggrave la crise</strong>.
        </p>
        <h3>3. La redescente (10 à 30 minutes)</h3>
        <p>
          Épuisement, culpabilité, parfois amnésie partielle de la crise.
          C'est le moment du réconfort, pas de la leçon.
        </p>
        <p>
          <em>Note :</em> certains enfants ne s'explosent pas — ils se figent.
          Silence, regard absent, immobilité. Si c'est le profil de votre
          enfant, lisez l'article dédié à la{" "}
          <Link
            to="/ressources/$slug"
            params={{ slug: "deconnexion-emotionnelle-tdah" }}
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            déconnexion émotionnelle
          </Link>
          .
        </p>

        <h2>Le plan d'action : avant, pendant, après</h2>
        <h3>AVANT : construire le kit anti-crise</h3>
        <ul>
          <li>
            <strong>Identifier les déclencheurs récurrents</strong> (faim,
            fatigue, transition, bruit, frustration scolaire). Les noter dans
            un journal pendant 3 semaines révèle 80 % des patterns. Le manque
            de sommeil en est un particulièrement sournois — lire{" "}
            <Link
              to="/ressources/$slug"
              params={{ slug: "troubles-sommeil-tdah-enfant" }}
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              les troubles du sommeil TDAH
            </Link>
            .
          </li>
          <li>
            <strong>Co-construire une liste d'activités apaisantes</strong>{" "}
            avec l'enfant, hors crise. Objets doux, musique précise, coin
            refuge, respiration dessinée. Cette liste doit être visible au
            moment où il en a besoin.
          </li>
          <li>
            <strong>Anticiper les transitions</strong> : prévenir 10 puis 5
            puis 2 minutes avant un changement d'activité.
          </li>
        </ul>

        <h3>PENDANT : co-réguler, ne pas raisonner</h3>
        <ul>
          <li>
            <strong>Baisser sa propre activation</strong> avant toute chose.
            Respirer 4-7-8, s'asseoir, parler bas. Votre système nerveux calme
            le sien — c'est la{" "}
            <Link
              to="/ressources/$slug"
              params={{ slug: "co-regulation-parent-enfant-tdah" }}
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              co-régulation
            </Link>
            .
          </li>
          <li>
            <strong>Réduire les stimuli</strong> : lumière tamisée, frères et
            sœurs à distance, téléphone éteint.
          </li>
          <li>
            <strong>Phrases courtes, voix basse</strong> : « Je suis là. » « Je
            ne pars pas. » « On respire ensemble. » Jamais de questions, jamais
            de « pourquoi ».
          </li>
          <li>
            <strong>Pas de contact imposé</strong>. Proposer, ne pas forcer.
            Beaucoup d'enfants TDAH sont{" "}
            <Link
              to="/ressources/$slug"
              params={{ slug: "hypersensibilite-sensorielle-tdah" }}
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              hypersensibles au toucher
            </Link>{" "}
            en crise.
          </li>
        </ul>

        <h3>APRÈS : réparer et apprendre</h3>
        <ul>
          <li>
            <strong>Réconfort sans jugement</strong> d'abord. Hydratation,
            câlin si accepté, moment calme.
          </li>
          <li>
            <strong>Débrief différé</strong> (le lendemain, pas à chaud) : « Tu
            te souviens de ce qui s'est passé ? Qu'est-ce qui aurait pu aider ? »
          </li>
          <li>
            <strong>Noter la crise</strong> : déclencheur, durée, ce qui a
            marché, ce qui a aggravé. C'est le matériau d'or pour votre RDV
            pédopsy.
          </li>
        </ul>

        <h2>Ce qui aggrave systématiquement une crise</h2>
        <ul>
          <li>Lever la voix ou crier</li>
          <li>Menacer (« si tu continues, je… »)</li>
          <li>Isoler de force dans sa chambre pendant l'explosion</li>
          <li>Argumenter, expliquer, raisonner</li>
          <li>Punir à chaud</li>
          <li>Comparer à un frère, une sœur, un camarade</li>
        </ul>

        <h2>Quand consulter un professionnel ?</h2>
        <p>
          Si les crises durent plus de 45 minutes, reviennent plusieurs fois
          par jour, mettent en danger (auto-agression, violence physique), ou
          si vous vous sentez épuisé·e au point de perdre vos propres moyens :
          consultez un pédopsychiatre ou un médecin généraliste. Un tracking
          écrit de 2-3 semaines accélère drastiquement le diagnostic.
        </p>

        <h2>Pourquoi tenir un journal change tout</h2>
        <p>
          Les crises semblent aléatoires quand on les vit. Elles le sont
          rarement quand on les note. Un simple journal de 2 minutes par soir
          (date, contexte, intensité, déclencheur supposé) révèle en quelques
          semaines les patterns invisibles : manque de sommeil du dimanche,
          retour d'école le jeudi, transitions du lundi matin.
        </p>
        <p>
          C'est aussi ce que demandera le pédopsychiatre pour poser ou ajuster
          un diagnostic. Parent qui arrive avec 3 mois de données = consultation
          utile. Parent qui arrive avec des souvenirs = consultation qui tourne
          en rond.
        </p>

        <h2>Spécificités selon l'âge de l'enfant</h2>
        <h3>3-6 ans : crises motrices et hypersensibilité</h3>
        <p>
          À cet âge, les crises prennent souvent une forme très physique : se
          jeter au sol, taper, se rouler, mordre. Le vocabulaire est limité,
          l'enfant ne peut pas nommer ce qu'il ressent. Priorité absolue : la
          sécurité (retirer les objets dangereux, écarter les autres enfants)
          et la simplicité des phrases (« Je te vois. C'est très fort. Je
          reste. »).
        </p>
        <h3>7-10 ans : crises déclenchées à l'école</h3>
        <p>
          Les{" "}
          <Link
            to="/ressources/$slug"
            params={{ slug: "fonctions-executives-tdah-enfant" }}
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            fonctions exécutives
          </Link>{" "}
          sont massivement sollicitées par la scolarité (devoirs, consignes,
          transitions). Le « crash du retour d'école » est classique : l'enfant
          a tenu toute la journée, le soir il craque. Prévoir une plage de
          décompression de 30 minutes avant toute sollicitation (devoirs,
          questions, transitions) change radicalement la dynamique familiale.
        </p>
        <h3>11-14 ans : crises identitaires et conflits</h3>
        <p>
          À l'adolescence, les crises se chargent d'enjeux identitaires : ça
          ne veut plus seulement dire « je suis submergé·e », ça peut dire « je
          ne suis pas comme les autres, et je le sais ». Le rôle parental
          évolue : moins de guidance directive, plus d'écoute active, plus de
          validation des sentiments (« Je comprends que ce soit injuste pour
          toi »). Les crises restent neurologiques mais leur contenu devient
          plus verbal, plus conflictuel.
        </p>

        <h2>Crises et fratrie : protéger tout le monde</h2>
        <p>
          Les frères et sœurs non-TDAH sont souvent les grands oubliés de
          l'équation. Ils assistent aux crises, se sentent parfois menacés,
          parfois coupables d'exister sans difficulté. Trois règles
          indispensables :
        </p>
        <ul>
          <li>
            <strong>Pendant la crise</strong> : déplacer les frères/sœurs dans
            une autre pièce, avec une activité calme. Pas de spectateurs.
          </li>
          <li>
            <strong>Après la crise</strong> : nommer ce qui s'est passé avec
            eux, sans diaboliser l'enfant TDAH. « Ton frère a été très en
            colère, son cerveau a du mal à freiner. Ça n'est pas contre toi. »
          </li>
          <li>
            <strong>En dehors des crises</strong> : ménager du temps exclusif
            pour chaque enfant non-TDAH. 20 minutes seul·e avec un parent, une
            fois par semaine, change énormément.
          </li>
        </ul>

        <h2>Le plan de crise écrit : votre outil le plus simple</h2>
        <p>
          Prenez une feuille A4, écrivez à la main, affichez sur le frigo.
          Trois colonnes :
        </p>
        <ol>
          <li>
            <strong>Signes de montée chez mon enfant</strong> (ce qu'il fait,
            dit, son visage) — 3 à 5 signes concrets.
          </li>
          <li>
            <strong>Ce que je fais</strong> (mes gestes concrets) — respirer,
            baisser la voix, m'asseoir, proposer l'eau.
          </li>
          <li>
            <strong>Ce que je ne fais plus jamais</strong> — crier, menacer,
            isoler de force, comparer.
          </li>
        </ol>
        <p>
          Relire ce plan une fois par semaine vaut dix conseils généraux. Il
          vous reconnecte à VOS stratégies, pour VOTRE enfant, sur lesquelles
          vous avez pris un engagement à froid.
        </p>

        <h2>Faut-il parler du traitement médicamenteux ?</h2>
        <p>
          C'est un sujet qui divise les familles, rarement neutre. Quelques
          repères factuels :
        </p>
        <ul>
          <li>
            Les psychostimulants (méthylphénidate) sont les médicaments les
            plus étudiés en pédiatrie — leur rapport bénéfice/risque est
            documenté depuis 60 ans.
          </li>
          <li>
            Ils améliorent l'attention et l'impulsivité (donc indirectement
            réduisent la fréquence des crises), mais n'agissent pas
            directement sur la dysrégulation émotionnelle.
          </li>
          <li>
            Ils ne remplacent jamais l'accompagnement comportemental (programme
            Barkley PEHP, thérapie familiale, aménagements scolaires).
          </li>
          <li>
            La décision appartient au pédopsychiatre, avec le parent. Un
            traitement peut être démarré, ajusté, arrêté — ce n'est jamais un
            engagement à vie décidé dans l'urgence.
          </li>
        </ul>
        <p>
          <strong>Le tracking écrit (symptômes, crises, sommeil)</strong> est
          la donnée n°1 que demandera le médecin pour décider. 4 à 8 semaines
          de notes valent mieux que toute description orale.
        </p>

        <h2>Ressources complémentaires et où se faire aider</h2>
        <ul>
          <li>
            <strong>HyperSupers – TDAH France</strong> : association de
            parents, groupes locaux, formation PEHP
          </li>
          <li>
            <strong>CMP / CMPP</strong> : consultations gratuites (délais
            longs) avec pédopsychiatre et équipe pluridisciplinaire
          </li>
          <li>
            <strong>Pédopsychiatre libéral</strong> : délais plus courts,
            coût variable, souvent non remboursé
          </li>
          <li>
            <strong>Neuropsychologue</strong> : bilan des fonctions exécutives,
            très utile pour l'école
          </li>
          <li>
            <strong>MDPH</strong> : reconnaissance du TDAH comme situation de
            handicap, déclenche les aménagements scolaires (AESH, tiers
            temps…)
          </li>
        </ul>

        <h2>En résumé</h2>
        <ul>
          <li>Une crise TDAH est neurologique, pas comportementale.</li>
          <li>Le raisonnement ne fonctionne que hors crise.</li>
          <li>La co-régulation parentale est le levier n°1.</li>
          <li>
            Anticiper les déclencheurs vaut mieux que gérer les explosions.
          </li>
          <li>Tenir un journal transforme le chaos en information utile.</li>
          <li>Protéger la fratrie fait partie du plan.</li>
          <li>Un traitement médicamenteux se décide avec données écrites.</li>
        </ul>
      </>
    ),
  },

  // ─── Cluster: Crises & émotions ────────────────────────────────────
  {
    slug: "dysregulation-emotionnelle-tdah",
    title: "Dysrégulation émotionnelle et TDAH : comprendre les réactions intenses",
    metaTitle:
      "Dysrégulation émotionnelle TDAH enfant : comprendre et apaiser | Tokō",
    metaDescription:
      "75 % des enfants TDAH vivent une dysrégulation émotionnelle. Pourquoi les émotions sont si intenses, comment les apaiser au quotidien, sans culpabiliser.",
    excerpt:
      "Pourquoi votre enfant TDAH réagit trop fort, trop vite, trop longtemps — et ce que la science dit pour l'aider.",
    cluster: "Crises & émotions",
    readTime: "8 min",
    ctaLabel: "Créer sa liste de crise",
    ctaTarget: "crisis-list",
    related: [
      "crise-tdah-enfant-guide-complet",
      "co-regulation-parent-enfant-tdah",
      "deconnexion-emotionnelle-tdah",
    ],
    content: (
      <>
        <p className="lead">
          La dysrégulation émotionnelle est aujourd'hui reconnue comme une
          <strong> dimension centrale du TDAH</strong>, et non un simple effet
          secondaire. Chez votre enfant, le cerveau réagit trop fort, trop
          vite, trop longtemps à une émotion. Ce n'est ni un caprice, ni un
          manque d'éducation.
        </p>

        <h2>Les chiffres clés</h2>
        <ul>
          <li>
            <strong>75 %</strong> des enfants et adolescents TDAH présentent
            une dysrégulation émotionnelle significative
          </li>
          <li>
            Transmissibilité héréditaire du TDAH : environ <strong>75 %</strong>
          </li>
          <li>
            Le cortex préfrontal (régulation) se développe environ{" "}
            <strong>3 ans plus tard</strong> chez l'enfant TDAH
          </li>
        </ul>

        <h2>Comment cela se manifeste-t-il ?</h2>
        <h3>Hypersensibilité émotionnelle</h3>
        <p>
          Votre enfant « absorbe » les émotions des autres. Une remarque
          anodine peut provoquer des pleurs ou une colère vive. Les émotions
          sont vécues de manière amplifiée, comme si le volume était bloqué
          sur 11.
        </p>
        <h3>Irritabilité et crises explosives</h3>
        <p>
          Réactions de colère disproportionnées par rapport au déclencheur,
          agressivité réactionnelle (pas préméditée), difficulté à revenir au
          calme après un débordement.
        </p>
        <h3>Faible tolérance à la frustration</h3>
        <p>
          L'attente, le refus, le changement de plan déclenchent des réactions
          intenses. Les transitions entre activités sont particulièrement
          difficiles.
        </p>

        <h2>Pourquoi cela arrive : la neurologie</h2>
        <ul>
          <li>
            <strong>Cortex préfrontal immature</strong> : la zone du contrôle
            des impulsions et de la régulation se développe plus lentement.
          </li>
          <li>
            <strong>Amygdale hyperactive</strong> : le centre de détection des
            menaces s'active plus facilement et plus intensément.
          </li>
          <li>
            <strong>Déficit en dopamine et noradrénaline</strong> : deux
            neurotransmetteurs essentiels à la régulation émotionnelle, moins
            disponibles chez l'enfant TDAH.
          </li>
        </ul>

        <h2>Le cercle vicieux parent-enfant</h2>
        <p>
          Une étude de Hong Kong (2024) a mis en évidence une relation{" "}
          <strong>bidirectionnelle</strong> : les difficultés émotionnelles de
          l'enfant aggravent le stress parental, qui en retour renforce la
          dysrégulation de l'enfant. Comprendre ce cercle permet de le briser
          — pas par plus de contrôle, mais par plus de co-régulation.
        </p>

        <h2>3 stratégies concrètes pour le quotidien</h2>
        <h3>1. Nommer l'émotion sans la juger</h3>
        <p>
          « Tu es très en colère là. C'est ok. » Nommer aide le cortex
          préfrontal à reprendre la main. Ne surtout pas minimiser (« ce n'est
          pas grave »).
        </p>
        <h3>2. Construire une « boîte à outils émotions »</h3>
        <p>
          Hors crise, co-construisez une liste d'activités apaisantes
          personnalisées : musique, objets sensoriels, respiration dessinée,
          coin refuge. L'enfant TDAH en crise n'invente rien — il se raccroche
          à ce qui existe déjà.
        </p>
        <h3>3. Suivre les déclencheurs</h3>
        <p>
          Noter pendant 3 semaines ce qui précède chaque crise. Faim ? Fatigue
          ? Retour d'école ? Transition mal préparée ? 80 % des patterns
          apparaissent.
        </p>
      </>
    ),
  },

  {
    slug: "co-regulation-parent-enfant-tdah",
    title: "Co-régulation parent-enfant TDAH : 7 gestes pour désamorcer une crise",
    metaTitle:
      "Co-régulation TDAH : 7 gestes concrets pour désamorcer une crise | Tokō",
    metaDescription:
      "Comment rester calme face à une crise TDAH, quand votre propre système nerveux s'emballe. Les 7 gestes de co-régulation qui marchent vraiment.",
    excerpt:
      "Rester calme quand votre enfant ne l'est plus : le guide des gestes concrets, testés par des parents TDAH.",
    cluster: "Posture parentale",
    readTime: "7 min",
    ctaLabel: "Avancer dans le programme Barkley",
    ctaTarget: "barkley",
    related: [
      "crise-tdah-enfant-guide-complet",
      "dysregulation-emotionnelle-tdah",
    ],
    content: (
      <>
        <p className="lead">
          La co-régulation, c'est le fait qu'un système nerveux calme en apaise
          un autre en alerte. C'est biologique, pas magique. Et c'est{" "}
          <strong>le levier n°1</strong> pour désamorcer une crise TDAH — à
          condition d'arriver à rester calme soi-même.
        </p>

        <h2>Pourquoi « co-réguler avant de corriger » ?</h2>
        <p>
          Le cerveau d'un enfant en crise est en mode survie. Le cortex
          préfrontal (raison, langage, contrôle) est hors ligne. Lui parler
          raison à ce moment, c'est crier dans un téléphone éteint. La seule
          chose qu'il peut encore capter, c'est votre <strong>régulation
          physiologique</strong> : votre ton, votre respiration, votre posture.
        </p>

        <h2>Les 7 gestes concrets</h2>
        <h3>1. Respirer AVANT de parler</h3>
        <p>
          Inspirez 4 secondes, retenez 7, expirez 8. Deux cycles suffisent à
          faire redescendre votre propre activation. Votre enfant vous sent
          respirer.
        </p>
        <h3>2. Baisser le volume, pas monter</h3>
        <p>
          Plus il crie, plus vous chuchotez. Le contraste force son cerveau à
          se reconnecter à vous.
        </p>
        <h3>3. S'asseoir ou se baisser à sa hauteur</h3>
        <p>
          Se mettre au-dessus (debout) est perçu comme une menace en crise.
          S'asseoir = signal d'apaisement.
        </p>
        <h3>4. Phrases ultra-courtes, répétées</h3>
        <p>
          « Je suis là. » « Je ne pars pas. » « On est ensemble. » Jamais
          d'explications, de « pourquoi », de conditions.
        </p>
        <h3>5. Proposer le contact, ne pas l'imposer</h3>
        <p>
          « Tu veux que je te prenne dans les bras ? » S'il dit non, respectez.
          Beaucoup d'enfants TDAH sont hypersensibles au toucher en crise.
        </p>
        <h3>6. Réduire les stimuli</h3>
        <p>
          Lumière tamisée, fratrie à distance, téléphones éteints, TV
          coupée. Le cerveau en crise ne supporte plus le sur-stimulus.
        </p>
        <h3>7. Accepter de ne rien « résoudre » pendant la crise</h3>
        <p>
          Votre seul objectif pendant l'explosion : être un ancrage. Pas
          éduquer, pas corriger, pas poser de limites. Tout ça viendra après,
          à froid.
        </p>

        <h2>Le piège du « parent parfait »</h2>
        <p>
          Vous allez craquer. Crier parfois. Ne pas réussir à respirer. C'est
          normal — vos propres fonctions exécutives sont épuisées. Le
          programme Barkley (PEHP) intègre dès l'étape 1 la{" "}
          <strong>bienveillance envers soi-même</strong> comme condition de
          réussite. Un parent qui se culpabilise est un parent qui dysrégule
          plus.
        </p>

        <h2>Réparer après avoir craqué</h2>
        <p>
          Réparer renforce le lien plus qu'un « sans-faute ». Dites à votre
          enfant, à froid : « J'ai crié tout à l'heure, je n'aurais pas dû. Je
          suis désolé·e. J'étais débordé·e. » Vous lui montrez comment un
          adulte reconnaît une erreur émotionnelle. C'est le plus puissant
          apprentissage que vous puissiez lui offrir.
        </p>
      </>
    ),
  },

  {
    slug: "deconnexion-emotionnelle-tdah",
    title: "Déconnexion émotionnelle TDAH : quand votre enfant se ferme",
    metaTitle:
      "Déconnexion émotionnelle TDAH enfant : comprendre le figement | Tokō",
    metaDescription:
      "Votre enfant TDAH se fige, ne répond plus, semble absent pendant une crise ? Ce n'est pas de la bouderie. Comprendre et accompagner le figement.",
    excerpt:
      "Votre enfant se fige, se ferme, semble absent ? Ce n'est pas de la bouderie — c'est une réponse neurologique à protéger.",
    cluster: "Crises & émotions",
    readTime: "6 min",
    ctaLabel: "Noter les déclencheurs dans le journal",
    ctaTarget: "journal",
    related: [
      "dysregulation-emotionnelle-tdah",
      "crise-tdah-enfant-guide-complet",
    ],
    content: (
      <>
        <p className="lead">
          Toutes les crises TDAH ne sont pas explosives. Certains enfants{" "}
          <strong>se ferment</strong> : silence, regard absent, immobilité.
          Beaucoup de parents interprètent cela comme de la bouderie ou de la
          provocation. C'est une erreur — et elle coûte cher.
        </p>

        <h2>Qu'est-ce que le figement ?</h2>
        <p>
          Le figement (ou <em>freeze response</em>) est la troisième réponse du
          système nerveux face à une menace, aux côtés du combat et de la
          fuite. Quand le cerveau estime qu'il ne peut ni lutter ni fuir, il
          <strong> déconnecte</strong>. C'est un mécanisme de protection
          neurologique, pas un choix comportemental.
        </p>

        <h2>Comment le reconnaître ?</h2>
        <ul>
          <li>Regard fixe ou absent, comme « ailleurs »</li>
          <li>Silence prolongé, ne répond pas aux questions</li>
          <li>Corps immobile ou au contraire très tendu</li>
          <li>Respiration superficielle</li>
          <li>Peau qui peut pâlir ou rougir</li>
          <li>Impression que l'enfant ne vous entend plus</li>
        </ul>

        <h2>Pourquoi c'est fréquent chez l'enfant TDAH</h2>
        <p>
          L'enfant TDAH vit en <strong>hyperactivation chronique</strong> : son
          système nerveux est souvent en alerte. Quand la charge émotionnelle
          devient trop forte (conflit, réprimande, déception), le figement
          peut s'enclencher très vite. C'est particulièrement fréquent chez
          les <strong>filles TDAH</strong>, dont le trouble est souvent
          sous-diagnostiqué parce qu'il passe par le repli plutôt que par
          l'explosion.
        </p>

        <h2>Ce qu'il faut éviter absolument</h2>
        <ul>
          <li>Insister : « Réponds-moi quand je te parle ! »</li>
          <li>Secouer, toucher brusquement, forcer le regard</li>
          <li>Interpréter comme de la provocation</li>
          <li>Punir le silence</li>
        </ul>

        <h2>Ce qui aide</h2>
        <ul>
          <li>
            <strong>Réduire la pression</strong> : s'éloigner un peu, baisser
            la voix, arrêter les questions.
          </li>
          <li>
            <strong>Donner un repère temporel</strong> : « Je reste dans la
            pièce d'à côté, tu me dis quand tu es prêt. »
          </li>
          <li>
            <strong>Proposer un ancrage sensoriel</strong> : un verre d'eau
            frais, une couverture lourde, une musique douce.
          </li>
          <li>
            <strong>Attendre</strong>. Le figement se dissipe de lui-même en
            général entre 5 et 20 minutes si on ne l'aggrave pas.
          </li>
        </ul>

        <h2>Quand s'inquiéter ?</h2>
        <p>
          Si le figement dure plus de 30 minutes, revient plusieurs fois par
          semaine, s'accompagne de troubles du sommeil ou d'anxiété diffuse,
          parlez-en à un pédopsychiatre ou un pédopsychologue. Ce peut être un
          signal d'anxiété généralisée associée au TDAH.
        </p>
      </>
    ),
  },

  // ─── Cluster: Cognition & école ────────────────────────────────────
  {
    slug: "fonctions-executives-tdah-enfant",
    title: "Fonctions exécutives et TDAH : l'enfant qui oublie tout",
    metaTitle:
      "Fonctions exécutives TDAH enfant : mémoire de travail, devoirs | Tokō",
    metaDescription:
      "Votre enfant TDAH oublie ses devoirs, son cartable, les consignes ? Comprendre la mémoire de travail et les fonctions exécutives, et ce qui aide vraiment.",
    excerpt:
      "Votre enfant oublie son cartable, ses consignes, vos demandes ? Ce n'est pas de la mauvaise volonté : c'est la mémoire de travail.",
    cluster: "Cognition & école",
    readTime: "9 min",
    ctaLabel: "Construire un tableau de récompenses",
    ctaTarget: "rewards",
    related: [
      "troubles-sommeil-tdah-enfant",
      "dysregulation-emotionnelle-tdah",
    ],
    content: (
      <>
        <p className="lead">
          « Je te l'ai dit trois fois ! » Cette phrase revient 20 fois par
          jour dans les familles TDAH. Mais votre enfant ne fait pas semblant
          d'oublier : ses <strong>fonctions exécutives</strong> — l'ensemble
          des processus cérébraux qui permettent de planifier, mémoriser à
          court terme, inhiber, organiser — présentent un déficit spécifique.
        </p>

        <h2>Les 6 fonctions exécutives touchées par le TDAH</h2>
        <ol>
          <li>
            <strong>Mémoire de travail</strong> : capacité à maintenir une
            information en tête pendant quelques secondes le temps de
            l'utiliser. Très déficitaire dans le TDAH.
          </li>
          <li>
            <strong>Inhibition</strong> : capacité à freiner une impulsion, à
            attendre son tour, à ne pas couper la parole.
          </li>
          <li>
            <strong>Flexibilité cognitive</strong> : capacité à passer d'une
            tâche à une autre, à s'adapter à un changement.
          </li>
          <li>
            <strong>Planification</strong> : décomposer un objectif en étapes
            et anticiper.
          </li>
          <li>
            <strong>Organisation</strong> : ranger ses affaires, hiérarchiser
            les priorités.
          </li>
          <li>
            <strong>Auto-régulation émotionnelle</strong> (voir article
            dédié).
          </li>
        </ol>

        <h2>La mémoire de travail : le cœur du problème</h2>
        <p>
          La mémoire de travail d'un enfant TDAH a une <strong>capacité
          réduite d'environ 30 %</strong> par rapport à un enfant non-TDAH de
          même âge. Concrètement : quand vous dites « va chercher ton
          cartable, tes chaussures et ton manteau », il part, arrive dans
          l'entrée, et ne sait plus ce qu'il est venu faire.
        </p>

        <h2>Ce qui aide au quotidien</h2>
        <h3>Fragmenter les consignes</h3>
        <p>
          Une action à la fois. « Va chercher ton cartable. » Attendre. Puis
          « Maintenant, tes chaussures. » Agaçant au début, salvateur à
          l'usage.
        </p>
        <h3>Externaliser la mémoire</h3>
        <ul>
          <li>Listes visuelles avec dessins ou photos (routine du matin, du soir)</li>
          <li>Chronomètre visible pour les transitions</li>
          <li>Tableau blanc dans l'entrée avec les « à ne pas oublier »</li>
          <li>Sac d'école toujours fait la veille</li>
        </ul>
        <h3>Renforcer, ne pas punir</h3>
        <p>
          Punir un oubli aggrave l'anxiété et n'améliore pas la mémoire.
          <strong> Renforcer positivement</strong> chaque réussite, même
          minuscule, active les circuits de la dopamine — justement
          déficitaire dans le TDAH. Un tableau de récompenses bien conçu n'est
          pas un gadget : c'est une prothèse neurologique.
        </p>
        <h3>Anticiper les devoirs</h3>
        <ul>
          <li>Environnement calme, sans écran visible, sans fratrie</li>
          <li>Séquences courtes (15-20 min) avec pauses actives</li>
          <li>Checklist visuelle des matières à faire</li>
          <li>Pas de devoirs après 19h (cerveau épuisé)</li>
        </ul>

        <h2>À l'école : les aménagements possibles</h2>
        <ul>
          <li>
            <strong>PAP (Plan d'Accompagnement Personnalisé)</strong> : tiers
            temps, consignes écrites, place devant
          </li>
          <li>
            <strong>Cahier de texte partagé</strong> avec les parents
          </li>
          <li>
            <strong>Photocopies des cours</strong> pour compenser la difficulté
            à prendre en notes
          </li>
        </ul>
      </>
    ),
  },

  // ─── Cluster: Environnement sensoriel ──────────────────────────────
  {
    slug: "hypersensibilite-sensorielle-tdah",
    title: "Hypersensibilité sensorielle et TDAH : quand tout est trop fort",
    metaTitle:
      "Hypersensibilité sensorielle TDAH enfant : bruit, lumière, textures | Tokō",
    metaDescription:
      "Votre enfant TDAH se plaint des coutures, des bruits, des lumières ? L'hypersensibilité sensorielle touche 1 enfant TDAH sur 2. Comprendre et aménager.",
    excerpt:
      "Les coutures qui grattent, le bruit du lave-vaisselle, la lumière du plafonnier : comprendre l'hyperréactivité sensorielle TDAH.",
    cluster: "Environnement sensoriel",
    readTime: "7 min",
    ctaLabel: "Suivre les déclencheurs sensoriels",
    ctaTarget: "symptoms",
    related: [
      "troubles-sommeil-tdah-enfant",
      "dysregulation-emotionnelle-tdah",
    ],
    content: (
      <>
        <p className="lead">
          Votre enfant refuse un pull à cause d'une étiquette, met ses mains
          sur ses oreilles dans la cantine, pleure en sortant au soleil ?
          L'hypersensibilité sensorielle touche environ{" "}
          <strong>1 enfant TDAH sur 2</strong>. Ce n'est ni de la comédie, ni
          un caprice.
        </p>

        <h2>Qu'est-ce que l'hypersensibilité sensorielle ?</h2>
        <p>
          C'est une réaction amplifiée aux stimuli sensoriels : bruits,
          lumières, textures, odeurs, températures. Le cerveau de l'enfant
          TDAH filtre moins bien les stimulations de fond — elles arrivent
          toutes au premier plan en même temps.
        </p>

        <h2>Les 5 canaux sensoriels les plus touchés</h2>
        <ul>
          <li>
            <strong>Auditif</strong> : bruit de l'aspirateur, sèche-cheveux,
            cantine, cour de récréation.
          </li>
          <li>
            <strong>Tactile</strong> : coutures, étiquettes, tissus
            synthétiques, bas de jean, chaussettes.
          </li>
          <li>
            <strong>Visuel</strong> : lumières vives, néons, écrans, foule.
          </li>
          <li>
            <strong>Gustatif / olfactif</strong> : textures alimentaires,
            odeurs fortes, mélanges dans l'assiette.
          </li>
          <li>
            <strong>Proprioceptif</strong> : besoin de pression corporelle
            (câlins serrés, couverture lourde).
          </li>
        </ul>

        <h2>Pourquoi ça déclenche des crises</h2>
        <p>
          Une hyperréactivité sensorielle non apaisée{" "}
          <strong>épuise les ressources cognitives</strong>. L'enfant passe
          ses journées à « tenir » contre le bruit ou les textures. Le soir,
          il n'en peut plus : une frustration mineure déclenche une crise
          majeure. C'est ce qu'on appelle le{" "}
          <em>« crash du retour d'école »</em>.
        </p>

        <h2>Aménagements concrets</h2>
        <h3>À la maison</h3>
        <ul>
          <li>Casque anti-bruit disponible dès qu'il en a besoin</li>
          <li>Vêtements sans couture, sans étiquette, coton doux uniquement</li>
          <li>Lumières chaudes, éviter les néons</li>
          <li>Coin refuge calme, sombre, avec couverture lourde</li>
          <li>Routine de décompression post-école (30 min silence)</li>
        </ul>
        <h3>À l'école</h3>
        <ul>
          <li>Bouchons d'oreilles ou casque en cantine</li>
          <li>Place éloignée de la fenêtre et du radiateur</li>
          <li>Sortie 2 min avant la sonnerie pour éviter la foule</li>
        </ul>

        <h2>Identifier les déclencheurs propres à votre enfant</h2>
        <p>
          Chaque enfant TDAH a son profil sensoriel. Noter pendant 2 semaines
          les situations de crise + l'environnement (bruit, foule, lumière,
          vêtement du jour) révèle rapidement les 3-4 déclencheurs majeurs.
          Une fois identifiés, 80 % du travail est fait.
        </p>
      </>
    ),
  },

  // ─── Cluster: Sommeil & quotidien ──────────────────────────────────
  {
    slug: "troubles-sommeil-tdah-enfant",
    title: "Troubles du sommeil TDAH : pourquoi mon enfant ne dort pas",
    metaTitle:
      "Enfant TDAH ne dort pas : troubles du sommeil, routine, mélatonine | Tokō",
    metaDescription:
      "70 % des enfants TDAH ont des troubles du sommeil. Endormissement difficile, réveils nocturnes, mélatonine : comprendre et construire une routine qui marche.",
    excerpt:
      "70 % des enfants TDAH ont des troubles du sommeil. Endormissement, réveils nocturnes, routine, mélatonine — ce qu'il faut savoir.",
    cluster: "Sommeil & quotidien",
    readTime: "10 min",
    ctaLabel: "Suivre le sommeil dans Tokō",
    ctaTarget: "symptoms",
    related: [
      "hypersensibilite-sensorielle-tdah",
      "dysregulation-emotionnelle-tdah",
    ],
    content: (
      <>
        <p className="lead">
          <strong>70 % des enfants TDAH</strong> présentent des troubles du
          sommeil. Endormissement qui dure 1 h, réveils nocturnes, matins
          impossibles. Le sommeil est à la fois la cause et la conséquence du
          TDAH — un cercle vicieux qu'on peut casser.
        </p>

        <h2>Pourquoi l'enfant TDAH dort mal</h2>
        <ul>
          <li>
            <strong>Retard de phase circadien</strong> : le « signal de
            sommeil » arrive en moyenne 1 h plus tard que chez l'enfant
            non-TDAH.
          </li>
          <li>
            <strong>Hyperactivité mentale au coucher</strong> : les pensées
            s'accélèrent quand le corps s'arrête.
          </li>
          <li>
            <strong>Déficit en mélatonine</strong> : production naturelle
            souvent décalée ou diminuée.
          </li>
          <li>
            <strong>Hyperréactivité sensorielle</strong> : bruits, lumière,
            textures empêchent la détente.
          </li>
          <li>
            <strong>Anxiété du soir</strong> : ruminations, peur du lendemain.
          </li>
        </ul>

        <h2>Les conséquences d'un sommeil dégradé</h2>
        <p>
          Un enfant TDAH qui dort mal voit ses symptômes{" "}
          <strong>s'aggraver de 30 à 50 %</strong> le lendemain : irritabilité,
          impulsivité, inattention. Les crises sont plus fréquentes, les
          apprentissages plus difficiles.{" "}
          <em>Soigner le sommeil, c'est soigner le TDAH.</em>
        </p>

        <h2>Construire une routine du soir qui marche</h2>
        <h3>1 h 30 avant le coucher</h3>
        <ul>
          <li>Dîner léger, éviter le sucre rapide</li>
          <li>Arrêt total des écrans</li>
          <li>Lumières baissées dans toute la maison</li>
        </ul>
        <h3>45 min avant</h3>
        <ul>
          <li>
            Bain tiède (pas chaud) — la baisse de température corporelle induit
            le sommeil
          </li>
          <li>Pyjama doux, sans couture</li>
          <li>Brossage des dents, toilette</li>
        </ul>
        <h3>30 min avant</h3>
        <ul>
          <li>Histoire ou musique douce au lit</li>
          <li>Lampe tamisée ambre uniquement</li>
          <li>Pas de conversations stimulantes</li>
        </ul>
        <h3>Au moment du coucher</h3>
        <ul>
          <li>Couverture lourde si l'enfant aime la pression</li>
          <li>Bruit blanc ou musique calme en boucle</li>
          <li>Rituel court et stable (3 phrases identiques chaque soir)</li>
        </ul>

        <h2>Et la mélatonine ?</h2>
        <p>
          La mélatonine <strong>en prescription médicale</strong> (pas en
          automédication !) a montré son efficacité chez l'enfant TDAH dans
          plusieurs études récentes. Elle ne remplace jamais une bonne hygiène
          de sommeil mais peut aider à{" "}
          <strong>resynchroniser le cycle circadien</strong>. À discuter
          impérativement avec le pédiatre ou le pédopsychiatre.
        </p>

        <h2>Le journal du sommeil : votre meilleur allié</h2>
        <p>
          Notez pendant 2-3 semaines : heure du coucher, durée
          d'endormissement, réveils nocturnes, heure de lever, qualité perçue.
          Ce simple tableau révèle les patterns (dimanche soir catastrophique,
          jeudi atroce) et donne au médecin exactement ce dont il a besoin
          pour ajuster un éventuel traitement.
        </p>
      </>
    ),
  },

  // ─── Cluster: Pour l'entourage (mini-guides) ───────────────────────
  {
    slug: "mini-guide-grands-parents-tdah",
    title: "Votre petit-enfant TDAH n'est pas mal élevé",
    metaTitle:
      "TDAH enfant : mini-guide pour grands-parents | Tokō",
    metaDescription:
      "Votre petit-fils, votre petite-fille a un TDAH ? Ce qu'il faut savoir pour comprendre son fonctionnement, sans jargon médical, sans jugement.",
    excerpt:
      "Vos enfants vous parlent du TDAH de votre petit-enfant ? Ce mini-guide de 4 minutes vous aidera à mieux comprendre sans jargon médical.",
    cluster: "Pour l'entourage",
    readTime: "4 min",
    audience: "entourage",
    ctaLabel: "Découvrir Tokō",
    ctaTarget: "dashboard",
    related: [
      "dysregulation-emotionnelle-tdah",
      "co-regulation-parent-enfant-tdah",
    ],
    content: (
      <>
        <p className="lead">
          Vos enfants traversent une période compliquée avec votre petit-enfant.
          Ils vous ont parlé de « TDAH ». Vous ne savez pas exactement ce que
          ça recouvre, peut-être vous dites-vous que de votre temps, on
          appelait ça autrement. Ce mini-guide est fait pour vous. Il se lit
          en 4 minutes. Il n'est pas écrit pour vous faire la leçon — il est
          écrit pour que vous puissiez être un·e meilleur·e allié·e, parce que
          votre rôle compte énormément.
        </p>

        <h2>C'est quoi, le TDAH ?</h2>
        <p>
          Le TDAH (Trouble du Déficit de l'Attention avec ou sans Hyperactivité)
          est un <strong>fonctionnement cérébral différent</strong>, reconnu
          par la médecine depuis plus de 50 ans. Ce n'est pas une invention
          récente, ce n'est pas une mode, ce n'est pas un manque d'éducation.
        </p>
        <p>
          Concrètement : certaines zones du cerveau de votre petit-enfant se
          développent plus lentement que la moyenne — celles qui contrôlent
          l'attention, l'impulsivité, la régulation des émotions. Résultat : il
          ou elle vit les frustrations 3 à 4 fois plus fort qu'un autre enfant
          de son âge, sans pouvoir « juste se calmer ». On appelle ça la
          <strong> dysrégulation émotionnelle</strong>, et ça concerne 75 %
          des enfants TDAH.
        </p>
        <p>
          Le TDAH a une composante <strong>héréditaire à 75 %</strong>. Votre
          petit-enfant est né avec. Il ne l'a pas choisi, ses parents non
          plus.
        </p>

        <h2>3 idées reçues qu'il vaut mieux laisser de côté</h2>
        <h3>« De mon temps, une bonne fessée suffisait »</h3>
        <p>
          À votre époque, beaucoup d'enfants TDAH existaient déjà — ils étaient
          simplement appelés autrement (« agité », « dans la lune », « pas
          sérieux »). Et beaucoup ont gardé des blessures de punitions qui ne
          soignaient rien. La punition chez un enfant TDAH <strong>aggrave
          l'anxiété</strong> sans améliorer le comportement, parce que le
          problème n'est pas une mauvaise volonté : c'est une régulation
          cérébrale qui n'est pas encore mûre.
        </p>
        <h3>« C'est parce qu'il passe trop de temps devant les écrans »</h3>
        <p>
          Les écrans peuvent aggraver les symptômes d'un enfant TDAH, c'est
          vrai. Mais ils ne sont <strong>jamais la cause</strong> du TDAH —
          qui est neurologique et génétique. Un enfant TDAH sans écran reste
          un enfant TDAH.
        </p>
        <h3>« Chez moi, il se tient bien — c'est donc ses parents le problème »</h3>
        <p>
          Cette phrase, même si elle part d'une bonne intention, peut
          profondément blesser ses parents. Un enfant TDAH peut « tenir » dans
          un environnement nouveau, avec un adulte différent, quelques heures.
          Puis il craque — souvent en voiture sur le retour, ou le soir à la
          maison. On appelle ça <strong>l'effet Cocotte-minute</strong> : il
          contient, puis ça sort. Ce n'est pas que ses parents s'y prennent
          mal — c'est que l'enfant se détend enfin quand il est en sécurité
          chez lui.
        </p>

        <h2>Ce que votre petit-enfant ressent (et qu'il ne dit pas)</h2>
        <ul>
          <li>Il se voit différent des autres enfants, et il le vit mal</li>
          <li>Il a peur de décevoir, énormément</li>
          <li>Il se sent souvent « trop » (trop bruyant, trop remuant, trop sensible)</li>
          <li>Il cherche votre approbation bien plus que vous ne l'imaginez</li>
        </ul>

        <h2>5 gestes simples qui aident vraiment</h2>
        <h3>1. Lui offrir de la <em>présence calme</em></h3>
        <p>
          Pas de programmes chargés, pas d'activités épuisantes. Un après-midi
          avec vous, à faire un gâteau tranquillement, vaut de l'or.
        </p>
        <h3>2. Prévenir les transitions</h3>
        <p>
          « Dans 10 minutes, on passera à table. Dans 5 minutes, on range. »
          Prévenir 2-3 fois avant un changement évite bien des crises.
        </p>
        <h3>3. Valider ses émotions, même fortes</h3>
        <p>
          Quand il est en colère, dites-lui simplement : « Je vois que c'est
          très difficile là. Je reste avec toi. » Ne pas minimiser (« c'est
          pas grave »), ne pas argumenter, ne pas hausser le ton.
        </p>
        <h3>4. Le féliciter pour des choses précises</h3>
        <p>
          « Tu as attendu ton tour, c'était dur et tu l'as fait, bravo. »
          Plutôt que « tu es sage ». Les enfants TDAH ont besoin d'entendre
          leurs réussites concrètes, leur cerveau les oublie sinon.
        </p>
        <h3>5. Soutenir ses parents</h3>
        <p>
          Ses parents sont souvent épuisés et parfois culpabilisés par
          l'entourage. Un « je vois que vous faites de votre mieux, je suis
          avec vous » vaut mille conseils. Proposer de garder l'enfant une
          soirée pour qu'ils soufflent aussi, c'est un cadeau immense.
        </p>

        <h2>Ce qu'il vaut mieux éviter de dire à ses parents</h2>
        <p>Ces phrases, dites sans mauvaise intention, blessent énormément :</p>
        <ul>
          <li><em>« Tu devrais être plus ferme. »</em></li>
          <li><em>« De mon temps, on n'avait pas tous ces diagnostics. »</em></li>
          <li><em>« Il fait ça pour t'embêter. »</em></li>
          <li><em>« Il a juste besoin d'une bonne correction. »</em></li>
          <li><em>« C'est parce que tu travailles trop / pas assez. »</em></li>
        </ul>
        <p>
          Si ces phrases vous sont déjà sorties, ce n'est pas grave.
          Personne n'est parfait. Vos enfants savent que vous les aimez. Mais
          les remplacer par <em>« qu'est-ce qui vous aiderait en ce moment ? »</em>
          change tout.
        </p>

        <h2>En résumé</h2>
        <ul>
          <li>Le TDAH est un fonctionnement cérébral différent, pas un échec éducatif.</li>
          <li>Votre petit-enfant vous aime et a besoin de vous.</li>
          <li>Votre soutien moral à ses parents est aussi précieux que votre affection pour lui.</li>
          <li>Une présence calme vaut mille conseils.</li>
        </ul>

        <p className="lead" style={{ marginTop: "2.5em" }}>
          Merci d'avoir pris 4 minutes pour lire ça. Votre rôle de
          grand-parent compte énormément. Votre petit-enfant, même quand il
          crie ou pleure, a besoin de votre regard bienveillant. Vous avez
          déjà, juste en lisant jusqu'ici, commencé à être un·e meilleur·e
          allié·e.
        </p>
      </>
    ),
  },
];

