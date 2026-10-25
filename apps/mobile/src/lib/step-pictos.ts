import type { PictoName } from "@focusflow/mo/child";

type RoutinePicto = Extract<
  PictoName,
  "cartable" | "chaussette" | "dents" | "douche" | "habits" | "livre" | "pyjama"
>;

const BY_EMOJI: ReadonlyArray<readonly [RoutinePicto, readonly string[]]> = [
  ["chaussette", ["🧦"]],
  ["dents", ["🪥", "🦷"]],
  ["habits", ["👕", "👚", "👗", "👖", "🩳", "🧥"]],
  ["cartable", ["🎒"]],
  ["douche", ["🚿", "🛁", "🧼"]],
  ["pyjama", ["🌙", "🛌"]],
  ["livre", ["📕", "📖", "📚", "📗", "📘", "📙"]],
];

// Le libellé passe d'abord (« Poser le cartable au même endroit » porte 📚),
// dans cet ordre : « Pyjama et brossage des dents » donne la brosse à dents.
const BY_LABEL: ReadonlyArray<readonly [RoutinePicto, RegExp]> = [
  ["chaussette", /chaussette/i],
  ["dents", /\bdents?\b|brossage/i],
  ["pyjama", /pyjama/i],
  ["habits", /habill|v[eê]tement|\bhabits?\b/i],
  ["cartable", /cartable/i],
  ["douche", /douche|\bbain\b/i],
  ["livre", /\blivre|lecture|\blire\b|histoire/i],
];

/**
 * Le picto dessiné d'une étape de routine, s'il y en a un qui correspond
 * (mots du libellé d'abord, puis emoji de l'étape). `undefined` sinon :
 * l'étape garde alors son emoji.
 */
export function pictoForStep(label: string, emoji?: string): RoutinePicto | undefined {
  const byLabel = BY_LABEL.find(([, re]) => re.test(label))?.[0];
  if (byLabel) return byLabel;
  const e = emoji?.trim();
  return e ? BY_EMOJI.find(([, list]) => list.includes(e))?.[0] : undefined;
}
