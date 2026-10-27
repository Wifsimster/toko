// Metro config for an Expo app living inside the Tokō monorepo while being
// excluded from the root pnpm install graph (see docs/android-app.md).
// We teach Metro to watch and resolve the shared `@focusflow/validators` and
// `@focusflow/mo` packages from their source in `packages/`.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the shared sources so changes hot-reload into the app. The app only
// imports `@focusflow/mo/child`, `@focusflow/mo/parent`, `@focusflow/mo/mood`
// (mood picker faces), `@focusflow/mo/themes` (article and Barkley step
// scenes), `@focusflow/mo/crisis` (the crisis list's Mō) and
// `@focusflow/mo/icons` (objective pictograms): all synchronous drawings, see
// packages/mo/src/child.ts, parent.ts, mood.ts, themes.ts and crisis.ts.
// It also imports `@focusflow/mo/tips` (Mō's tips, plain data and pure
// functions).
config.watchFolders = [
  path.resolve(monorepoRoot, "packages/validators"),
  path.resolve(monorepoRoot, "packages/mo"),
];

// Resolve dependencies from the app first, then fall back to the repo root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = config;
