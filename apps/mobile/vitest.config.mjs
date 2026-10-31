import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const at = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  root: at("."),
  esbuild: { tsconfigRaw: "{}" },
  resolve: {
    alias: {
      "lucide-react-native": at("./test/lucide-stub.ts"),
      "@focusflow/mo/child": at("../../packages/mo/src/child.ts"),
      "@focusflow/mo/crisis-icons": at("../../packages/mo/src/crisis-icons.ts"),
      "@focusflow/mo/item-icons": at("../../packages/mo/src/item-icons.ts"),
    },
  },
  test: {
    include: ["test/**/*.test.ts"],
  },
});
