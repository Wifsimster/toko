import { Link } from "@tanstack/react-router";
import type { ResourceArticle } from "./resources-types";

// Default metadata applied to articles that don't override. When we begin
// shipping articles authored by external clinicians, each article declares
// its own reviewer + lastReviewedAt.
export const DEFAULT_LAST_REVIEWED = "2026-02-01";
export const DEFAULT_REVIEWER = "Équipe Tokō — sources Barkley, HAS, INSERM";

function PhoneScript({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-4 rounded-lg border-l-4 border-primary/40 bg-primary/5 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-primary">
        📞 Ce que vous pouvez dire
      </div>
      <div className="mt-1 italic text-foreground/90">{children}</div>
    </aside>
  );
}

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
    readTime: "20 min",
    ctaLabel: "Construire ma liste de crise",
    ctaTarget: "crisis-list",
    related: [
      "apres-le-diagnostic-tdah-parcours-de-soins",
      "dysregulation-emotionnelle-tdah",
      "co-regulation-parent-enfant-tdah",
      "deconnexion-emotionnelle-tdah",
    ],
    triggers: ["crisis:recent", "agitation:high", "mood:low"],
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

        <aside className="my-6 rounded-lg border border-border/50 bg-muted/30 px-5 py-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Témoignage
          </div>
          <blockquote className="mt-2 text-foreground/90 italic">
            « Pendant des mois, je criais aussi fort que lui. Un soir, je me
            suis assise par terre au milieu du couloir, j'ai fermé les yeux et
            j'ai juste respiré. Il m'a regardée, surpris. Au bout de deux
            minutes, il s'est assis en face de moi. On n'a rien dit. C'est la
            première crise qu'on a traversée ensemble sans que je me sente
            nulle après. »
          </blockquote>
          <p className="mt-2 text-sm text-muted-foreground">
            — Mère d'un garçon de 8 ans, diagnostiqué TDAH mixte
          </p>
        </aside>

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

        <h2>Crises à l'école : dialoguer avec l'enseignant</h2>
        <p>
          Les crises ne s'arrêtent pas à la porte de la maison. Beaucoup
          d'enfants TDAH explosent à l'école — ou, au contraire, se
          contiennent toute la journée et craquent le soir à la maison.
          Dans les deux cas, un dialogue avec l'enseignant est
          indispensable.
        </p>
        <h3>Ce que l'enseignant doit savoir</h3>
        <ul>
          <li>
            <strong>Le TDAH est neurologique</strong>, pas éducatif. L'enfant
            ne « choisit » pas de perturber la classe.
          </li>
          <li>
            <strong>Les transitions sont les moments à risque</strong> :
            changement de matière, récréation, retour en classe. Un signal
            verbal ou visuel 5 minutes avant aide considérablement.
          </li>
          <li>
            <strong>L'isolement punitif aggrave</strong>. Un « coin calme »
            proposé (pas imposé) avec un objet sensoriel est plus efficace
            qu'une mise à l'écart humiliante.
          </li>
          <li>
            <strong>Le carnet de liaison n'est pas un outil de punition</strong>.
            Si chaque soir l'enfant rentre avec « comportement inacceptable »,
            le carnet devient une source d'anxiété, pas d'amélioration.
          </li>
        </ul>
        <h3>Comment aborder la conversation</h3>
        <p>
          Demandez un rendez-vous calme (pas sur le pas de la porte à
          16h30). Apportez une fiche synthétique : diagnostic, déclencheurs
          connus, ce qui aide, ce qui aggrave. Proposez un plan concret :
          « Quand vous voyez [signe de montée], est-ce que [action
          spécifique] serait possible ? »
        </p>
        <PhoneScript>
          « Mon fils a un TDAH diagnostiqué. Les crises ne sont pas du
          mauvais comportement — son cerveau réagit trop vite. Est-ce qu'on
          pourrait se voir 20 minutes pour mettre en place 2-3 aménagements
          simples qui aident tout le monde ? »
        </PhoneScript>
        <p>
          Si l'école refuse tout aménagement, un courrier du pédopsychiatre
          ou une saisine de la MDPH pour un PAP (Plan d'Accompagnement
          Personnalisé) peut débloquer la situation.
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

        <h2>L'impact des crises répétées sur le couple parental</h2>
        <p>
          Les crises TDAH ne touchent pas que l'enfant. Elles usent le
          couple parental de manière insidieuse. Les désaccords sur « la
          bonne approche » sont la première source de conflit : l'un veut
          être ferme, l'autre veut apaiser, et les deux finissent par se
          reprocher l'échec de l'autre.
        </p>
        <p>
          Quelques repères pour protéger votre couple :
        </p>
        <ul>
          <li>
            <strong>Jamais de désaccord éducatif devant l'enfant en crise</strong>.
            On suit la stratégie du parent présent, on débriefe à deux après.
          </li>
          <li>
            <strong>Alternez les rôles</strong>. Si c'est toujours le même
            parent qui gère les crises, l'épuisement et le ressentiment
            s'installent. « Ce soir c'est toi, demain c'est moi » protège
            les deux.
          </li>
          <li>
            <strong>Nommez l'usure</strong>. Dire « je suis à bout ce soir,
            prends le relais » n'est pas un aveu de faiblesse — c'est de la
            co-régulation parentale.
          </li>
          <li>
            <strong>Parlez TDAH à deux, pas en crise</strong>. Un créneau
            hebdomadaire de 15 minutes (« comment on se sent, qu'est-ce qui
            a marché cette semaine ») suffit à maintenir l'alliance.
          </li>
        </ul>

        <aside className="my-6 rounded-lg border border-border/50 bg-muted/30 px-5 py-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Témoignage
          </div>
          <blockquote className="mt-2 text-foreground/90 italic">
            « On se disputait tous les soirs sur comment gérer les crises de
            notre fille. Le pédopsy nous a dit : "Le problème n'est pas que
            vous n'êtes pas d'accord — c'est que vous en discutez à chaud
            devant elle." On a instauré un point du dimanche soir, 15 minutes
            à la table de la cuisine. En trois semaines, nos disputes ont
            baissé de moitié. Les crises aussi. »
          </blockquote>
          <p className="mt-2 text-sm text-muted-foreground">
            — Couple de parents, fille de 10 ans TDAH prédominance inattentive
          </p>
        </aside>

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
        <p>
          <a
            href="/ressources/plan-de-crise"
            className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            📄 Télécharger le modèle de plan de crise (PDF gratuit)
          </a>
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

        <h2>Quand l'enfant se fait du mal pendant une crise</h2>
        <p>
          Certains enfants TDAH, particulièrement ceux avec une
          dysrégulation émotionnelle sévère, présentent des comportements
          d'auto-agression pendant les crises : se cogner la tête contre
          un mur, se griffer, se mordre, se tirer les cheveux. C'est
          terrifiant pour le parent, mais c'est un signal — pas une
          manipulation.
        </p>
        <p>
          <strong>Pendant la crise :</strong> sécurisez l'environnement
          (coussin entre la tête et le mur, retirer les objets coupants),
          restez présent sans contenir physiquement (sauf danger immédiat).
          Ne dites pas « arrête de te faire du mal » — il ne peut pas
          s'arrêter, et cette phrase ajoute de la culpabilité à la
          détresse.
        </p>
        <p>
          <strong>Après la crise :</strong> nommez ce que vous avez
          observé sans dramatiser : « Tu t'es cogné la tête. Je vois
          que c'était très fort. » Notez la fréquence, l'intensité et
          le contexte.
        </p>
        <p>
          <strong>Quand consulter en urgence :</strong> si l'auto-agression
          laisse des marques visibles, se répète quotidiennement, ou si
          l'enfant exprime verbalement vouloir « disparaître » ou « ne plus
          être là ». Dans ce cas, contactez votre pédopsychiatre ou le
          3114 (numéro national de prévention du suicide, 24h/24).
        </p>

        <aside className="my-6 rounded-lg border border-border/50 bg-muted/30 px-5 py-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Témoignage
          </div>
          <blockquote className="mt-2 text-foreground/90 italic">
            « La première fois que ma fille s'est cognée la tête contre le
            mur, j'ai paniqué. J'ai tout arrêté, j'ai pris rendez-vous en
            urgence chez le pédopsy. Il m'a expliqué que c'était une forme
            de décharge sensorielle — pas un signe de folie. Depuis, je
            mets un coussin, je reste à côté, et je note. En trois mois,
            la fréquence a chuté de 80 %. »
          </blockquote>
          <p className="mt-2 text-sm text-muted-foreground">
            — Mère d'une fille de 6 ans, TDAH mixte avec dysrégulation
            émotionnelle
          </p>
        </aside>

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

        <h2>La bonne nouvelle : les crises diminuent</h2>
        <p>
          Si vous lisez cet article en plein chaos, voici ce qu'il faut
          garder en tête : <strong>les crises TDAH diminuent avec le temps</strong>.
          Pas parce que le TDAH disparaît — il ne disparaît pas — mais
          parce que trois facteurs convergent :
        </p>
        <ul>
          <li>
            <strong>Le cerveau mature</strong>. Le cortex préfrontal se
            développe plus lentement chez l'enfant TDAH (environ 3 ans de
            retard), mais il se développe quand même. Un enfant de 12 ans
            a physiologiquement plus de « freins » qu'un enfant de 7 ans.
          </li>
          <li>
            <strong>L'enfant apprend</strong>. Avec le temps et la
            répétition, les stratégies de régulation s'intègrent. La
            respiration, le coin calme, le vocabulaire émotionnel — tout
            cela finit par devenir automatique, même si le chemin est
            long.
          </li>
          <li>
            <strong>Vous apprenez aussi</strong>. Vous identifiez les
            déclencheurs plus vite, vous réagissez avec moins de panique,
            vous anticipez mieux. Votre seuil de tolérance change — non
            pas parce que vous acceptez le chaos, mais parce que vous
            savez exactement quoi faire.
          </li>
        </ul>
        <p>
          Une étude longitudinale du Dr Barkley montre que les familles
          qui combinent un suivi comportemental (type PEHP), un traitement
          médicamenteux adapté et des aménagements scolaires voient une
          réduction de <strong>60 à 70 % de la fréquence des crises</strong>{" "}
          en 12 à 18 mois. Ce n'est pas magique — c'est le résultat d'un
          travail quotidien, structuré, et soutenu.
        </p>
        <p>
          Le fait que vous soyez en train de lire cet article est déjà
          un signal fort : vous cherchez à comprendre, pas à contrôler.
          C'est exactement ce dont votre enfant a besoin.
        </p>

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
          <li>L'auto-agression est un signal, pas une manipulation.</li>
          <li>L'alliance du couple parental se protège activement.</li>
          <li>L'école est un partenaire à informer, pas un adversaire.</li>
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
    triggers: ["mood:low", "agitation:high"],
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
    triggers: ["mood-trend:down", "consistency:low"],
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
    triggers: ["mood-trend:down", "mood:low"],
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
      "apres-le-diagnostic-tdah-parcours-de-soins",
      "troubles-sommeil-tdah-enfant",
      "dysregulation-emotionnelle-tdah",
    ],
    triggers: ["focus:low", "routines:broken"],
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
    triggers: ["agitation:high", "impulse:high"],
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
    triggers: ["sleep:low"],
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

        <p className="lead mt-10">
          Merci d'avoir pris 4 minutes pour lire ça. Votre rôle de
          grand-parent compte énormément. Votre petit-enfant, même quand il
          crie ou pleure, a besoin de votre regard bienveillant. Vous avez
          déjà, juste en lisant jusqu'ici, commencé à être un·e meilleur·e
          allié·e.
        </p>
      </>
    ),
  },

  {
    slug: "mini-guide-co-parent-tdah",
    title: "TDAH : parler d'une seule voix, même séparés",
    metaTitle:
      "Co-parentalité TDAH : 5 règles pour parler d'une seule voix | Tokō",
    metaDescription:
      "Votre enfant a un TDAH et vous êtes séparé·e du co-parent ? 5 règles simples pour qu'il ne paie pas le prix de vos désaccords éducatifs.",
    excerpt:
      "Votre enfant TDAH a deux maisons ? 5 règles simples pour éviter qu'il paie le prix de vos désaccords éducatifs.",
    cluster: "Pour l'entourage",
    readTime: "5 min",
    audience: "entourage",
    ctaLabel: "Découvrir Tokō",
    ctaTarget: "dashboard",
    related: [
      "co-regulation-parent-enfant-tdah",
      "dysregulation-emotionnelle-tdah",
    ],
    content: (
      <>
        <p className="lead">
          Vous coparentez un enfant TDAH, que vous soyez en couple, séparés,
          divorcés, en garde alternée. Vous lisez ceci parce qu'un des deux
          parents veut qu'on avance ensemble. Bonne nouvelle : <strong>votre
            enfant a besoin de cohérence, pas de perfection</strong>. Voici 5
          règles simples pour lui offrir ça, sans épuiser votre relation
          adulte.
        </p>

        <h2>Pourquoi la cohérence compte plus pour lui que pour les autres enfants</h2>
        <p>
          Un enfant TDAH a une <strong>mémoire de travail réduite</strong> et
          des <strong>fonctions exécutives immatures</strong>. Concrètement :
          s'il doit retenir que chez papa on mange avec les mains pour les
          frites mais pas chez maman, il plante. S'il entend que le coucher
          est à 20h30 ici et 21h15 là-bas, il oublie les deux. Multiplier les
          règles, c'est augmenter sa charge cognitive — et donc ses crises.
        </p>

        <h2>Règle 1 — Tenir les mêmes 5 règles cardinales</h2>
        <p>
          Pas besoin d'harmoniser votre déco, vos menus ou vos sorties.
          Tenez-vous d'accord sur <strong>5 règles maximum</strong>, celles
          qui structurent la journée d'un enfant TDAH :
        </p>
        <ul>
          <li>Heure du coucher (même horaire chez les deux parents)</li>
          <li>Temps d'écran quotidien (même limite, même règle)</li>
          <li>Moment et durée des devoirs</li>
          <li>Comportements non négociables (violence, insultes)</li>
          <li>Rituels d'apaisement en cas de crise</li>
        </ul>
        <p>
          Le reste : chacun sa maison, chacun son style. C'est sain.
        </p>

        <h2>Règle 2 — Ne jamais critiquer l'autre parent devant l'enfant</h2>
        <p>
          « Chez ta mère c'est le bazar. » « Ton père ne sait pas s'y
          prendre. » Un enfant TDAH absorbe ces phrases comme un buvard, et
          il en tire une conclusion terrible : <em>« C'est moi le problème
            entre eux. »</em> Les désaccords adultes se règlent entre adultes,
          hors de la présence de l'enfant, idéalement par message écrit à
          froid.
        </p>

        <h2>Règle 3 — Partager ce que vous observez, pas vos interprétations</h2>
        <p>
          <strong>Oui</strong> : « Il n'a pas dormi avant 23h vendredi. »
          <br />
          <strong>Non</strong> : « Il n'a pas dormi parce que tu le laisses
          regarder la télé trop tard. »
        </p>
        <p>
          Partager des faits (heures, événements, crises, déclencheurs) est
          utile et aide le pédopsy. Partager des interprétations ouvre un
          procès. C'est exactement ce que fait une appli comme Tokō : un
          journal de faits observables, pas un tribunal.
        </p>

        <h2>Règle 4 — Se relayer, pas se concurrencer</h2>
        <p>
          Un parent épuisé ne peut pas co-réguler calmement une crise. Si
          l'autre parent a passé un week-end difficile, ne marquez pas un
          point — proposez du relais. Un enfant TDAH épuise deux adultes ;
          vos énergies doivent se compenser, pas s'ajouter dans un même
          moment.
        </p>

        <h2>Règle 5 — Partager un outil de suivi commun</h2>
        <p>
          Si vous êtes d'accord, partager un outil (un carnet, une appli, un
          tableau) où les deux parents notent les observations permet :
        </p>
        <ul>
          <li>D'éviter les guerres de souvenirs en consultation</li>
          <li>De voir les patterns sur la durée, pas sur un week-end</li>
          <li>De rendre l'enfant moins messager entre vous</li>
        </ul>

        <h2>Et si l'autre parent ne veut pas collaborer ?</h2>
        <p>
          C'est une situation douloureuse mais fréquente. Quelques repères :
        </p>
        <ul>
          <li>
            Ne tentez pas de convaincre par le conflit — ça échoue toujours
          </li>
          <li>
            Partagez du contenu éducatif neutre (comme cet article), sans
            pression
          </li>
          <li>
            Proposez une consultation commune avec le pédopsy (un tiers
            neutre change tout)
          </li>
          <li>
            Concentrez-vous sur ce que vous pouvez tenir <em>chez vous</em>.
            Un environnement stable chez un seul parent vaut mieux que deux
            environnements instables.
          </li>
        </ul>

        <h2>En résumé</h2>
        <ul>
          <li>5 règles cardinales communes, le reste libre chez chacun</li>
          <li>Ne jamais critiquer l'autre parent devant l'enfant</li>
          <li>Partager des observations, pas des jugements</li>
          <li>Se relayer dans la fatigue, pas se concurrencer</li>
          <li>Un outil commun vaut dix disputes de souvenirs</li>
        </ul>
      </>
    ),
  },

  {
    slug: "mini-guide-parrains-marraines-tdah",
    title: "Être le parrain cool d'un enfant TDAH",
    metaTitle:
      "Parrains, marraines, proches : accompagner un enfant TDAH | Tokō",
    metaDescription:
      "Votre filleul·e a un TDAH ? Comment vos week-ends et votre présence peuvent devenir une vraie bulle d'oxygène sans épuiser ses parents.",
    excerpt:
      "Vos week-ends et votre présence peuvent devenir une vraie bulle d'oxygène. Voici comment — sans jamais épuiser ses parents.",
    cluster: "Pour l'entourage",
    readTime: "4 min",
    audience: "entourage",
    ctaLabel: "Découvrir Tokō",
    ctaTarget: "dashboard",
    related: [
      "mini-guide-grands-parents-tdah",
      "co-regulation-parent-enfant-tdah",
    ],
    content: (
      <>
        <p className="lead">
          Vous êtes parrain, marraine, tonton, tata, ou ami·e proche. Votre
          filleul·e ou le fils/la fille de vos amis a un TDAH. Vous voulez
          être là, sans gaffer, sans épuiser ses parents. Ce mini-guide est
          pour vous. En 4 minutes, vous saurez exactement comment jouer votre
          rôle — qui est immense.
        </p>

        <h2>Votre place est unique (et précieuse)</h2>
        <p>
          Vous n'êtes ni un parent, ni un professeur, ni un thérapeute. Vous
          êtes <strong>un adulte affectueux et non-évaluateur</strong>. C'est
          ce dont un enfant TDAH manque le plus : un regard d'adulte qui ne
          note pas, ne corrige pas, ne punit pas. Juste qui l'aime.
        </p>

        <h2>3 choses qui font de vous un·e super allié·e</h2>
        <h3>1. Vous n'êtes pas dans l'urgence du quotidien</h3>
        <p>
          Les parents gèrent les devoirs, les crises du soir, les appels de
          l'école. Vous, vous venez pour le plaisir. Ça change tout : votre
          patience est intacte, votre enthousiasme aussi.
        </p>
        <h3>2. Vous êtes un refuge hors du cercle école/maison</h3>
        <p>
          Un après-midi chez vous, une balade, une sortie sans enjeu : pour
          un enfant TDAH qui se sent constamment évalué (par l'école, par la
          famille, par lui-même), c'est une <strong>bulle d'oxygène</strong>.
          Il peut juste être lui, sans devoir réussir quelque chose.
        </p>
        <h3>3. Vous soulagez ses parents — ils le méritent</h3>
        <p>
          Parent d'enfant TDAH, c'est fatigant. Vraiment. Proposer de
          prendre le gamin un samedi après-midi, c'est offrir à ses parents
          une sieste, une douche tranquille, un café à deux. Vous ne faites
          pas juste une faveur à l'enfant, vous soignez toute la famille.
        </p>

        <h2>5 gestes concrets qui marchent</h2>
        <ul>
          <li>
            <strong>Simplifiez le programme.</strong> Une activité maximum
            par sortie. Un enfant TDAH fatigue vite dans la nouveauté.
          </li>
          <li>
            <strong>Prévenez les transitions.</strong> « Dans 10 minutes on
            part. Dans 5 minutes on range. » Prévenir évite les crises.
          </li>
          <li>
            <strong>Acceptez son intensité.</strong> Il parle fort, bouge
            beaucoup, s'enthousiasme à 200 % ? C'est normal, c'est lui. Ne
            le rabrouez pas pour « se tenir mieux ».
          </li>
          <li>
            <strong>Créez UN rituel à vous.</strong> Le goûter crêpes du
            dimanche chez vous. Un signe de main secret. Un surnom. Un enfant
            TDAH adore les repères affectifs stables.
          </li>
          <li>
            <strong>Envoyez un message à ses parents après la garde.</strong>
            « Tout s'est super bien passé, on a fait X, il a mangé Y. Repos
            pour lui à partir de maintenant. » Ça rassure et ça crédite.
          </li>
        </ul>

        <h2>3 pièges dans lesquels ne pas tomber</h2>
        <ul>
          <li>
            <strong>Le piège du « chez moi il se tient bien ».</strong> Si ça
            se passe bien chez vous, c'est parce que c'est nouveau, calme,
            sans enjeu. Ne concluez pas que ses parents s'y prennent mal.
          </li>
          <li>
            <strong>Le piège des conseils éducatifs.</strong> Ses parents
            lisent, réfléchissent, consultent. Vos conseils, même
            bien-intentionnés, peuvent blesser. Demandez plutôt : « De quoi
            vous auriez besoin ? »
          </li>
          <li>
            <strong>Le piège du « petit caprice ».</strong> Ses crises sont
            neurologiques. Ce n'est pas un caprice. Ne punissez pas, ne
            moquez pas, ne comparez pas. Restez calme, proposez un retour au
            calme.
          </li>
        </ul>

        <h2>Ce qu'un parent épuisé aimerait entendre de vous</h2>
        <ul>
          <li><em>« J'ai vu un article, c'est dingue de découvrir ce que tu vis au quotidien. »</em></li>
          <li><em>« Tu veux que je le prenne samedi pour te souffler ? »</em></li>
          <li><em>« T'es un·e bon·ne parent. Je te le dis. »</em></li>
        </ul>

        <h2>En résumé</h2>
        <ul>
          <li>Votre rôle de parrain/marraine/proche est unique et précieux</li>
          <li>Une activité à la fois, prévenir les transitions</li>
          <li>Acceptez l'intensité de l'enfant</li>
          <li>Soulagez ses parents sans les juger</li>
          <li>Un rituel stable avec vous vaut dix sorties spectaculaires</li>
        </ul>
      </>
    ),
  },

  // ─── Cluster: Parcours de soins ─────────────────────────────────────
  {
    slug: "apres-le-diagnostic-tdah-parcours-de-soins",
    title:
      "Après le diagnostic TDAH : votre parcours de soins en 6 étapes",
    metaTitle:
      "Après le diagnostic TDAH : qui consulter ? Parcours de soins 2026 | Tokō",
    metaDescription:
      "Votre enfant vient d'être diagnostiqué TDAH ? Voici les 6 étapes concrètes : quel professionnel, quand, combien ça coûte, et quoi dire au téléphone pour chaque rendez-vous.",
    excerpt:
      "Vous venez d'apprendre le diagnostic. Respirez. Voici 6 étapes concrètes — nom du professionnel, délai, remboursement, et la phrase exacte à dire au téléphone.",
    cluster: "Parcours de soins",
    readTime: "10 min",
    ctaLabel: "Préparer mon prochain rendez-vous",
    ctaTarget: "symptoms",
    lastReviewedAt: "2026-04-05",
    sourceTier: "expert-consensus",
    related: [
      "crise-tdah-enfant-guide-complet",
      "fonctions-executives-tdah-enfant",
    ],
    faq: [
      {
        question: "Dois-je attendre d'avoir tous les professionnels avant d'agir ?",
        answer:
          "Non. Le dossier MDPH et le contact avec l'école peuvent démarrer dès cette semaine, en parallèle des rendez-vous médicaux. Le délai MDPH (4 à 8 semaines) ne doit pas bloquer le reste.",
      },
      {
        question:
          "Tous les pédopsychiatres comprennent-ils le TDAH ?",
        answer:
          "Non. Demandez explicitement si le praticien suit régulièrement des enfants TDAH. Un pédopsychiatre généraliste peut être compétent, mais un praticien qui voit peu de TDAH peut orienter maladroitement. N'hésitez pas à poser la question lors de la prise de rendez-vous.",
      },
      {
        question: "Est-ce que je dois tout payer moi-même ?",
        answer:
          "Non. Le TDAH est reconnu comme ALD (affection longue durée), ce qui ouvre une prise en charge à 100 % pour les actes médicaux liés. Certaines consultations psychologiques sont remboursées (Mon Soutien Psy, 20 séances/an). L'ergothérapeute et le psychomotricien restent majoritairement à votre charge, sauf prise en charge MDPH.",
      },
      {
        question: "Combien de temps pour obtenir un rendez-vous ?",
        answer:
          "En secteur public (CMP, CMPP, hôpital), comptez 3 à 12 mois. En secteur libéral, 1 à 3 mois. Inscrivez-vous sur plusieurs listes d'attente simultanément, cela multiplie vos chances.",
      },
      {
        question: "Mon enfant a besoin d'un traitement médicamenteux ?",
        answer:
          "C'est une décision strictement médicale, à prendre avec votre neuropédiatre ou pédopsychiatre après un bilan complet. Cet article ne répond pas à cette question : il vous aide à trouver les bons professionnels pour la poser.",
      },
      {
        question: "PAP ou PPS : quelle différence à l'école ?",
        answer:
          "Le PAP (Plan d'Accompagnement Personnalisé) est mis en place par l'école, sans MDPH, pour des aménagements simples (tiers-temps, placement, consignes reformulées). Le PPS (Projet Personnalisé de Scolarisation) passe par la MDPH et peut inclure une AESH (accompagnante) si les troubles sont importants.",
      },
    ],
    content: (
      <>
        <p className="lead">
          Vous tenez ce rapport de 2 pages depuis ce matin. Le neuropédiatre
          a dit « suivi pluridisciplinaire » et vous a souhaité bon courage.
          Vous ne savez pas par qui commencer. Vous n'êtes pas seul·e. Voici
          6 étapes concrètes — à votre rythme.
        </p>

        <div className="my-6 rounded-lg border border-warning-border bg-warning-surface px-4 py-3 text-warning-foreground">
          <div className="text-xs font-semibold uppercase tracking-wide">
            À lire avant de commencer
          </div>
          <div className="mt-1 text-sm">
            Ce guide ne remplace pas l'avis de votre médecin. Il vous aide à
            naviguer le système de soins français, pas à décider à la place
            d'un professionnel. Prenez votre temps : vous n'avez pas à tout
            faire cette semaine.
          </div>
        </div>

        <h2>Étape 1 · Informer l'école (cette semaine)</h2>

        <h3>Qui ? À quoi ça sert ?</h3>
        <p>
          La maîtresse ou le maître de votre enfant, et idéalement le
          directeur/la directrice. Ils doivent savoir que le diagnostic est
          posé, pour adapter leur regard et accepter des aménagements en
          attendant le dossier MDPH.
        </p>

        <h3>Quand ?</h3>
        <p>
          Dès cette semaine. N'attendez pas. Un simple email ou un rendez-vous
          de 15 minutes suffit. L'enseignant·e n'a pas besoin du rapport
          complet — une information claire suffit.
        </p>

        <h3>Combien ? Remboursement ?</h3>
        <p>Gratuit.</p>

        <PhoneScript>
          « Bonjour, je souhaite vous informer que notre enfant [prénom]
          vient d'être diagnostiqué·e avec un TDAH. Nous démarrons un suivi
          avec plusieurs professionnels. J'aimerais qu'on se rencontre
          15 minutes pour vous expliquer ce qui peut l'aider en classe —
          au calme, quand vous avez un moment. »
        </PhoneScript>

        <h3>Documents à apporter</h3>
        <ul>
          <li>
            Une courte note (½ page) : diagnostic, comportements observés,
            aménagements qui aident à la maison.
          </li>
          <li>
            <strong>Pas besoin</strong> du rapport médical complet. Votre
            enfant reste un élève, pas un dossier.
          </li>
        </ul>

        <h2>Étape 2 · Déposer le dossier MDPH (cette semaine)</h2>

        <h3>Qui ? À quoi ça sert ?</h3>
        <p>
          La <strong>MDPH</strong> (Maison Départementale des Personnes
          Handicapées) de votre département examine les demandes
          d'aménagements scolaires officiels (PAP, PPS), d'AESH
          (accompagnant·e), et de prise en charge de certains soins
          (ergothérapeute, psychomotricien).
        </p>

        <h3>Quand ?</h3>
        <p>
          Cette semaine. Le délai de traitement est de{" "}
          <strong>4 à 8 mois</strong>. Plus vous commencez tôt, plus les
          aides arrivent tôt. C'est le point le plus souvent négligé par les
          parents — et celui qui coûte le plus de temps perdu.
        </p>

        <h3>Combien ? Remboursement ?</h3>
        <p>Gratuit.</p>

        <PhoneScript>
          « Bonjour, je souhaite déposer un dossier MDPH pour mon enfant
          qui vient d'être diagnostiqué·e TDAH. Pouvez-vous m'envoyer le
          formulaire de demande et la liste des pièces à joindre ? »
        </PhoneScript>

        <h3>Documents à apporter</h3>
        <ul>
          <li>Rapport de diagnostic (neuropédiatre ou pédopsychiatre)</li>
          <li>
            Certificat médical (Cerfa n°15695*01) rempli par votre médecin
          </li>
          <li>Livret de famille, justificatif de domicile</li>
          <li>
            Projet de vie : quelques lignes sur les difficultés et besoins de
            l'enfant
          </li>
        </ul>

        <h2>Étape 3 · Pédopsychiatre (mois 1 à 2)</h2>

        <h3>Qui ? À quoi ça sert ?</h3>
        <p>
          Spécialiste de santé mentale de l'enfant. Confirme le diagnostic,
          évalue les <strong>troubles associés</strong> (anxiété, troubles
          du sommeil, TSA, DYS), et peut prescrire un traitement
          médicamenteux si nécessaire.
        </p>

        <h3>Quand ?</h3>
        <p>
          Dans les 2 mois après le diagnostic. Premier rendez-vous : 60 à
          90 minutes. Suivi ensuite tous les 3 à 6 mois.
        </p>

        <h3>Combien ? Remboursement ?</h3>
        <p>
          Secteur public (CMP, hôpital) : <strong>gratuit</strong>, mais
          délai de 3 à 12 mois. Secteur libéral :{" "}
          <strong>50 à 120 € par séance</strong>, remboursé à 70 % par la
          Sécu si le pédopsychiatre est conventionné, le reste par votre
          mutuelle. Avec la reconnaissance ALD (affection longue durée), la
          prise en charge monte à 100 % pour les actes liés au TDAH.
        </p>

        <PhoneScript>
          « Bonjour, je cherche un premier rendez-vous pour mon enfant
          de [âge] ans qui vient d'être diagnostiqué·e TDAH par un
          neuropédiatre. Suivez-vous régulièrement des enfants TDAH ?
          Quel est votre délai pour un premier rendez-vous ? »
        </PhoneScript>

        <h3>Documents à apporter</h3>
        <ul>
          <li>Rapport de diagnostic du neuropédiatre</li>
          <li>Bilans déjà réalisés (psychologue, orthophoniste)</li>
          <li>
            Observations écrites : comportements à la maison, à l'école,
            fréquence des crises
          </li>
          <li>Carnet de santé de l'enfant</li>
        </ul>

        <h2>Étape 4 · Psychologue TCC (mois 2 à 3)</h2>

        <h3>Qui ? À quoi ça sert ?</h3>
        <p>
          Psychologue formé·e aux{" "}
          <strong>thérapies cognitivo-comportementales (TCC)</strong>.
          Travaille avec l'enfant sur la gestion des émotions, l'estime de
          soi, les habiletés sociales, et la mise en place de stratégies
          concrètes pour le quotidien.
        </p>

        <h3>Quand ?</h3>
        <p>
          À partir du mois 2 ou 3, une fois le diagnostic confirmé par le
          pédopsychiatre. 1 séance par semaine ou toutes les 2 semaines,
          pendant 6 à 12 mois selon les besoins.
        </p>

        <h3>Combien ? Remboursement ?</h3>
        <p>
          <strong>Mon Soutien Psy</strong> : 12 séances/an remboursées à 100 %
          sur orientation du médecin traitant (liste de psychologues
          conventionnés). Hors dispositif : <strong>50 à 80 € par séance</strong>
          , partiellement remboursé par les mutuelles.
        </p>

        <PhoneScript>
          « Bonjour, je cherche un·e psychologue pour mon enfant de [âge]
          ans diagnostiqué·e TDAH. Travaillez-vous en TCC avec les enfants
          TDAH ? Êtes-vous conventionné·e Mon Soutien Psy ? »
        </PhoneScript>

        <h3>Documents à apporter</h3>
        <ul>
          <li>Rapport de diagnostic</li>
          <li>Orientation écrite du médecin traitant (pour Mon Soutien Psy)</li>
          <li>Observations du quotidien (crises, déclencheurs, contextes)</li>
        </ul>

        <h2>Étape 5 · Orthophoniste (si troubles du langage)</h2>

        <h3>Qui ? À quoi ça sert ?</h3>
        <p>
          Prise en charge des difficultés de langage oral, de lecture, de
          compréhension, de fluidité verbale. <strong>Conditionnel</strong> :
          uniquement si le bilan révèle un trouble associé (DYS) ou des
          difficultés de communication.
        </p>

        <h3>Quand ?</h3>
        <p>
          Si votre enfant a des difficultés scolaires en lecture, écriture
          ou expression orale. Un bilan orthophonique (1 à 2 séances) précède
          toute rééducation.
        </p>

        <h3>Combien ? Remboursement ?</h3>
        <p>
          Sur prescription du médecin traitant :{" "}
          <strong>remboursé à 60 % par la Sécu</strong>, le reste par la
          mutuelle. Séance : 30 à 50 €. Délai pour trouver un·e
          orthophoniste : 6 à 18 mois selon la région.
        </p>

        <PhoneScript>
          « Bonjour, je cherche un·e orthophoniste pour mon enfant de [âge]
          ans, diagnostiqué·e TDAH, qui présente [préciser :
          difficultés de lecture / de langage oral…]. Acceptez-vous de
          nouveaux patients ? Quel est votre délai ? »
        </PhoneScript>

        <h3>Documents à apporter</h3>
        <ul>
          <li>Ordonnance du médecin traitant</li>
          <li>Rapport de diagnostic TDAH</li>
          <li>Bulletins scolaires récents</li>
        </ul>

        <h2>Étape 6 · Psychomotricien·ne ou Ergothérapeute (si besoin)</h2>

        <h3>Qui ? À quoi ça sert ?</h3>
        <p>
          <strong>Psychomotricien·ne</strong> : travaille la coordination
          motrice, l'équilibre, la régulation sensorielle (utile si votre
          enfant est hypersensible au bruit, au toucher, aux textures).{" "}
          <strong>Ergothérapeute</strong> : propose des aménagements concrets
          (matériel scolaire adapté, organisation de l'espace, outils
          d'autonomie quotidienne).
        </p>

        <h3>Quand ?</h3>
        <p>
          Sur recommandation du pédopsychiatre ou du neuropédiatre, selon les
          besoins spécifiques de votre enfant. Pas systématique.
        </p>

        <h3>Combien ? Remboursement ?</h3>
        <p>
          <strong>Hors nomenclature Sécurité sociale</strong> dans la plupart
          des cas : 40 à 70 € par séance, à votre charge. Certaines mutuelles
          remboursent un forfait annuel. <strong>La MDPH peut financer
            partiellement</strong> via l'AEEH (Allocation d'Éducation de l'Enfant
          Handicapé) — raison de plus pour déposer le dossier tôt (étape 2).
        </p>

        <PhoneScript>
          « Bonjour, je cherche un·e psychomotricien·ne [ou ergothérapeute]
          qui travaille avec des enfants TDAH. Mon enfant de [âge] ans
          présente [difficultés motrices / hypersensibilité sensorielle /
          besoin d'aménagements scolaires]. Avez-vous de la place ? »
        </PhoneScript>

        <h3>Documents à apporter</h3>
        <ul>
          <li>Prescription ou recommandation du médecin</li>
          <li>Rapport de diagnostic TDAH</li>
          <li>Bilans antérieurs si existants</li>
        </ul>

        <h2>Vous n'êtes pas seul·e</h2>
        <p>
          Ces 6 étapes peuvent s'étaler sur 6 à 12 mois. Vous n'avez pas à
          tout faire cette semaine. Commencez par les étapes 1 et 2 (école +
          MDPH), puis laissez les rendez-vous médicaux arriver à leur rythme.
          Notez chaque appel, chaque rendez-vous, chaque question — un journal
          structuré vaut mille souvenirs éparpillés.
        </p>
        <p>
          Si vous doutez d'un professionnel, demandez un second avis. Si
          vous doutez de vous, relisez cette phrase : vous avez ouvert cette
          app, lu ce guide, et commencé à agir. C'est déjà énorme.
        </p>
      </>
    ),
  },

  // ─── #64 — Médication ──────────────────────────────────────────────
  {
    slug: "medication-tdah-mythes-parents",
    title: "Médication TDAH : les mythes que tout parent entend",
    metaTitle:
      "Médication TDAH enfant : démêler le vrai du faux | Tokō",
    metaDescription:
      "Méthylphénidate, personnalité, effets secondaires : les 5 mythes les plus fréquents sur la médication TDAH, déconstruits avec les données HAS et INSERM.",
    excerpt:
      "« Les médicaments vont le zombifier. » Non. 70 à 80 % des enfants TDAH répondent bien à un traitement correctement dosé. Voici ce que disent vraiment les données.",
    cluster: "Parcours de soins",
    readTime: "6 min",
    ctaLabel: "Suivre les symptômes de mon enfant",
    ctaTarget: "symptoms",
    lastReviewedAt: "2026-04-07",
    sourceTier: "guideline",
    related: [
      "apres-le-diagnostic-tdah-parcours-de-soins",
      "dysregulation-emotionnelle-tdah",
      "motivation-delai-tdah-pourquoi-punition-echoue",
    ],
    triggers: ["mood-trend:down", "consistency:low"],
    faq: [
      {
        question: "Le méthylphénidate change-t-il la personnalité de mon enfant ?",
        answer:
          "Non. Le méthylphénidate améliore l'attention et réduit l'impulsivité, il ne touche pas à la personnalité. Si votre enfant semble « éteint », c'est un signe de surdosage — parlez-en à son médecin pour ajuster la dose.",
      },
      {
        question: "Les traitements TDAH créent-ils une dépendance ?",
        answer:
          "Les études sur plus de 30 ans (INSERM 2022) ne montrent aucun risque accru de dépendance chez les enfants traités pour un TDAH diagnostiqué. Au contraire, le non-traitement augmente le risque de conduites addictives à l'adolescence.",
      },
      {
        question: "Peut-on se passer de médicaments avec le TDAH ?",
        answer:
          "Pour un TDAH léger, les approches comportementales seules peuvent suffire. Pour un TDAH modéré à sévère, les recommandations HAS 2017 et AAP 2019 indiquent une combinaison médicament + accompagnement comportemental comme traitement de référence.",
      },
    ],
    content: (
      <>
        <p className="lead">
          Quand le pédopsychiatre prononce le mot « méthylphénidate », la
          plupart des parents entendent « drogue ». Les forums, les
          grands-parents et parfois même le médecin traitant ajoutent leur
          couche de mythes. Déconstruisons les cinq plus tenaces, données en
          main.
        </p>

        <h2>Mythe 1 : « Les médicaments vont le zombifier »</h2>
        <p>
          Le méthylphénidate et les amphétamines réduisent la distractibilité
          et l'impulsivité. Ils <strong>n'effacent pas</strong> la
          personnalité de votre enfant. Un enfant qui semble « éteint » sous
          traitement est probablement <strong>surdosé</strong> — c'est un
          signal pour ajuster, pas pour arrêter.
        </p>

        <h2>Mythe 2 : « Si les médicaments ne marchent pas, c'est que ce
          n'est pas un vrai TDAH »</h2>
        <p>
          <strong>70 à 80 %</strong> des enfants TDAH répondent positivement
          à un psychostimulant correctement dosé (HAS 2017, INSERM 2022).
          Quand ça « ne marche pas », c'est souvent que la dose est trop
          basse. Un traitement sous-dosé = pas d'effet visible ≠ échec du
          traitement. L'ajustement (titration) prend parfois plusieurs
          semaines.
        </p>

        <h2>Mythe 3 : « Il faut d'abord tout essayer avant la chimie »</h2>
        <p>
          Les approches non médicamenteuses (psychoéducation, Barkley PEHP,
          aménagements scolaires) sont <strong>complémentaires</strong>, pas
          des alternatives. Pour un TDAH modéré à sévère, retarder le
          traitement médicamenteux en espérant que « ça passe » expose
          l'enfant à l'échec scolaire, au rejet social et à une estime de
          soi en chute libre.
        </p>

        <h2>Mythe 4 : « Les effets secondaires sont terribles »</h2>
        <p>
          Les effets secondaires les plus fréquents — perte d'appétit en
          journée, endormissement retardé, parfois tics — sont{" "}
          <strong>gérables</strong> avec un ajustement de dose, d'horaire ou
          de molécule. Ils doivent être surveillés, pas redoutés. Un suivi
          régulier avec le prescripteur est indispensable.
        </p>

        <h2>Mythe 5 : « Les médicaments rendent dépendant »</h2>
        <p>
          Plus de 30 ans de recul (INSERM 2022) : aucun risque accru de
          dépendance chez les enfants traités pour un TDAH diagnostiqué. En
          revanche, le <strong>non-traitement</strong> augmente le risque de
          conduites addictives à l'adolescence — les données sont claires.
        </p>

        <h2>Ce qui compte vraiment</h2>
        <p>
          La décision médicamenteuse appartient au pédopsychiatre, en dialogue
          avec vous. Votre rôle : observer, noter les effets (positifs et
          négatifs) au quotidien, et en parler en consultation. C'est
          exactement ce que permet le suivi des symptômes dans Tokō.
        </p>
        <p>
          Chaque stratégie comportementale s'ajoute au traitement — elle ne
          le remplace pas. À combiner avec une évaluation médicale régulière
          par le spécialiste qui suit votre enfant.
        </p>
      </>
    ),
  },

  // ─── #65 — Écrans ──────────────────────────────────────────────────
  {
    slug: "tdah-ecrans-ne-causent-pas",
    title: "Les écrans n'ont pas causé le TDAH de votre enfant",
    metaTitle:
      "Écrans et TDAH : non, les écrans ne causent pas le TDAH | Tokō",
    metaDescription:
      "Le TDAH est héréditaire à 75-80 %. Les écrans n'en sont pas la cause. Ce qu'ils changent vraiment, et comment gérer le temps d'écran sans culpabiliser.",
    excerpt:
      "Non, les écrans n'ont pas « donné » le TDAH à votre enfant. Ce qu'ils font vraiment, et les règles qui marchent pour les familles TDAH.",
    cluster: "Mythes & vérités",
    readTime: "5 min",
    ctaLabel: "Suivre les routines de mon enfant",
    ctaTarget: "symptoms",
    lastReviewedAt: "2026-04-07",
    sourceTier: "peer-reviewed",
    related: [
      "medication-tdah-mythes-parents",
      "fonctions-executives-tdah-enfant",
      "dysregulation-emotionnelle-tdah",
    ],
    triggers: ["routines:broken"],
    faq: [
      {
        question: "Les écrans peuvent-ils aggraver les symptômes TDAH ?",
        answer:
          "Les écrans ne causent pas le TDAH, mais ils peuvent exacerber la dysrégulation dans l'instant : surcharge sensorielle, hijacking dopaminergique, difficulté de transition quand on éteint. C'est un problème de gestion, pas de causalité.",
      },
      {
        question: "Faut-il supprimer tous les écrans pour un enfant TDAH ?",
        answer:
          "Non. L'interdiction totale génère frustration et conflits sans traiter le problème. Mieux vaut des règles claires : durée définie, timer visible, récompense immédiate pour le respect du temps (approche Barkley). L'ennemi n'est pas l'écran, c'est l'absence de cadre.",
      },
    ],
    content: (
      <>
        <p className="lead">
          « Si tu lui avais moins donné la tablette… » Cette phrase, vous
          l'avez entendue. De vos parents, d'un collègue, d'un article
          Facebook partagé 12 000 fois. Elle est fausse — et elle vous fait
          du mal.
        </p>

        <h2>Le TDAH est neurodéveloppemental, pas environnemental</h2>
        <p>
          Le TDAH est <strong>héréditaire à 75-80 %</strong> (méta-analyses
          Faraone et al., 2021). C'est l'un des troubles psychiatriques les
          plus génétiquement déterminés. Souvent, l'un des deux parents a
          lui-même un TDAH — diagnostiqué ou non.
        </p>
        <p>
          Les écrans n'existaient pas en 1902 quand le Dr George Still a
          décrit les premiers cas. Le TDAH existait déjà. Il existera avec
          ou sans iPad.
        </p>

        <h2>Ce que les écrans font vraiment</h2>
        <p>
          Les écrans ne <em>causent</em> pas le TDAH, mais ils peuvent{" "}
          <strong>exacerber la dysrégulation dans l'instant</strong> :
        </p>
        <ul>
          <li>
            <strong>Surcharge sensorielle</strong> : lumière, son, mouvement
            rapide — le cerveau TDAH, déjà en difficulté de filtrage, est
            submergé.
          </li>
          <li>
            <strong>Hijacking dopaminergique</strong> : les jeux et réseaux
            sociaux libèrent de la dopamine immédiate. Le cerveau TDAH, en
            déficit dopaminergique chronique, s'y accroche plus fort.
          </li>
          <li>
            <strong>Transition difficile</strong> : éteindre un écran = passer
            d'une activité à haute stimulation à une activité à basse
            stimulation. C'est un déclencheur de crise classique.
          </li>
        </ul>
        <p>
          C'est un problème de <strong>gestion</strong>, pas de{" "}
          <strong>causalité</strong>.
        </p>

        <h2>Les règles qui marchent pour les familles TDAH</h2>
        <ul>
          <li>
            <strong>Timer visible</strong> : un sablier ou un minuteur que
            l'enfant voit. L'abstrait « encore 10 minutes » ne fonctionne pas
            avec un cerveau qui ne perçoit pas le temps.
          </li>
          <li>
            <strong>Récompense immédiate</strong> : « Tu as éteint quand le
            timer a sonné → tu gagnes ta star tout de suite. » Approche
            Barkley : immédiat, fréquent, saillant.
          </li>
          <li>
            <strong>Transition douce</strong> : prévenez 5 minutes avant, puis
            2 minutes avant. Proposez une activité de remplacement concrète
            (pas « va jouer »).
          </li>
          <li>
            <strong>Pas de suppression totale</strong> : l'interdiction génère
            frustration et conflits sans traiter le problème. Cadrer, pas
            punir.
          </li>
        </ul>

        <h2>La culpabilité ne soigne rien</h2>
        <p>
          Vous n'avez pas « donné » le TDAH à votre enfant en le laissant
          regarder un dessin animé. Le TDAH est neurobiologique. Votre
          énergie est mieux investie dans la gestion au quotidien que dans
          la culpabilité rétrospective.
        </p>
        <p>
          Si quelqu'un vous ressort la phrase sur les écrans, vous avez
          maintenant la réponse : 75-80 % d'héritabilité, c'est la science,
          pas Facebook.
        </p>
      </>
    ),
  },

  // ─── #66 — Motivation & punition ───────────────────────────────────
  {
    slug: "motivation-delai-tdah-pourquoi-punition-echoue",
    title: "Motivation, punition et TDAH : pourquoi le long terme ne marche pas",
    metaTitle:
      "Punition et TDAH : pourquoi ça ne marche pas, et quoi faire à la place | Tokō",
    metaDescription:
      "Votre enfant TDAH ignore les conséquences à long terme ? C'est neurobiologique. Le cerveau TDAH sous-évalue les récompenses différées. Voici ce qui marche.",
    excerpt:
      "Votre enfant n'est pas paresseux. Son cerveau sous-évalue les récompenses différées. Comprendre l'aversion au délai pour remplacer la punition par ce qui fonctionne.",
    cluster: "Cognition & école",
    readTime: "6 min",
    ctaLabel: "Découvrir le programme Barkley",
    ctaTarget: "barkley",
    lastReviewedAt: "2026-04-07",
    sourceTier: "peer-reviewed",
    related: [
      "medication-tdah-mythes-parents",
      "fonctions-executives-tdah-enfant",
      "co-regulation-parent-enfant-tdah",
    ],
    triggers: ["routines:broken", "focus:low"],
    faq: [
      {
        question: "Pourquoi mon enfant TDAH ne veut-il pas faire ses devoirs pour avoir de bonnes notes ?",
        answer:
          "Le cerveau TDAH ne peut pas « valoriser » une récompense située dans 4 mois (le bulletin). Ce n'est pas un choix ni de la paresse — c'est un déficit neurobiologique dans le circuit de la récompense. La solution : une récompense immédiate à chaque session de devoirs faite.",
      },
      {
        question: "La punition ne lui apprend-elle pas les limites ?",
        answer:
          "Une punition différée (privation de sortie le week-end pour un comportement du lundi) n'enseigne rien au cerveau TDAH car la connexion cause → conséquence est perdue. Les conséquences immédiates, courtes et prévisibles sont bien plus efficaces.",
      },
    ],
    content: (
      <>
        <p className="lead">
          « Il s'en fiche des conséquences. » « Elle est incapable de se
          motiver. » « Si je ne punis pas, il ne comprendra jamais. » Ces
          phrases reviennent dans chaque famille TDAH. Elles partent d'un
          malentendu fondamental sur le cerveau de votre enfant.
        </p>

        <h2>L'aversion au délai : la clé que personne n'explique</h2>
        <p>
          Le Dr Edmund Sonuga-Barke a démontré que le cerveau TDAH présente
          une <strong>aversion au délai</strong> : il sous-évalue
          massivement une récompense quand elle est éloignée dans le temps.
          Le Dr Russell Barkley parle de{" "}
          <strong>myopie temporelle</strong> — votre enfant ne « voit »
          littéralement pas les conséquences lointaines.
        </p>
        <p>
          Concrètement : « de bonnes notes dans 4 mois » a la même valeur
          motivationnelle pour votre enfant TDAH que « peut-être un jour
          quelque chose de vague ». Son cerveau n'est pas paresseux — il est{" "}
          <strong>neurobiologiquement incapable</strong> de pondérer cette
          information comme un cerveau neurotypique le ferait.
        </p>

        <h2>Pourquoi la punition échoue</h2>
        <ul>
          <li>
            <strong>Différée</strong> : « Privé de sortie samedi pour ton
            comportement de lundi » — le lien cause-conséquence est perdu.
          </li>
          <li>
            <strong>Aversive sans apprentissage</strong> : la punition dit
            « ne fais pas ça » mais n'enseigne pas quoi faire à la place.
          </li>
          <li>
            <strong>Érosion du lien</strong> : les punitions répétées
            génèrent honte, anxiété et opposition — pas de l'obéissance.
          </li>
        </ul>

        <h2>Ce qui marche : immédiat, fréquent, saillant</h2>
        <p>
          Le programme Barkley PEHP repose sur trois principes simples :
        </p>
        <ul>
          <li>
            <strong>Immédiat</strong> : la récompense arrive dans les secondes
            qui suivent le comportement souhaité. Pas demain, pas samedi.
            Maintenant.
          </li>
          <li>
            <strong>Fréquent</strong> : un enfant TDAH a besoin de{" "}
            <strong>plus de feedback positif</strong> qu'un enfant
            neurotypique. Pas 1 compliment par jour — 10, 15.
          </li>
          <li>
            <strong>Saillant</strong> : la récompense doit être concrète et
            visible. Un autocollant, une étoile, un point sur un tableau.
            Pas une phrase abstraite (« tu seras fier de toi »).
          </li>
        </ul>

        <h3>Exemple concret : les devoirs à 17h</h3>
        <p>
          ❌ « Si tu fais tes devoirs toute la semaine, tu auras un cadeau
          samedi. » → Trop loin. Le cerveau TDAH décroche au mot « semaine ».
        </p>
        <p>
          ✅ « Tu as ouvert ton cahier et fait 10 minutes → tu as gagné ta
          star tout de suite. » → Immédiateté + visibilité = motivation.
        </p>
        <p>
          C'est exactement le principe du{" "}
          <Link
            to="/ressources/$slug"
            params={{ slug: "co-regulation-parent-enfant-tdah" }}
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            programme Barkley
          </Link>{" "}
          intégré dans Tokō : un tableau de points quotidien, visuel, avec
          récompenses immédiates et progressives.
        </p>

        <h2>Ce n'est pas de la paresse, c'est de la neurologie</h2>
        <p>
          Votre enfant ne « choisit » pas de s'en ficher. Son cerveau
          fonctionne différemment. Adapter vos attentes à sa neurologie,
          ce n'est pas le « gâter » — c'est lui donner les outils qui
          correspondent à son câblage cérébral.
        </p>
        <p>
          Cette approche s'ajoute — elle ne remplace pas — l'évaluation
          médicale et le suivi par le spécialiste qui accompagne votre
          enfant.
        </p>
      </>
    ),
  },

  // ─── #67 — Crises du parent ────────────────────────────────────────
  {
    slug: "parent-tdah-gerer-mes-propres-crises",
    title: "Gérer mes propres crises de parent TDAH : la co-régulation commence par moi",
    metaTitle:
      "Parent TDAH en crise : comment se réguler soi-même d'abord | Tokō",
    metaDescription:
      "Vous ne pouvez pas calmer un enfant dysrégulé si vous êtes vous-même débordé·e. 5 micro-pratiques pour vous réguler d'abord, sans culpabiliser.",
    excerpt:
      "Vous avez crié. Vous avez claqué une porte. Vous n'êtes pas un mauvais parent — vous êtes un parent épuisé face à un enfant dysrégulé. Voici comment commencer par vous.",
    cluster: "Posture parentale",
    readTime: "6 min",
    ctaLabel: "Suivre mon journal parental",
    ctaTarget: "journal",
    lastReviewedAt: "2026-04-07",
    sourceTier: "expert-consensus",
    related: [
      "co-regulation-parent-enfant-tdah",
      "dysregulation-emotionnelle-tdah",
      "crise-tdah-enfant-guide-complet",
    ],
    triggers: ["consistency:low", "mood-trend:down"],
    faq: [
      {
        question: "Est-ce normal de crier sur mon enfant TDAH ?",
        answer:
          "Oui. L'exposition chronique à la dysrégulation d'un enfant active votre propre système de stress. Crier n'est pas un échec moral — c'est un signe d'épuisement nerveux. Ce qui compte, c'est la réparation après et la mise en place de stratégies pour baisser votre charge globale.",
      },
      {
        question: "Comment savoir si j'ai besoin d'une aide extérieure ?",
        answer:
          "Signaux d'alerte : troubles du sommeil récurrents, pensées de type « je n'en peux plus / il serait mieux sans moi », ressentiment persistant envers votre enfant, irritabilité permanente. Un seul de ces signes justifie de parler à un professionnel — pour vous, pas pour votre enfant.",
      },
    ],
    content: (
      <>
        <p className="lead">
          Il est 19h30. Votre enfant vient de faire sa troisième crise de la
          soirée. Vous sentez le sang monter, la mâchoire se serrer, les mots
          durs arriver. Vous criez. Ou vous partez en claquant la porte. Ou
          vous pleurez une fois qu'il est couché. Les trois sont normaux.
          Aucun ne fait de vous un mauvais parent.
        </p>

        <h2>La biologie du parent épuisé</h2>
        <p>
          Vivre avec un enfant TDAH dysrégulé, c'est une exposition
          chronique au stress. Votre système nerveux fonctionne en mode{" "}
          <strong>alerte permanent</strong> : cortisol élevé, sommeil
          fragmenté, hypervigilance. Au bout de quelques mois, votre seuil de
          tolérance s'effondre — c'est physiologique, pas moral.
        </p>
        <p>
          La co-régulation (calmer votre enfant par votre propre calme)
          suppose que <strong>votre</strong> système nerveux soit régulé
          <em> d'abord</em>. Si vous êtes au bord de l'explosion, aucune
          technique parentale ne tiendra. Le masque à oxygène, c'est pour
          vous d'abord.
        </p>

        <h2>5 micro-pratiques pour vous réguler en 90 secondes</h2>
        <h3>1. La règle des 90 secondes</h3>
        <p>
          Une émotion intense dure physiologiquement{" "}
          <strong>90 secondes</strong> (Dr. Jill Bolte Taylor). Si vous tenez
          90 secondes sans agir, la vague retombe. Comptez dans votre tête,
          ou serrez un glaçon dans la main — la sensation physique ancre
          l'attention.
        </p>

        <h3>2. Respiration carrée (box breathing)</h3>
        <p>
          Inspirez 4 secondes → bloquez 4 secondes → expirez 4 secondes →
          bloquez 4 secondes. Trois cycles suffisent pour activer le nerf
          vague et faire baisser la fréquence cardiaque. Faites-le debout
          dans la cuisine, personne ne le remarque.
        </p>

        <h3>3. Aller aux toilettes</h3>
        <p>
          Oui, c'est une stratégie valide. « Je reviens dans 2 minutes »,
          vous fermez la porte, vous respirez. Votre enfant ne va pas mourir
          en 2 minutes. Vous, vous allez redescendre assez pour ne pas dire
          quelque chose que vous regretteriez.
        </p>

        <h3>4. Baisser le volume</h3>
        <p>
          Plus l'enfant crie, plus vous parlez bas. C'est
          contre-intuitif mais puissant : votre voix basse force son cerveau à
          se calmer pour entendre. Et votre propre ton calme vous calme aussi
          (feedback somatique).
        </p>

        <h3>5. Le mantra de sortie</h3>
        <p>
          Choisissez une phrase courte que vous répétez en boucle intérieure :
          « Ce n'est pas contre moi. » « C'est son cerveau, pas un choix. »
          « Je peux revenir dans 2 minutes. » La phrase remplace la narration
          toxique (« j'en peux plus, il me rend fou »).
        </p>

        <h2>Après : la réparation</h2>
        <p>
          Vous avez crié. C'est fait. Ce qui compte maintenant : la{" "}
          <strong>réparation</strong>. Le lendemain, quand tout est calme,
          dites simplement :
        </p>
        <p className="rounded-lg border-l-4 border-primary/40 bg-primary/5 px-4 py-3 italic">
          « Hier soir j'ai crié très fort, et je suis désolé·e. J'étais
          fatigué·e et débordé·e. Ce n'est pas ta faute. Je t'aime même
          quand je suis en colère. »
        </p>
        <p>
          Cette réparation <strong>renforce le lien</strong> plus qu'un
          sans-faute. Elle apprend à votre enfant que les adultes aussi
          perdent le contrôle, et surtout qu'on peut revenir, s'excuser et
          réparer.
        </p>

        <h2>Quand c'est trop : les signaux d'alerte</h2>
        <ul>
          <li>
            Vous dormez mal depuis plus de 2 semaines (pas à cause de
            l'enfant)
          </li>
          <li>
            Vous avez du ressentiment chronique envers votre enfant
          </li>
          <li>
            Vous pensez régulièrement « je n'en peux plus » ou « il serait
            mieux sans moi »
          </li>
          <li>Vous évitez le contact physique avec votre enfant</li>
        </ul>
        <p>
          <strong>Un seul</strong> de ces signes justifie d'appeler pour
          vous. Pas pour votre enfant — pour <em>vous</em>. Médecin
          traitant, psychologue, ligne d'écoute
          (3114 — numéro national de prévention du suicide, 24h/24).
        </p>

        <h2>Vous n'êtes pas seul·e</h2>
        <p>
          Vous avez ouvert cette page. Vous cherchez des solutions. Vous
          n'êtes pas un parent défaillant — vous êtes un parent épuisé qui
          se bat pour son enfant. La co-régulation commence par prendre soin
          de vous. Ce n'est pas de l'égoïsme, c'est de la survie parentale.
        </p>
      </>
    ),
  },
];

