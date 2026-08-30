import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { queryClient } from "@/lib/query-client";
import { recoverFromStaleChunks } from "@/lib/stale-chunk-recovery";
import { routeTree } from "./routeTree.gen";
import "@/lib/i18n";
// Side-effect import: starts listening for `beforeinstallprompt` before React mounts.
import "@/lib/install-prompt";
import "./app.css";

// Must run before the router mounts: the first failing chunk import can
// happen during the very first navigation.
recoverFromStaleChunks();

const router = createRouter({
  routeTree,
  // Sans cette option, TanStack Router ne touche jamais au scroll : on
  // arrivait sur la nouvelle page au milieu du contenu, à la hauteur où on
  // avait laissé la précédente. Activée, elle remet en haut à chaque
  // navigation et restaure la position d'origine sur retour/avance
  // navigateur (et au rechargement). Cf. « pas de surprises » dans
  // CLAUDE.md : la page doit toujours commencer là où on l'attend.
  scrollRestoration: true,
  // Saut instantané plutôt qu'animé : pas de défilement qui file sous les
  // yeux à chaque changement de page.
  scrollRestorationBehavior: "instant",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="toko-theme"
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
