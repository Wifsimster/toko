/**
 * Décor des scènes en mode sombre. La direction livre Mō sombre (liseré
 * crème) mais pas de décor sombre : sans cette table, les grands aplats
 * clairs (sol, collines, chemin, table) faisaient des taches crème sur le
 * fond #141C1F, et les notes et flèches crème y disparaissaient. Seuls les
 * aplats d'environnement changent ; les objets (pouf, tasse, soleil,
 * pierres) et Mō gardent leurs couleurs. Teintes prises dans les surfaces
 * sombres de DESIGN.md (menthe #1F3935, carte #1E2A2E). À remplacer par le
 * décor sombre du designer quand il existera.
 */
export const SCENE_DARK_FILLS: Readonly<Record<string, string>> = {
  // Sol (ellipses, plaine)
  "#E4EEE2": "#1F3935",
  "#F1E6D3": "#22302F",
  "#F1EADC": "#22302F",
  // Collines
  "#E3EEE3": "#1F3935",
  "#D6E8DC": "#24423D",
  // Chemin de « C'est parti »
  "#FFFBF2": "#2C3A3D",
  // Plateau de la table de « Voici Mō »
  "#F8EBD5": "#33302A",
};
