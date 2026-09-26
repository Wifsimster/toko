// Rend chaque boucle en WebP animé transparent (assemblé par Pillow) + un PNG fixe servi sous
// prefers-reduced-motion, dans apps/web/public/visuals/<slug>/ (slug = `quiz` ou celui de l'article).
//   npm install && node render.mjs [filtre]     REMOTION_BROWSER=<chrome> pour un navigateur local
// Hors du workspace pnpm : ces dépendances ne touchent ni la CI ni l'image Docker.
import {bundle} from '@remotion/bundler';
import {renderFrames, getCompositions, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, readdirSync, copyFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const visuals = join(here, '..', '..', 'apps', 'web', 'public', 'visuals');
const browserExecutable = process.env.REMOTION_BROWSER || undefined;
const only = process.argv[2];

const serveUrl = await bundle({entryPoint: join(here, 'src', 'index.ts')});
for (const {id} of await getCompositions(serveUrl, {browserExecutable})) {
  if (only && !id.includes(only)) continue;
  const composition = await selectComposition({serveUrl, id, browserExecutable});
  const out = join(visuals, composition.props.slug);
  mkdirSync(out, {recursive: true});
  const dir = mkdtempSync(join(tmpdir(), `loop-${id}-`));
  await renderFrames({
    composition, serveUrl, outputDir: dir, imageFormat: 'png', browserExecutable,
    onStart: () => {}, onFrameUpdate: () => {},
  });
  const frames = readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
  frames.forEach((f, i) => copyFileSync(join(dir, f), join(dir, `f${String(i).padStart(4, '0')}.png`)));
  execFileSync('python3', [join(here, 'assemble.py'), dir, String(composition.fps), join(out, `${id}.webp`)]);
  // Image fixe : l'instant `still` (0-1) choisi par composition ; la plupart des boucles partent d'un fondu.
  const still = Math.round((composition.props.still ?? 0) * (frames.length - 1));
  copyFileSync(join(dir, `f${String(still).padStart(4, '0')}.png`), join(out, `${id}.png`));
  if (!process.env.KEEP_FRAMES) rmSync(dir, {recursive: true, force: true});
  else console.log('frames', dir);
  console.log('ok', id);
}
