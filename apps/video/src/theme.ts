// Polices embarquées (mêmes que l'app web) : le rendu ne dépend pas du réseau.
import "@fontsource-variable/source-serif-4";
import "@fontsource-variable/plus-jakarta-sans";
import { continueRender, delayRender } from "remotion";

// Couleurs de la marque — source de vérité : brand/README.md
export const colors = {
  teal: "#358891",
  tealSoft: "#e3f0ef",
  cream: "#fdf9f4",
  ink: "#1f2937",
  inkSoft: "#5b6472",
  night: "#091123",
  honey: "#c39a3e",
  honeySoft: "#f3eacb",
  sage: "#7a9e7a",
  sageSoft: "#e4ece4",
  line: "#e8e2d8",
};

export const fonts = {
  heading: "'Source Serif 4 Variable', Georgia, serif",
  sans: "'Plus Jakarta Sans Variable', system-ui, sans-serif",
};

// Attendre les polices avant de capturer la moindre image.
const fontsHandle = delayRender("Chargement des polices");
Promise.all(
  [`600 64px ${fonts.heading}`, `400 64px ${fonts.sans}`, `600 64px ${fonts.sans}`, `700 64px ${fonts.sans}`].map((f) =>
    document.fonts.load(f, "Tokō"),
  ),
).then(() => continueRender(fontsHandle));

export const FPS = 30;
