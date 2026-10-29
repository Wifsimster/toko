// Tests unitaires de la logique pure de l'app Expo (sans React Native), lancés
// depuis la racine avec le vitest du monorepo : `pnpm test:mobile`.
// L'app est hors du graphe pnpm (voir pnpm-workspace.yaml) : pas de
// node_modules ici, d'où les alias vers les sources et un faux lucide.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const at = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  root: at("."),
  // tsconfig.json étend expo/tsconfig.base, absent hors de l'install Expo.
  esbuild: { tsconfigRaw: "{}" },
  resolve: {
    alias: {
      "lucide-react-native": at("./test/lucide-stub.ts"),
      "@focusflow/mo/child": at("../../packages/mo/src/child.ts"),
    },
  },
  test: {
    include: ["test/**/*.test.ts"],
  },
});
