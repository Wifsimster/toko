/**
 * Catalogue d'emojis curatés pour Tokō — organisés par catégories
 * pertinentes pour la gestion ADHD d'enfants.
 */

export interface EmojiCategory {
  id: string;
  label: string;
  icon: string;
  emojis: string[];
}

export const EMOJI_CATALOG: EmojiCategory[] = [
  {
    id: "smileys",
    label: "Visages",
    icon: "😊",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
      "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘", "😋",
      "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫",
      "🤔", "😐", "😑", "😶", "😏", "😒", "🙄", "😬",
      "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕",
      "🤢", "🤮", "🥵", "🥶", "😵", "🤯", "🥳", "😎",
      "🤓", "😤", "😠", "😡", "🥺", "😢", "😭", "😱",
      "😰", "😥", "😓", "🫣", "🫡", "🫠", "🫢", "😮",
    ],
  },
  {
    id: "people",
    label: "Personnes",
    icon: "👋",
    emojis: [
      "👋", "🤚", "🖐️", "✋", "👌", "🤌", "✌️", "🤞",
      "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇",
      "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌",
      "🫶", "👐", "🤲", "🤝", "🙏", "💪", "🦶", "🦵",
      "👶", "🧒", "👦", "👧", "👨", "👩", "🧑", "👴",
      "👵", "🧓", "👮", "🧑‍🎓", "🧑‍🏫", "🧑‍⚕️", "🧑‍🍳", "🧑‍🎨",
      "🧑‍🚀", "🦸", "🦹", "🧙", "🧚", "🧛", "🧜", "🧝",
    ],
  },
  {
    id: "animals",
    label: "Animaux",
    icon: "🐾",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
      "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔",
      "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺",
      "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞",
      "🐢", "🐍", "🦎", "🐙", "🦑", "🦐", "🦀", "🐡",
      "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐘",
      "🦏", "🦛", "🐪", "🦒", "🦘", "🐾", "🦩", "🦜",
    ],
  },
  {
    id: "food",
    label: "Nourriture",
    icon: "🍕",
    emojis: [
      "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓",
      "🫐", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅",
      "🥑", "🥦", "🥬", "🌽", "🥕", "🧄", "🧅", "🥔",
      "🍕", "🍔", "🍟", "🌭", "🍿", "🧀", "🥚", "🍳",
      "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🌮", "🌯",
      "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🍙", "🍘",
      "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁",
      "🍫", "🍬", "🍭", "🍮", "☕", "🍵", "🧃", "🥤",
    ],
  },
  {
    id: "activities",
    label: "Activités",
    icon: "⚽",
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉",
      "🥏", "🎱", "🏓", "🏸", "🏒", "🥊", "🥋", "🎯",
      "⛳", "🏊", "🚴", "🏃", "🧘", "🧗", "🤸", "🤺",
      "🎮", "🕹️", "🎲", "🧩", "♟️", "🎯", "🎳", "🎪",
      "🎨", "🖍️", "✏️", "🖌️", "🎵", "🎶", "🎤", "🎧",
      "🎸", "🎹", "🥁", "🎷", "🎺", "🎻", "📖", "📚",
      "🛝", "🛴", "🛹", "🚀", "🎬", "📺", "🎠", "🎡",
    ],
  },
  {
    id: "objects",
    label: "Objets",
    icon: "🎁",
    emojis: [
      "🎁", "🎀", "🎈", "🎉", "🎊", "🏆", "🥇", "🥈",
      "🥉", "🏅", "🎖️", "👑", "💎", "🌟", "⭐", "✨",
      "💫", "🌈", "☀️", "🌙", "🌳", "🌸", "🌻", "🍀",
      "🧸", "🪁", "🛁", "🛏️", "💤", "🕐", "📱", "💻",
      "🎒", "📝", "✅", "❤️", "🧡", "💛", "💚", "💙",
      "💜", "🩷", "🖤", "🤍", "💯", "🔥", "💧", "🫧",
      "🐾", "🤗", "🫂", "👕", "🧹", "🦷", "🍽️", "🚿",
    ],
  },
];

/** Toutes les catégories sous forme de liste plate */
export const ALL_EMOJIS = EMOJI_CATALOG.flatMap((c) => c.emojis);

/**
 * Labels français pour la recherche — couvre les emojis les plus courants.
 * Clé = emoji, valeur = mots-clés séparés par des espaces.
 */
export const EMOJI_LABELS: Record<string, string> = {
  // Visages
  "😀": "sourire heureux joie content",
  "😃": "sourire heureux grand",
  "😄": "rire heureux joie",
  "😁": "sourire large dents",
  "😆": "rire mort plié",
  "😅": "rire sueur gêne",
  "🤣": "mort de rire mdr",
  "😂": "rire larmes joie pleure",
  "🙂": "sourire léger content",
  "😊": "sourire rougir content heureux",
  "😇": "ange innocent gentil",
  "🥰": "amour coeurs sourire",
  "😍": "amour yeux coeurs",
  "🤩": "étoiles wow impressionné",
  "😘": "bisou amour",
  "😋": "miam délicieux gourmand",
  "😛": "langue taquin",
  "😜": "clin oeil langue",
  "🤪": "fou dingue folie",
  "🤗": "câlin bisou caresse",
  "🤔": "réfléchir penser hmm",
  "😐": "neutre rien indifférent",
  "😏": "malin sourire narquois",
  "😒": "ennui pas content",
  "🙄": "yeux ciel agacé",
  "😬": "grimace gêne oups",
  "😌": "calme soulagé zen serein",
  "😔": "triste pensif",
  "😪": "fatigué endormi",
  "😴": "dort sommeil dodo",
  "🤒": "malade thermomètre fièvre",
  "🤕": "blessé bandage bobo",
  "🥵": "chaud chaleur",
  "🥶": "froid gelé",
  "🤯": "esprit explosé choqué",
  "🥳": "fête anniversaire célébration",
  "😎": "cool lunettes soleil",
  "🤓": "intello lunettes nerd",
  "😤": "énervé frustré souffle",
  "😠": "colère fâché",
  "😡": "colère rouge furieux",
  "🥺": "suppliant triste yeux",
  "😢": "triste larme pleure",
  "😭": "pleure fort triste larmes",
  "😱": "peur horrifié cri",
  "😰": "anxieux sueur inquiet",
  "😮": "surpris choqué oh",

  // Personnes & gestes
  "👋": "salut bonjour coucou main",
  "👍": "pouce bien ok super",
  "👎": "pouce bas non mauvais",
  "👏": "bravo applaudir félicitations",
  "🙌": "hourra mains levées victoire",
  "🫶": "coeur mains amour",
  "🤝": "poignée main accord",
  "🙏": "merci prière svp s'il vous plaît",
  "💪": "muscle fort force",
  "👶": "bébé enfant petit",
  "🧒": "enfant gamin",
  "👦": "garçon fils",
  "👧": "fille",
  "🦸": "héros super",
  "🧚": "fée magie",
  "🧙": "magicien sorcier",

  // Animaux
  "🐶": "chien toutou",
  "🐱": "chat minou",
  "🐭": "souris",
  "🐹": "hamster",
  "🐰": "lapin",
  "🦊": "renard",
  "🐻": "ours",
  "🐼": "panda",
  "🐨": "koala",
  "🐯": "tigre",
  "🦁": "lion roi",
  "🐮": "vache",
  "🐷": "cochon",
  "🐸": "grenouille",
  "🐵": "singe",
  "🐔": "poule poulet",
  "🐧": "pingouin manchot",
  "🐦": "oiseau",
  "🦋": "papillon",
  "🐢": "tortue",
  "🐬": "dauphin",
  "🐳": "baleine",
  "🐘": "éléphant",
  "🦄": "licorne magique",
  "🐾": "pattes traces animal",
  "🦜": "perroquet",
  "🦩": "flamant rose",
  "🐞": "coccinelle",

  // Nourriture
  "🍎": "pomme fruit rouge",
  "🍌": "banane fruit",
  "🍉": "pastèque melon",
  "🍇": "raisin",
  "🍓": "fraise",
  "🍒": "cerise",
  "🍍": "ananas",
  "🍕": "pizza",
  "🍔": "hamburger burger",
  "🍟": "frites",
  "🌭": "hot dog saucisse",
  "🍿": "popcorn cinéma",
  "🍝": "pâtes spaghetti",
  "🍦": "glace crème glacée",
  "🍩": "donut beignet",
  "🍪": "cookie biscuit gâteau",
  "🎂": "gâteau anniversaire",
  "🍰": "gâteau part",
  "🧁": "cupcake muffin",
  "🍫": "chocolat",
  "🍬": "bonbon",
  "🍭": "sucette",
  "☕": "café",
  "🧃": "jus brique",
  "🥤": "boisson soda",

  // Activités
  "⚽": "football foot ballon",
  "🏀": "basket ball",
  "🎾": "tennis",
  "🏊": "nager piscine natation",
  "🚴": "vélo cyclisme",
  "🏃": "courir course",
  "🧘": "yoga méditation zen calme",
  "🤸": "gymnastique acrobatie",
  "🎮": "jeu vidéo manette",
  "🕹️": "arcade joystick jeu",
  "🎲": "dé jeu hasard",
  "🧩": "puzzle casse-tête",
  "🎯": "cible objectif but",
  "🎪": "cirque spectacle",
  "🎨": "peinture art palette",
  "🖍️": "crayon couleur dessin coloriage",
  "✏️": "crayon écrire",
  "🎵": "musique note",
  "🎶": "musique notes mélodie",
  "🎤": "micro chanter karaoké",
  "🎧": "casque musique écouter",
  "🎸": "guitare musique",
  "🎹": "piano musique clavier",
  "🥁": "batterie tambour musique",
  "📖": "livre lire lecture",
  "📚": "livres bibliothèque étude",
  "🛝": "toboggan parc jeu",
  "🛴": "trottinette",
  "🎬": "cinéma film",
  "📺": "télé écran",
  "🎠": "manège carrousel",

  // Objets & symboles
  "🎁": "cadeau surprise",
  "🎈": "ballon fête",
  "🎉": "fête confetti célébration",
  "🎊": "confetti fête",
  "🏆": "trophée victoire champion",
  "🥇": "médaille or premier",
  "🥈": "médaille argent deuxième",
  "🥉": "médaille bronze troisième",
  "🏅": "médaille sport",
  "👑": "couronne roi reine",
  "💎": "diamant bijou précieux",
  "🌟": "étoile brillante",
  "⭐": "étoile",
  "✨": "étincelles briller magie",
  "🌈": "arc en ciel couleurs",
  "☀️": "soleil beau temps",
  "🌙": "lune nuit",
  "🌳": "arbre nature forêt",
  "🌸": "fleur cerisier",
  "🌻": "tournesol fleur",
  "🍀": "trèfle chance",
  "🧸": "peluche ours doudou",
  "🪁": "cerf-volant vent",
  "🛁": "bain baignoire",
  "🛏️": "lit dormir chambre",
  "💤": "sommeil dodo dormir",
  "🎒": "sac dos école",
  "📝": "note écrire",
  "✅": "validé fait terminé",
  "❤️": "coeur amour rouge",
  "💙": "coeur bleu",
  "💚": "coeur vert",
  "💛": "coeur jaune",
  "💜": "coeur violet",
  "🩷": "coeur rose",
  "💯": "cent parfait score",
  "🔥": "feu flamme top",
  "🫧": "bulles savon",
  "🫂": "accolade câlin réconfort",
  "👕": "vêtement habit t-shirt",
  "🧹": "balai ménage ranger",
  "🦷": "dent brosser",
  "🍽️": "assiette manger repas table",
  "🚿": "douche laver",
  "🚀": "fusée espace rapide",
};

/** Nombre max d'emojis récents à conserver */
export const MAX_RECENTS = 16;
const RECENTS_KEY = "toko-emoji-recents";

export function getRecentEmojis(): string[] {
  try {
    const stored = localStorage.getItem(RECENTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as string[];
  } catch {
    return [];
  }
}

export function addRecentEmoji(emoji: string): void {
  try {
    const recents = getRecentEmojis().filter((e) => e !== emoji);
    recents.unshift(emoji);
    localStorage.setItem(
      RECENTS_KEY,
      JSON.stringify(recents.slice(0, MAX_RECENTS)),
    );
  } catch {
    // localStorage indisponible — on ignore silencieusement
  }
}
