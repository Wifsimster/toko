import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { recoverFromStaleChunks } from "@/lib/stale-chunk-recovery";
import { routeTree } from "./routeTree.gen";
import { i18nReady } from "@/lib/i18n";
import "@/lib/install-prompt";
import "./app.css";

recoverFromStaleChunks();

try {
  localStorage.removeItem("toko-theme");
} catch {
}

const router = createRouter({
  routeTree,
  scrollRestoration: true,
  scrollRestorationBehavior: "instant",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

void i18nReady.then(() =>
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  )
);
