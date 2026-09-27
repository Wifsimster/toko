/**
 * Espaces insécables de la typographie française.
 *
 * Les titres sont saisis avec des espaces ordinaires avant « : ; ? ! » et à
 * l'intérieur des guillemets. Sur un téléphone, le navigateur peut alors
 * renvoyer le deux-points ou le « » » seul en début de ligne. On remplace
 * ces espaces par une espace insécable (U+00A0) au moment de l'affichage.
 */
export function frenchSpacing(text: string): string {
  return text
    .replace(/ ([:;?!»])/g, " $1")
    .replace(/« /g, "« ");
}
