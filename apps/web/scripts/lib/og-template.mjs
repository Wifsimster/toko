// Share-preview (Open Graph) card for one article: 1200x630 SVG.
//
// Same visual language as public/og-image.svg — cream ground, teal accents,
// the ō lockup — with the article title as the headline so a link shared
// in WhatsApp, Messenger or Slack shows what the article is about.
//
// Layout is centred inside a square safe zone rather than left-aligned:
// Facebook renders a link card in a near-square box on mobile (both in the
// composer and in the feed) and centre-crops the 1200x630 image down to
// roughly 630x630, dropping ~285px from each side. Left-aligned cards lose
// the start of the lockup and of every headline line — the shared link then
// reads as a mangled logo with a beheaded sentence. Only decoration is
// allowed outside SAFE_WIDTH; everything meant to be read sits inside it.

import { INK, TEAL, WORDMARK, tile, wordmark, wordmarkWidth } from "./brand.mjs";

const WIDTH = 1200;
const HEIGHT = 630;
const CENTRE = WIDTH / 2;
/** Readable width that survives Facebook's centre crop (630px, minus slack). */
const SAFE_WIDTH = 616;
// Shown in the card footer — the domain the shared link actually points at.
const SITE_HOST = "toko.battistella.ovh";
const FONT_STACK =
  "Plus Jakarta Sans, Liberation Sans, Helvetica, DejaVu Sans, sans-serif";

/**
 * Rough advance width of a character, in em, for a bold sans-serif face.
 * resvg gives no text metrics, so wrapping is estimated. The values err on
 * the wide side: a line that wraps one word early is fine, a line running
 * off the card is not.
 */
function charWidth(char) {
  if (" iljt.,:;!'|()[]-".includes(char)) return 0.32;
  if ("frI".includes(char)) return 0.4;
  if ("mwMW".includes(char)) return 0.92;
  if (char >= "A" && char <= "Z") return 0.72;
  if (char >= "0" && char <= "9") return 0.6;
  return 0.58;
}

function measure(text, fontSize) {
  let em = 0;
  for (const char of text) em += charWidth(char);
  return em * fontSize;
}

const round = (value) => Math.round(value * 100) / 100;

/** Greedy word wrap. Returns null when the text needs more than `maxLines`. */
function wrap(text, fontSize, maxWidth, maxLines) {
  const lines = [];
  let current = "";
  for (const word of text.split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && measure(candidate, fontSize) > maxWidth) {
      lines.push(current);
      current = word;
      if (lines.length > maxLines) return null;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length <= maxLines ? lines : null;
}

/**
 * Largest size at which the title fits the headline box. The box is only
 * SAFE_WIDTH wide, so titles wrap over more lines than a full-width card
 * would need — there is spare vertical room, and a line that survives the
 * crop beats a bigger one that gets cut in half.
 */
function fitTitle(title) {
  for (const [fontSize, maxLines] of [
    [56, 3],
    [50, 4],
    [46, 4],
    [42, 5],
    [38, 5],
  ]) {
    const lines = wrap(title, fontSize, SAFE_WIDTH, maxLines);
    if (lines) return { fontSize, lines };
  }
  // Nothing fits: hard-truncate rather than overflow the card.
  const lines = wrap(title, 38, SAFE_WIDTH, 99) ?? [title];
  return { fontSize: 38, lines: [...lines.slice(0, 4), `${lines[4] ?? ""}…`] };
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Brand lockup: the ō tile beside the outlined serif wordmark, so the card
// shows the real wordmark whatever fonts the rendering machine has.
const LOGO_SIZE = 72;
const LOCKUP_GAP = 20;
const WORDMARK_SIZE = 52;
const LOCKUP_WIDTH = LOGO_SIZE + LOCKUP_GAP + wordmarkWidth(WORDMARK_SIZE);
const LOCKUP_LEFT = round(CENTRE - LOCKUP_WIDTH / 2);
// Wordmark baseline: cap height centred on the tile.
const WORDMARK_BASELINE = round(
  LOGO_SIZE / 2 + ((WORDMARK.capHeight / WORDMARK.upem) * WORDMARK_SIZE) / 2
);

/**
 * The subject shown above the title. Article clusters are stored as
 * "Pillar · Connaissance TDAH" — the "Pillar" marker is internal, so only
 * the human-readable half is kept.
 */
export function clusterLabel(cluster) {
  const parts = String(cluster ?? "").split("·");
  return (parts.length > 1 ? parts[1] : parts[0]).trim();
}

/** @returns {string} the SVG source for one article's share card. */
export function renderArticleOgSvg({ title, cluster, readTime }) {
  const { fontSize, lines } = fitTitle(title.trim());
  const lineHeight = Math.round(fontSize * 1.22);
  // Headline block is bottom-anchored so cards with 3, 4 or 5 lines all keep
  // the same distance to the footer.
  const firstBaseline = 476 - (lines.length - 1) * lineHeight;

  const titleTspans = lines
    .map(
      (line, i) =>
        `<tspan x="${CENTRE}" y="${firstBaseline + i * lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join("\n      ");

  const subject = clusterLabel(cluster).toUpperCase();
  const footer = readTime ? `${readTime} de lecture · ${SITE_HOST}` : SITE_HOST;
  // Dot + gap + text, centred as one unit.
  const footerLeft = round(CENTRE - (8 + 18 + measure(footer, 24)) / 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stop-color="#fdf9f4"/>
      <stop offset="100%" stop-color="#f4ebdf"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <circle cx="1120" cy="70" r="260" fill="${TEAL}" opacity="0.06"/>
  <circle cx="80" cy="600" r="200" fill="${TEAL}" opacity="0.05"/>
  <rect x="0" y="0" width="14" height="${HEIGHT}" fill="#358891"/>
  <rect x="${WIDTH - 14}" y="0" width="14" height="${HEIGHT}" fill="#358891"/>

  <!-- Brand lockup, same tile and wordmark as the in-app logo -->
  <g transform="translate(${LOCKUP_LEFT}, 88)">
    ${tile(LOGO_SIZE)}
    ${wordmark(LOGO_SIZE + LOCKUP_GAP, WORDMARK_BASELINE, WORDMARK_SIZE, INK)}
  </g>

  <!-- Subject -->
  <text x="${CENTRE}" y="212" text-anchor="middle" font-family="${FONT_STACK}" font-weight="700" font-size="24" fill="#358891" letter-spacing="3">${escapeXml(subject)}</text>

  <!-- Title -->
  <text text-anchor="middle" font-family="${FONT_STACK}" font-weight="700" font-size="${fontSize}" fill="#1f2937" letter-spacing="-1.2">
      ${titleTspans}
  </text>

  <!-- Footer -->
  <g transform="translate(${footerLeft}, 540)">
    <rect y="1" width="8" height="8" rx="4" fill="#358891"/>
    <text x="26" y="9" font-family="${FONT_STACK}" font-weight="600" font-size="24" fill="#5b6472">${escapeXml(footer)}</text>
  </g>
</svg>
`;
}
