import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const RESOURCES_DATA = resolve(here, "..", "..", "src", "lib", "resources-data.tsx");

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
