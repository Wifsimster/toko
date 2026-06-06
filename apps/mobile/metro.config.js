// Metro config for an Expo app living inside the Tokō monorepo while being
// excluded from the root pnpm install graph (see docs/android-app.md).
// We teach Metro to watch and resolve the shared `@focusflow/validators`
// package from its source in `packages/validators`.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the shared validators source so changes hot-reload into the app.
config.watchFolders = [path.resolve(monorepoRoot, "packages/validators")];

// Resolve dependencies from the app first, then fall back to the repo root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = config;
