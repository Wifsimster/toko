// Reads the article list out of `src/lib/resources-data.tsx` from a plain
// Node script, without pulling React in.
//
// The article file mixes metadata (slug, title, cluster…) with JSX content,
// so it can't simply be imported. esbuild bundles it with every import
// stubbed and JSX compiled to a no-op factory: what's left is the metadata,
// evaluated by the real TypeScript rather than scraped with a regex, so it
// can't silently drift from what the site renders.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const RESOURCES_DATA = resolve(here, "..", "..", "src", "lib", "resources-data.tsx");

/** Every import becomes this: any name reads as a callable no-op. */
const STUB_MODULE = `
const stub = new Proxy(function () {}, {
  get: (target, prop) => (prop === "__esModule" ? false : stub),
  apply: () => null,
});
module.exports = stub;
`;

const stubEverythingElse = {
  name: "stub-imports",
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      if (args.kind === "entry-point") return null;
      return { path: args.path, namespace: "stub" };
    });
    build.onLoad({ filter: /.*/, namespace: "stub" }, () => ({
      contents: STUB_MODULE,
      loader: "js",
    }));
  },
};

/**
 * @returns {Promise<Array<Record<string, any>>>} the `articles` array, with
 * JSX-valued fields (`content`) replaced by nulls.
 */
export async function readArticles() {
  const dir = mkdtempSync(join(tmpdir(), "toko-og-"));
  const outfile = join(dir, "articles.mjs");
  try {
    await build({
      entryPoints: [RESOURCES_DATA],
      outfile,
      bundle: true,
      format: "esm",
      platform: "node",
      jsx: "transform",
      // The app's tsconfig asks for the automatic runtime; force the classic
      // transform so JSX lands on the no-op factory below instead of React.
      tsconfigRaw: { compilerOptions: { jsx: "react" } },
      jsxFactory: "__jsx",
      jsxFragment: "__fragment",
      banner: { js: "const __jsx = () => null; const __fragment = null;" },
      plugins: [stubEverythingElse],
      logLevel: "silent",
    });
    const mod = await import(pathToFileURL(outfile).href);
    if (!Array.isArray(mod.articles) || mod.articles.length === 0) {
      throw new Error("resources-data.tsx exported no articles");
    }
    return mod.articles;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
