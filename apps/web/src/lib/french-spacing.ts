import { cloneElement, isValidElement, type ReactNode } from "react";

/**
 * Espaces insécables de la typographie française.
 *
 * Les titres sont saisis avec des espaces ordinaires avant « : ; ? ! » et à
 * l'intérieur des guillemets. Sur un téléphone, le navigateur peut alors
 * renvoyer le deux-points ou le « » » seul en début de ligne. On remplace
 * ces espaces par une espace insécable (U+00A0) au moment de l'affichage.
 * Même traitement entre un nombre et « % » ou « € » (« 80 % », « 70 € »).
 */
export function frenchSpacing(text: string): string {
  return text
    .replace(/ ([:;?!»])/g, "\u00a0$1")
    .replace(/« /g, "«\u00a0")
    .replace(/(\d) ([%€])/g, "$1\u00a0$2");
}

/** Balises dont le texte est affiché tel quel : on n'y touche pas. */
const RAW_TEXT_TAGS = new Set(["code", "pre", "kbd", "samp"]);

/**
 * `frenchSpacing` appliqué à un arbre React : chaque chaîne rencontrée dans
 * les `children`, à toute profondeur, reçoit ses espaces insécables.
 *
 * Sert au corps des articles, saisi en JSX dans `resources-data.tsx` : le
 * texte source reste tel qu'écrit, seule la coupure de ligne change. Les
 * autres props (href, className, alt…) ne sont jamais modifiées ; les blocs
 * qui reçoivent du texte hors `children` (Comparison, KeyTakeaways…)
 * appellent cette fonction eux-mêmes.
 */
export function frenchSpacingNode(node: ReactNode): ReactNode {
  if (typeof node === "string") return frenchSpacing(node);
  if (Array.isArray(node)) return node.map(frenchSpacingNode);
  if (!isValidElement<{ children?: ReactNode }>(node)) return node;
  if (typeof node.type === "string" && RAW_TEXT_TAGS.has(node.type)) {
    return node;
  }
  const { children } = node.props;
  if (children === undefined || children === null) return node;
  // Les props passent par l'objet de config et non en argument variadique :
  // React ne revalide pas les clés d'un tableau déjà construit par le JSX.
  return cloneElement(node, { children: frenchSpacingNode(children) });
}
