import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { readFileSync } from "fs";

const rootPkg = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../package.json"), "utf-8"),
);

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(rootPkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      // Splits each route file into its own chunk so visitors land on /
      // without downloading /dashboard, /barkley, /journal etc.
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      injectRegister: null,
      manifest: false,
      includeAssets: ["favicon.svg", "icon.svg"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        // Share-preview cards are fetched by crawlers, never by the app —
        // precaching all of them would cost every parent ~1.3 MB on install.
        // Same reasoning for article covers: an illustration is only worth
        // downloading when the parent opens that article.
        globIgnores: ["**/og/*.png", "**/articles/*"],
        // Without this the precache of every previous build is kept around,
        // so a client can keep booting an old shell whose chunks the server
        // no longer has (see `stale-chunk-recovery.ts`).
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        // Pulls the Web Push handlers into the generated service worker.
        importScripts: ["push-sw.js"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "toko-api",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "toko-images",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        // Garde le Host du navigateur (5173/5176) pour que les cookies d’auth restent cohérents avec l’origine du front
        changeOrigin: false,
      },
    },
  },
});
