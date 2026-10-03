#!/usr/bin/env node
// control-toko: drive a throwaway local Tokō (React SPA + Hono API) the way a
// parent does, and keep the proof. Web app + API only; Expo mobile is out of scope.
// Agent-facing: one JSON object on stdout per call, exit 0 on success.
// Run `control-toko --help` or `control-toko <command> --help`.

import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SELF = fileURLToPath(import.meta.url);
const REPO = path.resolve(HERE, '..', '..', '..', '..');
const RUN_DIR = path.join(REPO, '.verify-run');
const STATE_FILE = path.join(RUN_DIR, 'state.json');
const EVIDENCE_ROOT = path.resolve(process.env.TOKO_EVIDENCE_DIR || path.join(REPO, '.verify-evidence'));

// Fixed, unusual ports: the host's 3001, 5173 and 5432 may belong to a dev
// instance or to other projects. Never reuse them here.
const PORTS = { api: 38601, web: 38602, postgres: 38632, cdp: 38622 };
const PG = 'toko-verify-pg';
const LABEL_KEY = 'toko-verify';
const LABEL = `${LABEL_KEY}=1`;
const DB = { user: 'toko', password: 'toko_verify', name: 'toko' };
const DB_URL = `postgresql://${DB.user}:${DB.password}@127.0.0.1:${PORTS.postgres}/${DB.name}`;
const API = `http://localhost:${PORTS.api}`;
const WEB = `http://localhost:${PORTS.web}`;
// The demo account comes from apps/api/src/seed.ts (seeded on every non-production
// start). Its children ("Lucas", "Emma") and their records are synthetic.
const DEMO = { email: 'demo@toko.app', password: 'demo1234', name: 'Parent Démo' };
const WEB_DIR = path.join(REPO, 'apps', 'web');
const API_DIR = path.join(REPO, 'apps', 'api');
const VITE_CONFIG = path.join(WEB_DIR, '.verify-run.vite.config.mjs');

// ---------- output ----------
function out(obj) {
  const text = JSON.stringify(obj, null, 2);
  process.stdout.write(text + '\n');
  return text;
}
class CliError extends Error {
  constructor(message, fix, extra = {}) {
    super(message);
    this.fix = fix;
    this.extra = extra;
  }
}
function fail(message, fix, extra) {
  throw new CliError(message, fix, extra);
}

// ---------- args ----------
function parseArgs(argv) {
  const pos = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      const k = eq === -1 ? a.slice(2) : a.slice(2, eq);
      const v = eq === -1 ? undefined : a.slice(eq + 1);
      let val;
      if (v !== undefined) val = v;
      else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) val = argv[++i];
      else val = true;
      flags[k] = val;
    } else pos.push(a);
  }
  return { pos, flags };
}

// ---------- state ----------
function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return null;
  }
}
function writeState(s) {
  fs.mkdirSync(RUN_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}
function requireState() {
  const s = readState();
  if (!s) fail('No running verification instance.', 'Run `control-toko launch` first (or `control-toko doctor` to see what is up).');
  return s;
}
function evidenceDir(state) {
  const dir = path.join(EVIDENCE_ROOT, state?.runId || 'adhoc');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}
function artifactPath(state, name, ext = '.png') {
  const safe = String(name || 'shot').replace(/[^a-z0-9._-]+/gi, '-');
  return path.join(evidenceDir(state), `${stamp()}_${safe}${ext}`);
}

// ---------- helpers ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function portInUse(port) {
  return new Promise((resolve) => {
    const s = net.connect({ port, host: '127.0.0.1' });
    s.once('connect', () => {
      s.destroy();
      resolve(true);
    });
    s.once('error', () => resolve(false));
  });
}
function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20, ...opts }).trim();
}
function docker(...args) {
  return sh('docker', args);
}
function containerLabelled(name) {
  try {
    return docker('inspect', '-f', `{{index .Config.Labels "${LABEL_KEY}"}}`, name) === '1';
  } catch {
    return false;
  }
}
function containerRunning(name) {
  try {
    return docker('inspect', '-f', '{{.State.Running}}', name) === 'true';
  } catch {
    return false;
  }
}
function psql(sqlText) {
  return sh('docker', ['exec', PG, 'psql', '-U', DB.user, '-d', DB.name, '-v', 'ON_ERROR_STOP=1', '-At', '-c', sqlText]);
}
function psqlJson(sqlText) {
  const raw = psql(`select coalesce(json_agg(t), '[]'::json) from (${sqlText}) t`);
  return JSON.parse(raw || '[]');
}
const lit = (s) => `'${String(s).replace(/'/g, "''")}'`;
async function waitFor(fn, { timeoutMs, label }) {
  const start = Date.now();
  let last;
  while (Date.now() - start < timeoutMs) {
    try {
      if (await fn()) return Date.now() - start;
    } catch (e) {
      last = e;
    }
    await sleep(400);
  }
  fail(`Timed out after ${timeoutMs}ms waiting for ${label}.`, `Read the logs in ${path.join(RUN_DIR, 'logs')} and run \`control-toko doctor\`.`, { lastError: last?.message });
}
function spawnDetached(name, cmd, args, { cwd, env }) {
  const logDir = path.join(RUN_DIR, 'logs');
  fs.mkdirSync(logDir, { recursive: true });
  const log = fs.openSync(path.join(logDir, `${name}.log`), 'a');
  const child = spawn(cmd, args, { cwd, env, detached: true, stdio: ['ignore', log, log] });
  child.unref();
  return child.pid;
}
function loadPlaywright() {
  // Tokō ships @playwright/test (root devDependency), which bundles the driver.
  const req = createRequire(path.join(REPO, 'package.json'));
  for (const name of ['playwright-core', '@playwright/test', 'playwright']) {
    try {
      return req(name);
    } catch {}
  }
  fail('Playwright is not installed in this checkout.', 'Run `pnpm install` at the repo root, then `pnpm exec playwright install chromium`.');
}
async function connect() {
  const state = requireState();
  const { chromium } = loadPlaywright();
  let browser;
  try {
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORTS.cdp}`);
  } catch (e) {
    fail('Browser daemon is not reachable on the CDP port.', 'Run `control-toko doctor`; if the browser is down, run `control-toko teardown`, then `control-toko launch`.', { error: e.message });
  }
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0] || (await ctx.newPage());
  return { browser, ctx, page, state };
}
async function withPage(fn) {
  const c = await connect();
  try {
    return await fn(c);
  } finally {
    await c.browser.close().catch(() => {});
  }
}
function resolveUrl(target) {
  if (/^https?:\/\//.test(target)) return target;
  return WEB + (target.startsWith('/') ? target : '/' + target);
}
async function http(method, url, { body, cookie } = {}) {
  const res = await fetch(url, {
    method,
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), origin: WEB },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, json, text: json ? undefined : text.slice(0, 500) };
}
// Reads with the browser's session cookie, so API checks see exactly what the parent sees.
async function sessionCookie(ctx) {
  const cookies = await ctx.cookies(WEB);
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
}
async function apiGet(ctx, p) {
  return http('GET', WEB + p, { cookie: await sessionCookie(ctx) });
}
async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
}
// Records the JSON responses of /api calls made while `fn` runs (the action's HTTP proof).
async function captureApi(page, fn, filter = /\/api\//) {
  const seen = [];
  const onResp = async (r) => {
    const u = new URL(r.url());
    if (!filter.test(u.pathname) || r.request().method() === 'GET') return;
    let body = null;
    try {
      body = await r.json();
    } catch {}
    seen.push({ method: r.request().method(), path: u.pathname, status: r.status(), body });
  };
  page.on('response', onResp);
  try {
    await fn();
    await settle(page);
    await sleep(300);
  } finally {
    page.off('response', onResp);
  }
  return seen;
}
async function requireLoggedIn(page) {
  if (/\/login/.test(page.url())) fail('The browser is on the login page: not signed in.', 'Run `control-toko login` first.');
}

// ---------- browser daemon ----------
async function browserd() {
  const { chromium } = loadPlaywright();
  const ctx = await chromium.launchPersistentContext(path.join(RUN_DIR, 'browser-profile'), {
    headless: true,
    viewport: { width: 1280, height: 800 },
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    // The PWA service worker would cache /api responses (NetworkFirst) and blur proofs.
    serviceWorkers: 'block',
    args: [`--remote-debugging-port=${PORTS.cdp}`],
  });
  const con = fs.createWriteStream(path.join(RUN_DIR, 'console.jsonl'), { flags: 'a' });
  const netw = fs.createWriteStream(path.join(RUN_DIR, 'network.jsonl'), { flags: 'a' });
  const attach = (page) => {
    page.on('console', (m) => con.write(JSON.stringify({ ts: new Date().toISOString(), type: m.type(), text: m.text(), url: page.url() }) + '\n'));
    page.on('pageerror', (e) => con.write(JSON.stringify({ ts: new Date().toISOString(), type: 'pageerror', text: e.message, url: page.url() }) + '\n'));
    page.on('requestfinished', async (req) => {
      const res = await req.response().catch(() => null);
      netw.write(JSON.stringify({ ts: new Date().toISOString(), method: req.method(), url: req.url(), status: res?.status() ?? null, ms: Math.round(req.timing().responseEnd) }) + '\n');
    });
    page.on('requestfailed', (req) => netw.write(JSON.stringify({ ts: new Date().toISOString(), method: req.method(), url: req.url(), status: null, failure: req.failure()?.errorText }) + '\n'));
  };
  ctx.pages().forEach(attach);
  ctx.on('page', attach);
  if (!ctx.pages().length) await ctx.newPage();
  const stop = async () => {
    await ctx.close().catch(() => {});
    process.exit(0);
  };
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
  setInterval(() => {}, 1 << 30);
}

// ---------- commands ----------
const COMMANDS = {};

function launchEnv(secrets, rateLimit) {
  // Whitelist: nothing from the caller's shell (real Stripe/Resend/VAPID keys) leaks in.
  return {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    TZ: 'Europe/Paris',
    NODE_ENV: 'development',
    PORT: String(PORTS.api),
    LOG_LEVEL: 'info',
    DATABASE_URL: DB_URL,
    DB_ENCRYPTION_KEY: secrets.dbKey,
    BETTER_AUTH_SECRET: secrets.authSecret,
    BETTER_AUTH_URL: WEB,
    CORS_ORIGIN: WEB,
    APP_URL: WEB,
    PASSKEY_RP_ID: 'localhost',
    PASSKEY_ORIGIN: WEB,
    // Fake values that satisfy the env schema. They never authenticate anywhere.
    STRIPE_SECRET_KEY: 'sk_test_toko_verify_fake',
    STRIPE_WEBHOOK_SECRET: 'whsec_toko_verify_fake',
    GOOGLE_CLIENT_ID: 'toko-verify-fake',
    GOOGLE_CLIENT_SECRET: 'toko-verify-fake',
    RESEND_API_KEY: '',
    KOE_IDENTITY_SECRET: '',
    VAPID_PUBLIC_KEY: '',
    VAPID_PRIVATE_KEY: '',
    CRON_SECRET: '',
    ENABLE_SCHEDULER: 'false',
    SOLIDARITY_NOTIFY_EMAIL: 'solidarity@toko-verify.test',
    TRUSTED_PROXY_HOPS: '0',
    // The global limiter (120 req/min per IP) trips after ~9 full page loads, and a 429 on
    // get-session bounces the parent to /login. CI e2e bypasses it the same way.
    RATE_LIMIT_BYPASS: rateLimit ? '0' : '1',
  };
}

function viteConfigSource() {
  // Overrides only what the harness needs on top of apps/web/vite.config.ts:
  // the port, the /api proxy target, and an empty envDir so no local .env leaks in.
  return `import { mergeConfig } from 'vite';
import base from './vite.config.ts';
export default mergeConfig(base, {
  envDir: ${JSON.stringify(path.join(RUN_DIR, 'vite-env'))},
  server: { port: ${PORTS.web}, strictPort: true, host: '127.0.0.1', proxy: { '/api': { target: 'http://127.0.0.1:${PORTS.api}', changeOrigin: false } } },
});
`;
}

COMMANDS.launch = {
  summary: 'Start a throwaway Postgres, the API (seeds the demo parent), the Vite web app and the browser daemon.',
  help: `control-toko launch [--rate-limit on] [--dry-run]

1. docker run postgres:16-alpine as ${PG} (label ${LABEL}, data on tmpfs, 127.0.0.1:${PORTS.postgres}).
2. API from source: node --import tsx apps/api/src/index.ts on :${PORTS.api}, NODE_ENV=development.
   Startup runs the migrations and seeds the demo parent ${DEMO.email} / ${DEMO.password}
   with two synthetic children (Lucas, Emma) and 21 days of fake records.
   Env is a whitelist: fresh random DB_ENCRYPTION_KEY and BETTER_AUTH_SECRET, fake Stripe and
   Google values, Resend/VAPID/Koe/cron empty. Nothing reaches a third party unless you open
   a billing checkout (Stripe calls fail with the fake key).
3. Vite dev server for apps/web on :${PORTS.web}, proxying /api to the API (same origin, like prod).
4. Headless Chromium daemon (CDP :${PORTS.cdp}, fr-FR, Europe/Paris, service workers blocked).
--rate-limit on   keep the API's global limiter (120 req/min per IP) active. Default: bypassed
                  with RATE_LIMIT_BYPASS=1, as CI e2e does, because the harness loads pages faster
                  than a parent and a 429 on get-session redirects to /login.
Refuses to start when a port is busy, the container exists, or .verify-run/state.json exists.
Ready when it returns ok:true (it waits for /api/health/jobs and the SPA).
--dry-run   print the plan; touches nothing.`,
  async run(flags) {
    const rateLimit = flags['rate-limit'] === 'on';
    const plan = {
      rateLimit: rateLimit ? 'on' : 'bypassed (RATE_LIMIT_BYPASS=1)',
      ports: PORTS,
      container: PG,
      label: LABEL,
      urls: { web: WEB, api: API },
      account: DEMO,
      steps: ['docker run postgres:16-alpine --tmpfs', 'node --import tsx apps/api/src/index.ts (migrate + seed demo)', `vite --config ${path.relative(REPO, VITE_CONFIG)}`, '__browserd (headless Chromium, CDP)'],
      evidenceRoot: EVIDENCE_ROOT,
    };
    if (flags['dry-run']) return { ok: true, dryRun: true, plan };
    if (readState()) fail('A run is already recorded in .verify-run/state.json.', 'Run `control-toko doctor` to inspect it, or `control-toko teardown` to stop it.');
    const busy = [];
    for (const [k, p] of Object.entries(PORTS)) if (await portInUse(p)) busy.push(`${k}:${p}`);
    if (busy.length) fail(`Ports already in use: ${busy.join(', ')}.`, 'Find the owner with `ss -ltnp` and `docker ps`. Never kill what you did not start; if it is a stale run of this harness, run `control-toko teardown`.');
    try {
      docker('inspect', PG);
      fail(`Container ${PG} already exists.`, containerLabelled(PG) ? 'It is ours (labelled): run `control-toko teardown`.' : 'It is NOT labelled by this harness: leave it alone and ask its owner.');
    } catch (e) {
      if (e instanceof CliError) throw e;
    }
    if (!fs.existsSync(path.join(API_DIR, 'node_modules')) || !fs.existsSync(path.join(WEB_DIR, 'node_modules'))) fail('Dependencies are missing in apps/api or apps/web.', "Run `pnpm install --frozen-lockfile --filter '@focusflow/api...' --filter '@focusflow/web...' --filter toko` at the repo root.");

    const runId = stamp();
    const t = {};
    const secrets = { dbKey: crypto.randomBytes(32).toString('hex'), authSecret: crypto.randomBytes(32).toString('base64') };
    const state = { runId, startedAt: new Date().toISOString(), gitSha: sh('git', ['-C', REPO, 'rev-parse', '--short', 'HEAD']), pids: {}, containers: [], files: [VITE_CONFIG], rateLimit };
    writeState(state);
    fs.mkdirSync(path.join(RUN_DIR, 'vite-env'), { recursive: true });
    let s = Date.now();
    docker('run', '-d', '--name', PG, '--label', LABEL, '--tmpfs', '/var/lib/postgresql/data', '-p', `127.0.0.1:${PORTS.postgres}:5432`, '-e', `POSTGRES_USER=${DB.user}`, '-e', `POSTGRES_PASSWORD=${DB.password}`, '-e', `POSTGRES_DB=${DB.name}`, 'postgres:16-alpine');
    state.containers.push(PG);
    writeState(state);
    await waitFor(() => {
      try {
        return psql('select 1') === '1';
      } catch {
        return false;
      }
    }, { timeoutMs: 30000, label: 'postgres' });
    t.postgres = Date.now() - s;

    s = Date.now();
    const env = launchEnv(secrets, rateLimit);
    state.pids.api = spawnDetached('api', process.execPath, ['--import', 'tsx', 'src/index.ts'], { cwd: API_DIR, env });
    writeState(state);
    await waitFor(async () => (await fetch(`${API}/api/health/jobs`)).ok, { timeoutMs: 90000, label: `API /api/health/jobs (see ${path.join(RUN_DIR, 'logs', 'api.log')})` });
    await waitFor(() => psql(`select count(*) from "user" where email = ${lit(DEMO.email)}`) === '1', { timeoutMs: 30000, label: 'demo parent seed' });
    t.apiAndSeed = Date.now() - s;

    s = Date.now();
    fs.writeFileSync(VITE_CONFIG, viteConfigSource());
    const viteBin = path.join(WEB_DIR, 'node_modules', 'vite', 'bin', 'vite.js');
    state.pids.web = spawnDetached('web', process.execPath, [viteBin, '--config', VITE_CONFIG], { cwd: WEB_DIR, env: { PATH: process.env.PATH, HOME: process.env.HOME, VITE_API_URL: '', VITE_APP_VERSION: `verify-${state.gitSha}`, VITE_KOE_API_URL: '', VITE_KOE_PROJECT_KEY: '', VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_toko_verify_fake', VITE_ANDROID_APP_URL: '' } });
    writeState(state);
    await waitFor(async () => (await fetch(`${WEB}/login`)).ok, { timeoutMs: 60000, label: `Vite on :${PORTS.web} (see ${path.join(RUN_DIR, 'logs', 'web.log')})` });
    await waitFor(async () => (await fetch(`${WEB}/api/health/jobs`)).ok, { timeoutMs: 10000, label: 'the /api proxy' });
    t.web = Date.now() - s;

    s = Date.now();
    state.pids.browser = spawnDetached('browserd', process.execPath, [SELF, '__browserd'], { cwd: REPO, env: { ...process.env } });
    writeState(state);
    await waitFor(async () => (await fetch(`http://127.0.0.1:${PORTS.cdp}/json/version`)).ok, { timeoutMs: 30000, label: 'browser CDP' });
    t.browser = Date.now() - s;
    state.timingsMs = t;
    writeState(state);
    return { ok: true, runId, rateLimit: plan.rateLimit, urls: { web: WEB, api: API }, account: DEMO, pids: state.pids, containers: state.containers, timingsMs: t, evidenceDir: evidenceDir(state), next: 'control-toko doctor' };
  },
};

COMMANDS.doctor = {
  summary: 'Read-only health check: is this instance ours, up, seeded and drivable?',
  help: `control-toko doctor

Checks: state file, recorded pids alive, labelled container running, API /api/health/jobs (never /api/health: it pings Stripe),
the SPA and the /api proxy on :${PORTS.web}, demo parent seeded with its 2 synthetic
children, CDP reachable, third-party env empty in the API process. Exit 1 if a check fails.`,
  async run() {
    const state = readState();
    const checks = { stateFile: !!state };
    const hints = [];
    if (!state) {
      hints.push('No run recorded: `control-toko launch`.');
      process.exitCode = 1;
      return { ok: false, checks, hints };
    }
    checks.pids = Object.fromEntries(Object.entries(state.pids).map(([k, p]) => [k, alive(p)]));
    checks.container = containerRunning(PG) && containerLabelled(PG);
    const ok = async (u) => {
      try {
        return (await fetch(u)).ok;
      } catch {
        return false;
      }
    };
    checks.apiHealth = await ok(`${API}/api/health/jobs`);
    checks.spa = await ok(`${WEB}/login`);
    checks.apiProxy = await ok(`${WEB}/api/health/jobs`);
    checks.browserCdp = await ok(`http://127.0.0.1:${PORTS.cdp}/json/version`);
    try {
      checks.demoParent = psql(`select count(*) from "user" where email = ${lit(DEMO.email)}`) === '1';
      checks.demoChildren = Number(psql(`select count(*) from children c join "user" u on u.id = c.parent_id where u.email = ${lit(DEMO.email)}`));
    } catch (e) {
      checks.demoParent = false;
      hints.push(`DB query failed: ${e.message.split('\n')[0]}`);
    }
    try {
      const environ = fs.readFileSync(`/proc/${state.pids.api}/environ`, 'utf8').split('\0');
      const get = (k) => (environ.find((l) => l.startsWith(k + '=')) || '').slice(k.length + 1);
      checks.thirdPartyEnvFake = ['RESEND_API_KEY', 'VAPID_PRIVATE_KEY', 'KOE_IDENTITY_SECRET'].every((k) => get(k) === '') && get('STRIPE_SECRET_KEY').includes('toko_verify_fake');
    } catch {
      checks.thirdPartyEnvFake = null;
    }
    checks.rateLimit = state.rateLimit ? 'on' : 'bypassed';
    checks.gitSha = state.gitSha;
    const required = [...Object.values(checks.pids), checks.container, checks.apiHealth, checks.spa, checks.apiProxy, checks.browserCdp, checks.demoParent, checks.demoChildren >= 2, checks.thirdPartyEnvFake !== false];
    const allOk = required.every(Boolean);
    if (!checks.apiHealth) hints.push(`API down: read ${path.join(RUN_DIR, 'logs', 'api.log')}.`);
    if (!checks.spa) hints.push(`Vite down: read ${path.join(RUN_DIR, 'logs', 'web.log')}.`);
    if (!allOk) {
      hints.push('Run `control-toko teardown`, then `control-toko launch`.');
      process.exitCode = 1;
    }
    return { ok: allOk, runId: state.runId, checks, hints };
  },
};

COMMANDS.info = {
  summary: 'Print the recorded run: urls, fake credentials, pids, evidence dir.',
  help: 'control-toko info',
  async run() {
    const state = requireState();
    return { ok: true, runId: state.runId, gitSha: state.gitSha, urls: { web: WEB, api: API }, account: DEMO, pids: state.pids, containers: state.containers, evidenceDir: evidenceDir(state), timingsMs: state.timingsMs };
  },
};

COMMANDS.teardown = {
  summary: 'Stop what launch started (recorded pids, labelled container); keep evidence.',
  help: `control-toko teardown [--dry-run]

Kills only the process groups recorded in state.json (never by name), removes ${PG} only if it
carries ${LABEL}, copies logs + console/network JSONL into <evidence>/run-logs/, deletes
.verify-run/ and the generated Vite config, then reports portsStillOpen (must be []).`,
  async run(flags) {
    const state = readState();
    const plan = { pids: state?.pids || {}, containers: containerLabelled(PG) ? [PG] : [], remove: [RUN_DIR, VITE_CONFIG] };
    if (flags['dry-run']) return { ok: true, dryRun: true, plan };
    const killed = {};
    for (const [k, pid] of Object.entries(plan.pids)) {
      if (!alive(pid)) {
        killed[k] = 'not running';
        continue;
      }
      try {
        process.kill(-pid, 'SIGTERM');
      } catch {
        try {
          process.kill(pid, 'SIGTERM');
        } catch {}
      }
      killed[k] = 'SIGTERM';
    }
    await sleep(1500);
    for (const [k, pid] of Object.entries(plan.pids)) {
      if (alive(pid)) {
        try {
          process.kill(-pid, 'SIGKILL');
        } catch {}
        killed[k] = 'SIGKILL';
      }
    }
    const removed = [];
    if (containerLabelled(PG)) {
      docker('rm', '-f', PG);
      removed.push(PG);
    }
    let savedLogs = null;
    if (state) {
      savedLogs = path.join(evidenceDir(state), 'run-logs');
      fs.mkdirSync(savedLogs, { recursive: true });
      for (const f of ['console.jsonl', 'network.jsonl']) if (fs.existsSync(path.join(RUN_DIR, f))) fs.copyFileSync(path.join(RUN_DIR, f), path.join(savedLogs, f));
      if (fs.existsSync(path.join(RUN_DIR, 'logs'))) fs.cpSync(path.join(RUN_DIR, 'logs'), path.join(savedLogs, 'logs'), { recursive: true });
    }
    fs.rmSync(RUN_DIR, { recursive: true, force: true });
    fs.rmSync(VITE_CONFIG, { force: true });
    const portsStillOpen = [];
    for (const [k, p] of Object.entries(PORTS)) if (await portInUse(p)) portsStillOpen.push(`${k}:${p}`);
    if (portsStillOpen.length) process.exitCode = 1;
    return { ok: portsStillOpen.length === 0, killed, removedContainers: removed, savedLogs, evidenceKept: state ? evidenceDir(state) : null, portsStillOpen, ...(portsStillOpen.length ? { fix: 'Find the owner with `ss -ltnp`; kill it only if this harness started it.' } : {}) };
  },
};

COMMANDS.goto = {
  summary: 'Navigate the shared page to an SPA path or a full URL.',
  help: 'control-toko goto <path|url>\n\nExample: control-toko goto /journal. Waits for network idle and prints the final URL and <h1>.',
  async run(_f, pos) {
    if (!pos[0]) fail('Missing path.', 'Example: control-toko goto /dashboard');
    return withPage(async ({ page }) => {
      const resp = await page.goto(resolveUrl(pos[0]), { waitUntil: 'domcontentloaded' });
      await settle(page);
      const h1 = await page.locator('h1').first().textContent({ timeout: 5000 }).catch(() => null);
      return { ok: true, url: page.url(), status: resp?.status() ?? null, h1: h1?.trim() ?? null };
    });
  },
};

COMMANDS.login = {
  summary: 'Sign the shared browser in as the demo parent through the real /login form.',
  help: `control-toko login [--email <e>] [--password <p>] [--dry-run]

Opens /login, fills the e-mail and password fields, clicks "Se connecter", waits for the
dashboard. Default account: ${DEMO.email} / ${DEMO.password} (seeded, synthetic). Then marks
the onboarding tour as completed in localStorage (as e2e/auth.setup.ts does), so the modal
does not block later commands. Second read: GET /api/auth/get-session with the browser cookie.
Side effect: one Better Auth session row.`,
  async run(flags) {
    const email = typeof flags.email === 'string' ? flags.email : DEMO.email;
    const password = typeof flags.password === 'string' ? flags.password : DEMO.password;
    if (flags['dry-run']) return { ok: true, dryRun: true, account: email, steps: ['goto /login', 'fill E-mail + Mot de passe', 'click Se connecter', 'wait /dashboard', 'set onboardingCompleted'] };
    return withPage(async ({ page, ctx, state }) => {
      await page.goto(resolveUrl('/login'), { waitUntil: 'domcontentloaded' });
      await settle(page);
      const form = page.locator('form').filter({ has: page.locator('input[type="password"]') }).first();
      await form.waitFor({ timeout: 15000 }).catch(() => fail('No login form with a password field on /login.', 'Run `control-toko snapshot` to see the page.'));
      await form.locator('input[type="email"], input[name="email"]').first().fill(email);
      await form.locator('input[type="password"]').first().fill(password);
      const calls = await captureApi(page, async () => {
        await form.getByRole('button', { name: /se connecter/i }).first().click();
        await page.waitForURL(/\/dashboard/, { timeout: 15000 }).catch(() => {});
      }, /\/api\/auth\//);
      await page.evaluate(() => {
        const raw = window.localStorage.getItem('toko-ui');
        const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
        parsed.state = { ...(parsed.state || {}), onboardingCompleted: true };
        window.localStorage.setItem('toko-ui', JSON.stringify(parsed));
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await settle(page);
      const session = await apiGet(ctx, '/api/auth/get-session');
      const file = artifactPath(state, 'after-login');
      await page.screenshot({ path: file });
      const ok = /\/dashboard/.test(page.url()) && session.json?.user?.email === email;
      if (!ok) process.exitCode = 1;
      return { ok, url: page.url(), signIn: calls.map(({ path: p, status }) => ({ path: p, status })), sessionUser: session.json?.user ? { email: session.json.user.email, name: session.json.user.name } : null, file, ...(ok ? {} : { fix: 'Read `control-toko console --level error` and the sign-in status; 429 means the sign-in rate limit (10/min): wait a minute.' }) };
    });
  },
};

COMMANDS.click = {
  summary: 'Click by role+name (preferred), label, or text on the shared page.',
  help: 'control-toko click (--role <role> --name <regex> | --label <regex> | --text <regex>) [--within dialog|main] [--dry-run]\n\nExample: control-toko click --role button --name "^Ajouter$" --within main\nPrints the non-GET /api calls the click triggered. --dry-run counts matches without clicking.',
  async run(flags) {
    return withPage(async ({ page }) => {
      const scope = flags.within ? page.locator(flags.within === 'dialog' ? '[role="dialog"]' : flags.within).last() : page;
      const loc = flags.role ? scope.getByRole(flags.role, { name: new RegExp(flags.name || '.', 'i') }) : flags.label ? scope.getByLabel(new RegExp(flags.label, 'i')) : flags.text ? scope.getByText(new RegExp(flags.text, 'i')) : null;
      if (!loc) fail('No locator given.', 'Pass --role button --name "Ajouter" (preferred), --label or --text.');
      const count = await loc.count();
      if (count === 0) fail('Locator matched nothing.', 'Run `control-toko snapshot` and copy the role/name from the ARIA tree.');
      if (flags['dry-run']) return { ok: true, dryRun: true, matches: count };
      const calls = await captureApi(page, () => loc.first().click());
      return { ok: true, matches: count, url: page.url(), apiCalls: calls };
    });
  },
};

COMMANDS.fill = {
  summary: 'Type into a field found by its label, placeholder or CSS selector.',
  help: 'control-toko fill (--label <regex> | --placeholder <regex> | --selector <css>) --value <text> [--dry-run]\n\nExample: control-toko fill --selector "#notes" --value "Journée calme (fake)"',
  async run(flags) {
    if (typeof flags.value !== 'string') fail('Missing --value.', 'Example: control-toko fill --label "Notes" --value "text"');
    return withPage(async ({ page }) => {
      const loc = flags.label ? page.getByLabel(new RegExp(flags.label, 'i')) : flags.placeholder ? page.getByPlaceholder(new RegExp(flags.placeholder, 'i')) : flags.selector ? page.locator(flags.selector) : null;
      if (!loc) fail('No locator given.', 'Pass --label, --placeholder or --selector.');
      const count = await loc.count();
      if (!count) fail('Field not found.', 'Run `control-toko snapshot` to see field labels.');
      if (flags['dry-run']) return { ok: true, dryRun: true, matches: count };
      await loc.first().fill(flags.value);
      return { ok: true, matches: count };
    });
  },
};

COMMANDS.key = {
  summary: 'Press a key on the focused element (Enter, Escape, Tab...).',
  help: 'control-toko key <Key>\n\nExample: control-toko key Escape (closes a dialog).',
  async run(_f, pos) {
    if (!pos[0]) fail('Missing key.', 'Example: control-toko key Enter');
    return withPage(async ({ page }) => {
      await page.keyboard.press(pos[0]);
      return { ok: true, key: pos[0] };
    });
  },
};

COMMANDS.screenshot = {
  summary: 'Save a PNG of the shared page into the evidence dir.',
  help: 'control-toko screenshot [--name <label>] [--full-page] [--mobile]\n\nWrites <evidence>/<timestamp>_<label>.png. --mobile shoots at 390x844 then restores 1280x800.',
  async run(flags) {
    return withPage(async ({ page, state }) => {
      const file = artifactPath(state, flags.name);
      if (flags.mobile) {
        await page.setViewportSize({ width: 390, height: 844 });
        await sleep(500);
      }
      await page.screenshot({ path: file, fullPage: !!flags['full-page'] });
      if (flags.mobile) await page.setViewportSize({ width: 1280, height: 800 });
      return { ok: true, file, url: page.url() };
    });
  },
};

COMMANDS.snapshot = {
  summary: 'ARIA snapshot of the shared page (roles + accessible names to drive by).',
  help: 'control-toko snapshot [--name <label>] [--selector <css>]\n\nPrints the ARIA tree (YAML) of main (or --selector; use "body" for everything, "[role=dialog]" for an open dialog)\nand saves it as <evidence>/<ts>_<label>.aria.yml.',
  async run(flags) {
    return withPage(async ({ page, state }) => {
      const sel = flags.selector || 'main';
      const loc = page.locator(sel).last();
      if (!(await loc.count())) fail(`Nothing matches ${sel}.`, 'Try --selector body.');
      const yml = await loc.ariaSnapshot();
      const file = artifactPath(state, flags.name || 'snapshot', '.aria.yml');
      fs.writeFileSync(file, yml);
      return { ok: true, url: page.url(), file, aria: yml };
    });
  },
};

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}
COMMANDS.console = {
  summary: 'Browser console messages recorded by the daemon since launch.',
  help: 'control-toko console [--level error|warning|log|pageerror] [--grep <regex>] [--last N]\n\nReads .verify-run/console.jsonl (copied into the evidence dir by teardown).',
  async run(flags) {
    requireState();
    let rows = readJsonl(path.join(RUN_DIR, 'console.jsonl'));
    if (flags.level) rows = rows.filter((r) => r.type === flags.level);
    if (flags.grep) rows = rows.filter((r) => new RegExp(flags.grep, 'i').test(r.text));
    return { ok: true, total: rows.length, messages: rows.slice(-parseInt(flags.last || '50', 10)) };
  },
};
COMMANDS['network-log'] = {
  summary: 'HTTP requests recorded by the daemon (method, url, status, timing).',
  help: 'control-toko network-log [--filter <substring>] [--status-min 400] [--failed] [--last N]\n\nReads .verify-run/network.jsonl. Example: control-toko network-log --filter /api/ --status-min 400',
  async run(flags) {
    requireState();
    let rows = readJsonl(path.join(RUN_DIR, 'network.jsonl'));
    if (flags.filter) rows = rows.filter((r) => r.url.includes(flags.filter));
    if (flags['status-min']) rows = rows.filter((r) => (r.status || 0) >= parseInt(flags['status-min'], 10));
    if (flags.failed) rows = rows.filter((r) => r.status === null);
    return { ok: true, total: rows.length, requests: rows.slice(-parseInt(flags.last || '50', 10)) };
  },
};

COMMANDS.api = {
  summary: "Read-only GET on the API with the browser's session (second read for UI proofs).",
  help: 'control-toko api <path>\n\nExample: control-toko api /api/children. GET only, with the shared browser\'s cookies, so it sees what the\nsigned-in parent sees. There is no write mode: drive writes through the UI.',
  async run(_f, pos) {
    if (!pos[0] || !pos[0].startsWith('/api/')) fail('Missing or invalid path.', 'Example: control-toko api /api/children');
    return withPage(async ({ ctx }) => {
      const r = await apiGet(ctx, pos[0]);
      return { ok: r.status < 400, path: pos[0], ...r };
    });
  },
};

COMMANDS.db = {
  summary: 'Read-only SQL against the throwaway DB (second read; shows encryption at rest).',
  help: `control-toko db "<select ...>"

Runs one read-only statement (BEGIN READ ONLY) inside ${PG} and prints the rows as JSON.
Example: control-toko db "select id, name, age_range from children order by created_at desc limit 3"
children.name is AES-256-GCM ciphertext at rest: the DB shows it encrypted, the API decrypts it.`,
  async run(_f, pos) {
    requireState();
    const q = pos.join(' ').trim().replace(/;+\s*$/, '');
    if (!/^(select|with)\b/i.test(q)) fail('Only SELECT/WITH statements are allowed.', 'Writes go through the UI; reads look like: control-toko db "select count(*) from symptoms"');
    let raw;
    try {
      raw = sh('docker', ['exec', PG, 'psql', '-U', DB.user, '-d', DB.name, '-v', 'ON_ERROR_STOP=1', '-At', '-c', `begin read only; select coalesce(json_agg(t), '[]'::json) from (${q}) t; commit;`]);
    } catch (e) {
      const pgError = String(e.stderr || e.message).split('\n').find((l) => /ERROR/.test(l)) || e.message.split('\n')[0];
      fail(`SQL failed: ${pgError.trim()}`, 'List the columns first: control-toko db "select column_name from information_schema.columns where table_name = \'symptoms\'"');
    }
    const line = raw.split('\n').find((l) => l.startsWith('['));
    return { ok: true, rows: JSON.parse(line || '[]') };
  },
};

// ---------- parent flows ----------
const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
async function openDialog(page, path, buttonName, dialogName) {
  await page.goto(resolveUrl(path), { waitUntil: 'domcontentloaded' });
  await settle(page);
  await requireLoggedIn(page);
  const btn = page.locator('main').getByRole('button', { name: buttonName, exact: true });
  await btn.waitFor({ timeout: 10000 }).catch(() => fail(`No "${buttonName}" button on ${path}.`, 'Is a child selected? Run `control-toko snapshot` (no child means the welcome screen).'));
  await btn.click();
  const dialog = page.getByRole('dialog', { name: dialogName });
  await dialog.waitFor({ timeout: 5000 }).catch(() => fail(`Dialog "${dialogName}" did not open.`, 'Run `control-toko snapshot --selector body`.'));
  return dialog;
}
// Picks the active child in the sidebar combobox (the app scopes every page to it).
async function selectChild(page, name) {
  if (!name) return null;
  await page.goto(resolveUrl('/dashboard'), { waitUntil: 'domcontentloaded' });
  await settle(page);
  await requireLoggedIn(page);
  const combo = page.locator('[data-slot="sidebar"]').first().getByRole('combobox').first();
  await combo.waitFor({ timeout: 10000 }).catch(() => fail('No child selector in the sidebar.', 'The parent has no child yet: run `control-toko child add --name "..."`.'));
  if (new RegExp(escapeRe(name)).test((await combo.textContent()) || '')) return name;
  await combo.click();
  const opt = page.getByRole('option', { name: new RegExp(escapeRe(name)) });
  // The listbox renders in a portal after the click: wait for it before deciding.
  await opt.first().waitFor({ timeout: 5000 }).catch(() => fail(`No child named "${name}" in the selector.`, 'Run `control-toko api /api/children` to list the names.'));
  await opt.first().click();
  await settle(page);
  return name;
}
async function childByName(ctx, name) {
  const r = await apiGet(ctx, '/api/children');
  const list = Array.isArray(r.json) ? r.json : r.json?.data || [];
  return list.find((c) => c.name === name) || null;
}

const AGE_RANGES = { '0-5': '0 à 5 ans', '6-8': '6 à 8 ans', '9-11': '9 à 11 ans', '12-14': '12 à 14 ans', '15-17': '15 à 17 ans' };
COMMANDS.child = {
  summary: 'Add a child through the sidebar "Ajouter un enfant" dialog (synthetic names only).',
  help: `control-toko child add --name <fake name> [--age 0-5|6-8|9-11|12-14|15-17] [--dry-run]

Drives the real dialog: Prénom, Tranche d'âge (default 9-11), the RGPD art. 9 consent checkbox,
then "Ajouter". Use an obviously fake name ("Pilote Fictif"): never a real child's name.
Proof: the POST /api/children response, before/after screenshots, the children row
(name stored as enc::v1:: ciphertext) and GET /api/children returning the decrypted name.
Side effect: one children row (+ its consent record) for the signed-in parent.`,
  async run(flags, pos) {
    if (pos[0] !== 'add') fail('Unknown or missing subcommand.', 'Usage: control-toko child add --name "Pilote Fictif"');
    if (typeof flags.name !== 'string' || !flags.name.trim()) fail('Missing --name.', 'Example: control-toko child add --name "Pilote Fictif" (synthetic names only).');
    const age = typeof flags.age === 'string' ? flags.age : '9-11';
    if (!AGE_RANGES[age]) fail(`Unknown --age ${age}.`, `Use one of ${Object.keys(AGE_RANGES).join(', ')}.`);
    if (flags['dry-run']) return { ok: true, dryRun: true, would: { name: flags.name, ageRange: age, consent: true }, writes: ['children row', 'consent record'] };
    return withPage(async ({ page, ctx, state }) => {
      await page.goto(resolveUrl('/dashboard'), { waitUntil: 'domcontentloaded' });
      await settle(page);
      await requireLoggedIn(page);
      const add = page.getByRole('button', { name: 'Ajouter un enfant', exact: true }).first();
      await add.click();
      const dialog = page.getByRole('dialog', { name: 'Ajouter un enfant' });
      await dialog.waitFor({ timeout: 5000 });
      await dialog.getByLabel('Prénom', { exact: true }).fill(flags.name);
      // Age range and consent appear once a name is typed (progressive disclosure).
      await dialog.getByRole('combobox', { name: "Tranche d'âge" }).click();
      await page.getByRole('option', { name: AGE_RANGES[age], exact: true }).click();
      await dialog.getByRole('checkbox', { name: /autorité parentale/ }).check();
      const before = artifactPath(state, 'child-add-filled');
      await page.screenshot({ path: before });
      const calls = await captureApi(page, () => dialog.getByRole('button', { name: 'Ajouter', exact: true }).click(), /\/api\/children$/);
      const post = calls.find((c) => c.method === 'POST');
      const after = artifactPath(state, 'child-add-result');
      await page.screenshot({ path: after });
      const id = post?.body?.id;
      const dbRow = id ? psqlJson(`select id, name, age_range, parent_id, created_at from children where id = ${lit(id)}`)[0] || null : null;
      const viaApi = await childByName(ctx, flags.name);
      const ok = post?.status === 201 && !!dbRow && String(dbRow.name).startsWith('enc::') && viaApi?.id === id;
      if (!ok) process.exitCode = 1;
      return { ok, response: post ? { status: post.status, body: post.body } : null, childId: id || null, dbRow, nameEncryptedAtRest: dbRow ? String(dbRow.name).startsWith('enc::') : null, apiReadBack: viaApi, evidence: { before, after }, ...(ok ? {} : { fix: 'Check `control-toko network-log --filter /api/children` and `control-toko console --level error`.' }) };
    });
  },
};

COMMANDS.symptom = {
  summary: 'Log a daily symptom entry (Suivi > Symptômes > Ajouter) for a child.',
  help: `control-toko symptom log [--child <name>] [--preset calme|difficile] [--context <t>] [--notes <t>] [--dry-run]

Selects the child in the sidebar (default: the active one), opens /symptoms, clicks "Ajouter",
applies the "Journée calme"/"Journée difficile" shortcut (default difficile; edit mode hides the
shortcuts, then presetApplied is false and the sliders keep their values), fills Contexte and
Notes, then "Enregistrer le relevé" (or "Mettre à jour le relevé" when today already has one).
Proof: the POST /api/symptoms response, before/after screenshots, the symptoms row.
Side effect: one symptoms row for today (upsert per child and date).`,
  async run(flags, pos) {
    if (pos[0] !== 'log') fail('Unknown or missing subcommand.', 'Usage: control-toko symptom log --child "Pilote Fictif"');
    const preset = flags.preset === 'calme' ? 'Journée calme' : 'Journée difficile';
    if (flags['dry-run']) return { ok: true, dryRun: true, would: { child: flags.child || '(active)', preset, context: flags.context || null, notes: flags.notes || null }, writes: ['symptoms row (today)'] };
    return withPage(async ({ page, ctx, state }) => {
      await selectChild(page, typeof flags.child === 'string' ? flags.child : null);
      const dialog = await openDialog(page, '/symptoms', 'Ajouter', 'Nouveau relevé');
      // Edit mode (today already has a reading) hides the "Raccourcis" presets.
      const existing = await dialog.getByRole('alert').filter({ hasText: /existe déjà/ }).count();
      const presetBtn = dialog.getByRole('button', { name: preset, exact: true });
      const presetApplied = (await presetBtn.count()) > 0;
      if (presetApplied) await presetBtn.click();
      if (typeof flags.context === 'string') await dialog.getByLabel('Contexte', { exact: true }).fill(flags.context);
      if (typeof flags.notes === 'string') await dialog.getByLabel('Notes', { exact: true }).fill(flags.notes);
      const before = artifactPath(state, 'symptom-filled');
      await page.screenshot({ path: before });
      const calls = await captureApi(page, () => dialog.getByRole('button', { name: /^(Enregistrer|Mettre à jour) le relevé$/ }).click(), /\/api\/symptoms/);
      const write = calls.find((c) => c.method === 'POST' || c.method === 'PUT' || c.method === 'PATCH');
      const after = artifactPath(state, 'symptom-result');
      await page.screenshot({ path: after });
      const id = write?.body?.id;
      const dbRow = id ? psqlJson(`select id, child_id, date, agitation, focus, impulse, mood, sleep, routines_ok, context, notes from symptoms where id = ${lit(id)}`)[0] || null : null;
      const ok = !!write && write.status < 300 && !!dbRow;
      if (!ok) process.exitCode = 1;
      return { ok, child: flags.child || '(active)', mode: existing ? 'update (a reading already existed for today)' : 'create', presetApplied, response: write ? { method: write.method, status: write.status, body: write.body } : null, dbRow, evidence: { before, after }, ...(ok ? {} : { fix: 'Check `control-toko network-log --filter /api/symptoms --status-min 400`.' }) };
    });
  },
};

COMMANDS.journal = {
  summary: 'Write a journal entry (Journal > Écrire) for a child, with optional tags.',
  help: `control-toko journal add --text <t> [--child <name>] [--tags "Victoire,École"] [--dry-run]

Selects the child, opens /journal, clicks "Écrire", fills Notes, toggles the tag buttons, then
"Ajouter l'entrée". Tags: École, Victoire, Crise, Traitement, Sommeil, Sport, Thérapie.
Proof: the POST /api/journal response, before/after screenshots, the journal_entries row,
and the entry text visible on /journal afterwards.
Side effect: one journal_entries row.`,
  async run(flags, pos) {
    if (pos[0] !== 'add') fail('Unknown or missing subcommand.', 'Usage: control-toko journal add --text "Entrée synthétique"');
    if (typeof flags.text !== 'string' || !flags.text.trim()) fail('Missing --text.', 'Example: control-toko journal add --text "Bonne matinée (fake)" --tags Victoire');
    const tags = typeof flags.tags === 'string' ? flags.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    if (flags['dry-run']) return { ok: true, dryRun: true, would: { child: flags.child || '(active)', text: flags.text, tags }, writes: ['journal_entries row'] };
    return withPage(async ({ page, state }) => {
      await selectChild(page, typeof flags.child === 'string' ? flags.child : null);
      const dialog = await openDialog(page, '/journal', 'Écrire', 'Nouvelle entrée');
      await dialog.getByLabel('Notes', { exact: true }).fill(flags.text);
      for (const t of tags) {
        const b = dialog.getByRole('button', { name: t, exact: true });
        if (!(await b.count())) fail(`No tag button "${t}".`, 'Tags: École, Victoire, Crise, Traitement, Sommeil, Sport, Thérapie.');
        await b.click();
      }
      const before = artifactPath(state, 'journal-filled');
      await page.screenshot({ path: before });
      const calls = await captureApi(page, () => dialog.getByRole('button', { name: "Ajouter l'entrée", exact: true }).click(), /\/api\/journal/);
      const post = calls.find((c) => c.method === 'POST');
      await dialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      const visible = await page.locator('main').getByText(flags.text, { exact: false }).first().isVisible().catch(() => false);
      const after = artifactPath(state, 'journal-result');
      await page.screenshot({ path: after });
      const id = post?.body?.id;
      const dbRow = id ? psqlJson(`select id, child_id, date, text, tags, created_at from journal_entries where id = ${lit(id)}`)[0] || null : null;
      const ok = post?.status === 201 && !!dbRow && visible;
      if (!ok) process.exitCode = 1;
      return { ok, child: flags.child || '(active)', response: post ? { status: post.status, body: post.body } : null, dbRow, visibleOnJournalPage: visible, evidence: { before, after }, ...(ok ? {} : { fix: 'Check `control-toko network-log --filter /api/journal` and `control-toko snapshot`.' }) };
    });
  },
};

// ---------- main ----------
function usage() {
  const lines = Object.entries(COMMANDS).map(([k, c]) => `  ${k.padEnd(12)} ${c.summary}`);
  return `control-toko: drive a throwaway local Tokō (web app + API) like a parent. Expo mobile is out of scope.

Usage: control-toko <command> [flags]      (one JSON object on stdout; exit 1 on failure)

Health:       doctor, info, teardown
Lifecycle:    launch
Navigation:   goto, login
Interaction:  child, symptom, journal, click, fill, key
Inspection:   screenshot, snapshot, api, db
Streaming:    console, network-log

${lines.join('\n')}

Typical run:
  control-toko launch && control-toko doctor
  control-toko login
  control-toko child add --name "Pilote (fake)"
  control-toko symptom log --child "Pilote (fake)" --notes "Relevé synthétique"
  control-toko journal add --child "Pilote (fake)" --text "Entrée synthétique"
  control-toko teardown

URLs: web ${WEB}  api ${API}   account ${DEMO.email} / ${DEMO.password} (seeded, synthetic)
Evidence: ${EVIDENCE_ROOT}/<runId>/ (TOKO_EVIDENCE_DIR), survives teardown; every call is appended
to <runId>/transcript.txt. Commands with side effects accept --dry-run.
\`control-toko <command> --help\` for details.`;
}

async function main() {
  const argv = process.argv.slice(2);
  const [cmd, ...rest] = argv;
  if (cmd === '__browserd') return browserd();
  if (!cmd || cmd === '--help' || cmd === '-h' || cmd === 'help') {
    process.stdout.write(usage() + '\n');
    return;
  }
  const c = COMMANDS[cmd];
  if (!c) {
    out({ ok: false, error: `Unknown command "${cmd}".`, fix: `Run \`control-toko --help\`. Commands: ${Object.keys(COMMANDS).join(', ')}` });
    process.exitCode = 1;
    return;
  }
  const { pos, flags } = parseArgs(rest);
  if (flags.help || flags.h) {
    process.stdout.write(c.help + '\n');
    return;
  }
  const preState = readState();
  let text;
  try {
    text = out(await c.run(flags, pos));
  } catch (e) {
    text = out({ ok: false, command: cmd, error: e.message.split('\n')[0], fix: e.fix || 'Run `control-toko doctor` and read .verify-run/logs/.', ...(e.extra || {}) });
    process.exitCode = 1;
  }
  const state = readState() || preState;
  if (state) {
    try {
      fs.appendFileSync(path.join(evidenceDir(state), 'transcript.txt'), `$ control-toko ${argv.join(' ')}\n${text}\n\n`);
    } catch {}
  }
}
main();
