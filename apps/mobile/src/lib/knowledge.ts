// Knowledge-base articles — metadata mirrored from the web's static
// resources (apps/web/src/lib/resources-data.tsx). The full rich article
// (web JSX) opens in the browser; the mobile app lists them natively.
export type KnowledgeArticle = {
  slug: string;
  title: string;
  excerpt: string;
  cluster: string;
  readTime: string;
};

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    slug: "crise-tdah-enfant-guide-complet",
    title: "Crise TDAH chez l'enfant : le guide complet",
    excerpt: "Le guide de référence pour comprendre et traverser les crises TDAH : mécanismes neurologiques, co-régulation, plan d'action avant, pendant et après.",
    cluster: "Pillar · Connaissance TDAH",
    readTime: "20 min",
  },
  {
    slug: "dysregulation-emotionnelle-tdah",
    title: "Dysrégulation émotionnelle et TDAH : comprendre les réactions intenses",
    excerpt: "Pourquoi votre enfant TDAH réagit trop fort, trop vite, trop longtemps — et ce que la science dit pour l'aider.",
    cluster: "Connaissance TDAH",
    readTime: "8 min",
  },
  {
    slug: "co-regulation-parent-enfant-tdah",
    title: "Co-régulation parent-enfant TDAH : 7 gestes pour désamorcer une crise",
    excerpt: "Rester calme quand votre enfant ne l'est plus : le guide des gestes concrets, testés par des parents TDAH.",
    cluster: "Guide de gestion Barkley",
    readTime: "7 min",
  },
  {
    slug: "deconnexion-emotionnelle-tdah",
    title: "Déconnexion émotionnelle TDAH : quand votre enfant se ferme",
    excerpt: "Votre enfant se fige, se ferme, semble absent ? Ce n'est pas de la bouderie — c'est une réponse neurologique à protéger.",
    cluster: "Connaissance TDAH",
    readTime: "6 min",
  },
  {
    slug: "fonctions-executives-tdah-enfant",
    title: "Fonctions exécutives et TDAH : l'enfant qui oublie tout",
    excerpt: "Votre enfant oublie son cartable, ses consignes, vos demandes ? Ce n'est pas de la mauvaise volonté : c'est la mémoire de travail.",
    cluster: "Connaissance TDAH",
    readTime: "9 min",
  },
  {
    slug: "hypersensibilite-sensorielle-tdah",
    title: "Hypersensibilité sensorielle et TDAH : quand tout est trop fort",
    excerpt: "Les coutures qui grattent, le bruit du lave-vaisselle, la lumière du plafonnier : comprendre l'hyperréactivité sensorielle TDAH.",
    cluster: "Connaissance TDAH",
    readTime: "7 min",
  },
  {
    slug: "troubles-sommeil-tdah-enfant",
    title: "Troubles du sommeil TDAH : pourquoi mon enfant ne dort pas",
    excerpt: "70 % des enfants TDAH ont des troubles du sommeil. Endormissement, réveils nocturnes, routine, mélatonine — ce qu'il faut savoir.",
    cluster: "Connaissance TDAH",
    readTime: "10 min",
  },
  {
    slug: "mini-guide-grands-parents-tdah",
    title: "Votre petit-enfant TDAH n'est pas mal élevé",
    excerpt: "Vos enfants vous parlent du TDAH de votre petit-enfant ? Ce mini-guide de 4 minutes vous aidera à mieux comprendre sans jargon médical.",
    cluster: "Ressources pour l'entourage",
    readTime: "4 min",
  },
  {
    slug: "mini-guide-co-parent-tdah",
    title: "TDAH : parler d'une seule voix, même séparés",
    excerpt: "Votre enfant TDAH a deux maisons ? 5 règles simples pour éviter qu'il paie le prix de vos désaccords éducatifs.",
    cluster: "Ressources pour l'entourage",
    readTime: "5 min",
  },
  {
    slug: "mini-guide-parrains-marraines-tdah",
    title: "Être le parrain cool d'un enfant TDAH",
    excerpt: "Vos week-ends et votre présence peuvent devenir une vraie bulle d'oxygène. Voici comment — sans jamais épuiser ses parents.",
    cluster: "Ressources pour l'entourage",
    readTime: "4 min",
  },
  {
    slug: "apres-le-diagnostic-tdah-parcours-de-soins",
    title: "Après le diagnostic TDAH : votre parcours de soins en 6 étapes",
    excerpt: "Vous venez d'apprendre le diagnostic. Respirez. Voici 6 étapes concrètes — nom du professionnel, délai, remboursement, et la phrase exacte à dire au téléphone.",
    cluster: "Parcours de soin en France",
    readTime: "10 min",
  },
  {
    slug: "medication-tdah-mythes-parents",
    title: "Médication TDAH : les mythes que tout parent entend",
    excerpt: "« Les médicaments vont le zombifier. » Non. 70 à 80 % des enfants TDAH répondent bien à un traitement correctement dosé. Voici ce que disent vraiment les données.",
    cluster: "Parcours de soin en France",
    readTime: "6 min",
  },
  {
    slug: "tdah-ecrans-ne-causent-pas",
    title: "Les écrans n'ont pas causé le TDAH de votre enfant",
    excerpt: "Non, les écrans n'ont pas « donné » le TDAH à votre enfant. Ce qu'ils font vraiment, et les règles qui marchent pour les familles TDAH.",
    cluster: "Connaissance TDAH",
    readTime: "5 min",
  },
  {
    slug: "motivation-delai-tdah-pourquoi-punition-echoue",
    title: "Motivation, punition et TDAH : pourquoi le long terme ne marche pas",
    excerpt: "Votre enfant n'est pas paresseux. Son cerveau sous-évalue les récompenses différées. Comprendre l'aversion au délai pour remplacer la punition par ce qui fonctionne.",
    cluster: "Guide de gestion Barkley",
    readTime: "6 min",
  },
  {
    slug: "parent-tdah-gerer-mes-propres-crises",
    title: "Gérer mes propres crises de parent TDAH : la co-régulation commence par moi",
    excerpt: "Vous avez crié. Vous avez claqué une porte. Vous n'êtes pas un mauvais parent — vous êtes un parent épuisé face à un enfant dysrégulé. Voici comment commencer par vous.",
    cluster: "Ressources pour les parents",
    readTime: "6 min",
  },
];
