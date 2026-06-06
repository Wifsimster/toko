// Scripts de communication — données 100 % statiques.
// Adapté du catalogue web (apps/web/src/lib/communication-scripts-data.ts
// et les traductions fr.json). Aucun appel API.

export type ScriptEntry = {
  id: string;
  title: string;
  whyHard: string;
  principles: string[];
  phrases: string[];
  pitfalls: string[];
};

export const SCRIPT_ENTRIES: readonly ScriptEntry[] = [
  {
    id: "schoolCall",
    title: "Quand l'école appelle pour un comportement",
    whyHard:
      "Un mélange de honte et de culpabilité, pas le temps de préparer une réponse posée.",
    principles: [
      "Demander un fait précis (heure, contexte) plutôt qu'accepter un jugement global",
      "Ne pas s'excuser à la place de l'enfant",
      "Repositionner sur l'aide à apporter, pas sur la sanction",
    ],
    phrases: [
      "Merci de m'appeler. Pour bien comprendre, à quel moment précis cela s'est passé ?",
      "Mon enfant a un TDAH suivi médicalement. Ce que vous décrivez correspond aux moments où il a le plus de difficulté à se réguler. On peut en parler ensemble pour trouver une réponse qui marche pour lui et pour la classe.",
      "Je vais reprendre cela à la maison avec lui, calmement. De votre côté, qu'est-ce qui pourrait l'aider à l'école dans ce type de moment ?",
    ],
    pitfalls: [
      "« Excusez-le, on traverse une période difficile » — minimise la situation et porte la culpabilité seul",
      "« Je vais le punir ce soir » — engage une sanction sans avoir compris ce qui s'est passé",
    ],
  },
  {
    id: "grandparent",
    title: "Expliquer le TDAH à un grand-parent qui minimise",
    whyHard:
      "On a besoin de soutien familial, et on entend « de mon temps on ne faisait pas tant d'histoires ».",
    principles: [
      "Court-circuiter le débat éducatif, ramener au médical",
      "Donner une seule info concrète plutôt qu'un cours sur les neurosciences",
      "Préserver le lien sans céder sur le fond",
    ],
    phrases: [
      "Le TDAH, c'est un fonctionnement neurologique. Ce n'est pas une question d'éducation.",
      "On suit un médecin pour ça. On fait ce qu'on peut, et ce que tu vois n'est pas de la mauvaise volonté.",
      "Tu peux nous aider en l'acceptant tel qu'il est quand on est ensemble. C'est tout ce dont on a besoin pour l'instant.",
    ],
    pitfalls: [
      "Entrer dans le débat sur les neurosciences — épuise et n'aboutit jamais",
      "« Tu ne comprends rien » — coupe un lien dont on aura besoin un jour",
    ],
  },
  {
    id: "caprice",
    title: "Répondre à « c'est juste un caprice »",
    whyHard:
      "Cette phrase nie ce qu'on vit au quotidien. Elle vient souvent de gens qui ne voient l'enfant que deux heures le dimanche.",
    principles: [
      "Pas de débat ouvert avec quelqu'un qui n'écoute pas vraiment",
      "Une phrase de cadrage, puis on change de sujet",
      "Pas d'argument scientifique en réponse à un jugement émotionnel",
    ],
    phrases: [
      "Non, c'est un trouble neurologique diagnostiqué. On en parlera plus longuement une autre fois.",
      "Si tu le voyais 24h/24, tu verrais que ce n'est pas du tout ça.",
      "Je préfère qu'on ne juge pas mon enfant, surtout en sa présence.",
    ],
    pitfalls: [
      "Justifier en détail — c'est ce que la personne attend pour démonter chaque argument",
      "Laisser passer en silence devant l'enfant — il enregistre le manque de soutien",
    ],
  },
  {
    id: "pedopsyPrep",
    title: "Préparer une consultation pédopsy en 10 minutes",
    whyHard:
      "Le rendez-vous est court, on perd l'essentiel sous le stress. On en sort avec l'impression de ne pas avoir tout dit.",
    principles: [
      "Trois sujets maximum, écrits sur papier avant d'entrer",
      "Faits concrets datés, pas d'interprétation",
      "Une question prioritaire pour soi (pas pour l'enfant)",
    ],
    phrases: [
      "Depuis la dernière fois, voici les trois choses qu'on a observées : [liste avec dates].",
      "Ma question prioritaire aujourd'hui, c'est : [une seule].",
      "Avant qu'on se quitte, est-ce qu'il y a un point que vous voulez qu'on surveille d'ici la prochaine fois ?",
    ],
    pitfalls: [
      "Tout dire dans l'ordre où ça vient — dilue le message principal",
      "Parler uniquement des difficultés — on perd la trace des améliorations",
    ],
  },
  {
    id: "announceCondition",
    title: "Annoncer le TDAH à votre enfant",
    whyHard:
      "On a peur de l'étiqueter, ou de lui faire croire qu'il est cassé.",
    principles: [
      "Pas le mot « maladie »",
      "Cadrer comme une explication, pas une fatalité",
      "Lui demander ce qu'il en pense, ne pas faire un monologue",
    ],
    phrases: [
      "Tu sais quand tu n'arrives pas à te concentrer ou à rester assis ? Ce n'est pas que tu ne veux pas. Ton cerveau fonctionne différemment, c'est ce qu'on appelle un TDAH.",
      "Beaucoup d'enfants ont ça. C'est pour ça qu'on va t'aider avec des routines et un suivi médical — pas pour te changer, pour te donner des outils.",
      "Qu'est-ce que ça te fait, ce que je te dis là ?",
    ],
    pitfalls: [
      "« Tu es malade » — fausse représentation, qui s'imprime durablement",
      "En faire un sujet tabou — l'enfant entend le silence",
    ],
  },
  {
    id: "papRequest",
    title: "Demander un PAP/PPRE à l'école",
    whyHard:
      "L'école n'a pas le temps. On doit pousser sans devenir le « parent pénible ».",
    principles: [
      "Demander un rendez-vous écrit, par mail",
      "Citer le médecin — c'est lui qui prescrit l'aménagement",
      "Proposer une réunion de 30 minutes, pas plus",
    ],
    phrases: [
      "Madame, Monsieur, mon enfant est suivi pour un TDAH. Le médecin recommande un PAP. Je souhaiterais qu'on en parle ensemble. Quand seriez-vous disponible pour une réunion de 30 minutes ?",
      "Voici les recommandations du médecin (en pièce jointe). Nous sommes ouverts à vos remarques et à vos contraintes.",
      "Pouvez-vous me confirmer par mail ce qu'on décide ensemble, pour qu'on en garde une trace ?",
    ],
    pitfalls: [
      "Demander oralement à la sortie de l'école — pas de trace, pas de suite",
      "Arriver avec une liste d'exigences fermées — ferme le dialogue dès la première minute",
    ],
  },
  {
    id: "misplacedRemark",
    title: "Gérer une remarque déplacée en famille / au parc",
    whyHard:
      "Sur le moment on est sidéré, on ne sait pas quoi dire, et on s'en veut après.",
    principles: [
      "Une phrase courte, ferme, qu'on apprend par cœur",
      "Protéger l'enfant qui entend",
      "Pas de débat, on coupe court",
    ],
    phrases: [
      "Merci, on gère.",
      "Ce que tu dis là n'est pas vrai pour mon enfant.",
      "Je préfère qu'on ne le juge pas, surtout devant lui.",
      "On en reparlera entre adultes, pas maintenant.",
    ],
    pitfalls: [
      "Se justifier longuement — installe le débat à la place du recadrage",
      "Rire jaune — l'enfant entend l'acquiescement implicite",
    ],
  },
  {
    id: "presentTreatment",
    title: "Présenter le traitement à votre enfant",
    whyHard:
      "On veut qu'il accepte le médicament sans en faire un sujet de honte.",
    principles: [
      "Nommer ce que le médicament aide, pas ce qu'il « corrige »",
      "Comparer à une aide banale (lunettes, asthmateur)",
      "Lui laisser un mot pour exprimer ce qu'il ressent, à tout moment",
    ],
    phrases: [
      "Le médicament aide ton cerveau à faire ce qu'il a du mal à faire seul. C'est un coup de pouce, pas un changement de toi.",
      "Comme des lunettes pour mieux voir : ça ne change pas tes yeux, ça t'aide à voir net.",
      "Si à un moment tu sens que ça te gêne, tu me le dis et on en parle ensemble au médecin.",
    ],
    pitfalls: [
      "« Tu seras plus sage » ou « tu seras plus calme » — confond effet du médicament et identité de l'enfant",
      "En cacher l'existence à l'enfant — il découvrira un jour avec un sentiment de trahison",
    ],
  },
];
