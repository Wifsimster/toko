import { useEffect } from "react";
import { useTheme } from "next-themes";

// Doivent rester égales à --background (app.css) et aux balises de index.html.
const THEME_COLOR = { light: "#FBF6EE", dark: "#141C1F" } as const;

/**
 * Les balises `theme-color` d'index.html suivent le thème du système. Quand
 * le parent choisit un thème dans l'app, la barre d'état du téléphone doit
 * le suivre aussi : sinon une barre crème coiffe une app sombre.
 */
export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      meta.content = THEME_COLOR[resolvedTheme];
    }
  }, [resolvedTheme]);
  return null;
}
