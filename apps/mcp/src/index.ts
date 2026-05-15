#!/usr/bin/env node
/**
 * Serveur MCP Tokō.
 *
 * Expose, via le Model Context Protocol, un ensemble d'outils en LECTURE
 * SEULE permettant à l'assistant IA d'un parent de consulter les données
 * de suivi de ses enfants (symptômes, journal, traitements, routines…).
 *
 * Authentification : une clé d'accès `toko_sk_…` que le parent génère
 * depuis la page Développeurs de l'application, fournie via la variable
 * d'environnement TOKO_API_KEY.
 *
 * Aucune écriture n'est possible — l'API rejette toute requête non-GET
 * portée par une clé d'accès agent.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_URL = (process.env.TOKO_API_URL ?? "http://localhost:3001").replace(
  /\/$/,
  "",
);
const API_KEY = process.env.TOKO_API_KEY;

if (!API_KEY) {
  // stderr only — stdout is reserved for the MCP protocol stream.
  console.error(
    "[toko-mcp] TOKO_API_KEY manquante. Générez une clé sur la page " +
      "Développeurs de Tokō et exportez-la dans TOKO_API_KEY.",
  );
  process.exit(1);
}

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

/** GET an allowlisted Tokō endpoint with the agent key. */
async function apiGet(path: string): Promise<ToolResult> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { "x-api-key": API_KEY as string, accept: "application/json" },
    });
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Impossible de joindre l'API Tokō (${API_URL}) : ${
            err instanceof Error ? err.message : String(err)
          }`,
        },
      ],
    };
  }

  const body = await res.text();
  if (!res.ok) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Erreur ${res.status} sur ${path} : ${body || res.statusText}`,
        },
      ],
    };
  }

  return { content: [{ type: "text", text: body }] };
}

const server = new McpServer({ name: "toko", version: "1.0.0" });

const childIdShape = {
  childId: z.string().describe("Identifiant de l'enfant (voir list_children)"),
};
const readOnly = { readOnlyHint: true, idempotentHint: true } as const;

server.registerTool(
  "list_children",
  {
    title: "Lister les enfants",
    description:
      "Liste les enfants accessibles sur le compte du parent, avec leur identifiant.",
    inputSchema: {},
    annotations: readOnly,
  },
  async () => apiGet("/api/children"),
);

server.registerTool(
  "get_child",
  {
    title: "Détail d'un enfant",
    description: "Renvoie le profil détaillé d'un enfant.",
    inputSchema: childIdShape,
    annotations: readOnly,
  },
  async ({ childId }) => apiGet(`/api/children/${encodeURIComponent(childId)}`),
);

server.registerTool(
  "list_symptoms",
  {
    title: "Lister les symptômes",
    description: "Liste les symptômes TDAH suivis pour un enfant.",
    inputSchema: childIdShape,
    annotations: readOnly,
  },
  async ({ childId }) => apiGet(`/api/symptoms/${encodeURIComponent(childId)}`),
);

server.registerTool(
  "list_journal_entries",
  {
    title: "Lister le journal",
    description: "Liste les entrées de journal quotidien (humeurs, événements) d'un enfant.",
    inputSchema: childIdShape,
    annotations: readOnly,
  },
  async ({ childId }) => apiGet(`/api/journal/${encodeURIComponent(childId)}`),
);

server.registerTool(
  "list_strengths",
  {
    title: "Lister les forces",
    description: "Liste les forces et réussites identifiées chez un enfant.",
    inputSchema: childIdShape,
    annotations: readOnly,
  },
  async ({ childId }) => apiGet(`/api/strengths/${encodeURIComponent(childId)}`),
);

server.registerTool(
  "list_medications",
  {
    title: "Lister les traitements",
    description: "Liste les traitements et l'historique de prises d'un enfant.",
    inputSchema: childIdShape,
    annotations: readOnly,
  },
  async ({ childId }) =>
    apiGet(`/api/medications/${encodeURIComponent(childId)}`),
);

server.registerTool(
  "get_medication_adherence",
  {
    title: "Observance des traitements",
    description: "Renvoie le taux d'observance des traitements d'un enfant.",
    inputSchema: childIdShape,
    annotations: readOnly,
  },
  async ({ childId }) =>
    apiGet(`/api/medications/${encodeURIComponent(childId)}/adherence`),
);

server.registerTool(
  "list_routines",
  {
    title: "Lister les routines",
    description: "Liste les routines quotidiennes d'un enfant et leurs étapes.",
    inputSchema: childIdShape,
    annotations: readOnly,
  },
  async ({ childId }) => apiGet(`/api/routines/${encodeURIComponent(childId)}`),
);

server.registerTool(
  "list_crisis_plan",
  {
    title: "Plan de crise",
    description: "Liste les étapes du plan d'action en cas de crise d'un enfant.",
    inputSchema: childIdShape,
    annotations: readOnly,
  },
  async ({ childId }) =>
    apiGet(`/api/crisis-list/${encodeURIComponent(childId)}`),
);

server.registerTool(
  "list_barkley_behaviors",
  {
    title: "Comportements Barkley",
    description: "Liste les comportements suivis sur l'échelle Barkley d'un enfant.",
    inputSchema: childIdShape,
    annotations: readOnly,
  },
  async ({ childId }) =>
    apiGet(`/api/barkley/behaviors/${encodeURIComponent(childId)}`),
);

server.registerTool(
  "get_child_stats",
  {
    title: "Statistiques de suivi",
    description:
      "Renvoie les statistiques agrégées de suivi d'un enfant (tendances de symptômes, humeurs).",
    inputSchema: childIdShape,
    annotations: readOnly,
  },
  async ({ childId }) => apiGet(`/api/stats/${encodeURIComponent(childId)}`),
);

server.registerTool(
  "get_parent_mood",
  {
    title: "Humeur du parent",
    description: "Renvoie l'historique des points d'humeur du parent.",
    inputSchema: {},
    annotations: readOnly,
  },
  async () => apiGet("/api/parent-mood"),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[toko-mcp] Serveur MCP Tokō prêt — API : ${API_URL}`);
}

main().catch((err) => {
  console.error("[toko-mcp] Échec du démarrage :", err);
  process.exit(1);
});
