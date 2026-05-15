#!/usr/bin/env node
/**
 * CLI Tokō.
 *
 * Outil en ligne de commande, en LECTURE SEULE, pour consulter les données
 * de suivi d'un enfant. Destiné aux agents IA disposant d'un terminal
 * (Claude Code, scripts, CI…) — un assistant conversationnel sans shell
 * passe lui par le serveur MCP (`@toko/mcp`).
 *
 * S'appuie sur la même clé d'accès `toko_sk_…` et la même surface en
 * lecture seule que le serveur MCP. Aucune écriture n'est possible.
 *
 * Authentification : variable d'environnement TOKO_API_KEY (ou --key).
 * Hôte de l'API : TOKO_API_URL (ou --url), par défaut http://localhost:3001.
 */
import { parseArgs } from "node:util";

const VERSION = "0.1.0";

interface CommandDef {
  /** Builds the API path; receives the positional argument if any. */
  path: (arg: string) => string;
  /** Name of the required positional argument, or null if none. */
  arg: string | null;
  desc: string;
}

const COMMANDS: Record<string, CommandDef> = {
  children: {
    path: () => "/api/children",
    arg: null,
    desc: "Lister les enfants accessibles",
  },
  child: {
    path: (id) => `/api/children/${encodeURIComponent(id)}`,
    arg: "id-enfant",
    desc: "Détail d'un enfant",
  },
  symptoms: {
    path: (id) => `/api/symptoms/${encodeURIComponent(id)}`,
    arg: "id-enfant",
    desc: "Symptômes TDAH d'un enfant",
  },
  journal: {
    path: (id) => `/api/journal/${encodeURIComponent(id)}`,
    arg: "id-enfant",
    desc: "Entrées de journal d'un enfant",
  },
  strengths: {
    path: (id) => `/api/strengths/${encodeURIComponent(id)}`,
    arg: "id-enfant",
    desc: "Forces et réussites d'un enfant",
  },
  medications: {
    path: (id) => `/api/medications/${encodeURIComponent(id)}`,
    arg: "id-enfant",
    desc: "Traitements d'un enfant",
  },
  adherence: {
    path: (id) => `/api/medications/${encodeURIComponent(id)}/adherence`,
    arg: "id-enfant",
    desc: "Observance des traitements d'un enfant",
  },
  routines: {
    path: (id) => `/api/routines/${encodeURIComponent(id)}`,
    arg: "id-enfant",
    desc: "Routines quotidiennes d'un enfant",
  },
  crisis: {
    path: (id) => `/api/crisis-list/${encodeURIComponent(id)}`,
    arg: "id-enfant",
    desc: "Plan de crise d'un enfant",
  },
  barkley: {
    path: (id) => `/api/barkley/behaviors/${encodeURIComponent(id)}`,
    arg: "id-enfant",
    desc: "Comportements Barkley d'un enfant",
  },
  stats: {
    path: (id) => `/api/stats/${encodeURIComponent(id)}`,
    arg: "id-enfant",
    desc: "Statistiques de suivi d'un enfant",
  },
  "parent-mood": {
    path: () => "/api/parent-mood",
    arg: null,
    desc: "Historique d'humeur du parent",
  },
};

function helpText(): string {
  const rows = Object.entries(COMMANDS)
    .map(([name, def]) => {
      const usage = def.arg ? `${name} <${def.arg}>` : name;
      return `  ${usage.padEnd(26)} ${def.desc}`;
    })
    .join("\n");
  return `toko — accès en lecture seule aux données de suivi Tokō (v${VERSION})

Usage :
  toko <commande> [argument] [options]

Commandes :
${rows}
  help                       Afficher cette aide

Options :
  --key <clé>     Clé d'accès (sinon : variable TOKO_API_KEY)
  --url <url>     Hôte de l'API (sinon : TOKO_API_URL, ou localhost:3001)
  --compact       Sortie JSON sur une seule ligne
  --version       Afficher la version

Exemples :
  export TOKO_API_KEY=toko_sk_votre_cle
  toko children
  toko stats 1234-5678 --compact

Codes de sortie : 0 succès · 1 erreur · 2 authentification · 3 quota dépassé`;
}

/** Print to stderr and exit with the given code. */
function errExit(message: string, code: number): never {
  console.error(`toko: ${message}`);
  process.exit(code);
}

async function main(): Promise<void> {
  let values: Record<string, string | boolean | undefined>;
  let positionals: string[];
  try {
    const parsed = parseArgs({
      allowPositionals: true,
      options: {
        key: { type: "string" },
        url: { type: "string" },
        compact: { type: "boolean" },
        help: { type: "boolean" },
        version: { type: "boolean" },
      },
    });
    values = parsed.values;
    positionals = parsed.positionals;
  } catch (err) {
    errExit(err instanceof Error ? err.message : String(err), 1);
  }

  if (values.version) {
    console.log(VERSION);
    return;
  }

  const command = positionals[0];
  if (!command || command === "help" || values.help) {
    console.log(helpText());
    return;
  }

  const def = COMMANDS[command];
  if (!def) {
    errExit(`commande inconnue « ${command} » — voir « toko help »`, 1);
  }

  let arg = "";
  if (def.arg) {
    const positional = positionals[1];
    if (!positional) {
      errExit(`argument requis : <${def.arg}> — voir « toko help »`, 1);
    }
    arg = positional;
  }

  const apiKey =
    typeof values.key === "string" ? values.key : process.env.TOKO_API_KEY;
  if (!apiKey) {
    errExit(
      "clé d'accès manquante — définissez TOKO_API_KEY ou utilisez --key",
      2,
    );
  }

  const apiUrl = (
    (typeof values.url === "string" ? values.url : process.env.TOKO_API_URL) ??
    "http://localhost:3001"
  ).replace(/\/$/, "");

  let res: Response;
  try {
    res = await fetch(`${apiUrl}${def.path(arg)}`, {
      headers: { "x-api-key": apiKey, accept: "application/json" },
    });
  } catch (err) {
    errExit(
      `impossible de joindre l'API (${apiUrl}) : ${
        err instanceof Error ? err.message : String(err)
      }`,
      1,
    );
  }

  const text = await res.text();
  if (!res.ok) {
    const code =
      res.status === 401 || res.status === 403
        ? 2
        : res.status === 429
          ? 3
          : 1;
    errExit(`erreur ${res.status} — ${text || res.statusText}`, code);
  }

  try {
    const data: unknown = JSON.parse(text);
    console.log(
      values.compact ? JSON.stringify(data) : JSON.stringify(data, null, 2),
    );
  } catch {
    console.log(text);
  }
}

main().catch((err) => {
  errExit(err instanceof Error ? err.message : String(err), 1);
});
