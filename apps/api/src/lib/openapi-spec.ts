// OpenAPI 3.1 description of the Tokō agent-readable surface.
//
// This documents ONLY the endpoints an agent access key can reach — the
// read-only tracking-data allowlist (see lib/agent-access.ts). It is served
// at GET /api/openapi.json and is the machine-readable contract behind both
// the developer docs and the Tokō MCP server.
//
// Keep it in sync with AGENT_READ_PREFIXES and the MCP tools.

const childIdParam = {
  name: "childId",
  in: "path",
  required: true,
  description: "Identifiant de l'enfant",
  schema: { type: "string" },
} as const;

function listOp(summary: string, itemRef: string, params: unknown[] = []) {
  return {
    summary,
    security: [{ agentKey: [] }],
    parameters: params,
    responses: {
      "200": {
        description: "OK",
        content: {
          "application/json": {
            schema: { type: "array", items: { $ref: itemRef } },
          },
        },
      },
      "401": { $ref: "#/components/responses/Unauthorized" },
      "403": { $ref: "#/components/responses/AgentForbidden" },
    },
  };
}

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Tokō — API d'accès agent",
    version: "1.0.0",
    description:
      "Surface en lecture seule permettant à l'assistant IA d'un parent de consulter les données de suivi de ses enfants. Authentification par clé d'accès (`toko_sk_…`) dans l'en-tête `x-api-key`.",
  },
  servers: [{ url: "/", description: "Hôte courant" }],
  components: {
    securitySchemes: {
      agentKey: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
        description:
          "Clé d'accès agent. Générée par le parent depuis la page Développeurs.",
      },
    },
    responses: {
      Unauthorized: {
        description: "Clé d'accès absente, invalide, expirée ou révoquée",
      },
      AgentForbidden: {
        description:
          "La clé est en lecture seule et limitée aux données de suivi",
      },
    },
    schemas: {
      Child: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          ageRange: { type: "string", enum: ["0-5", "6-8", "9-11", "12-14", "15-17"] },
          gender: { type: "string", enum: ["male", "female", "other"] },
          diagnosisType: {
            type: "string",
            enum: ["inattentive", "hyperactive", "mixed", "undefined"],
          },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Symptom: {
        type: "object",
        description: "Observation ponctuelle d'un symptôme TDAH",
        additionalProperties: true,
      },
      JournalEntry: {
        type: "object",
        description: "Entrée de journal quotidien (humeur, événements)",
        additionalProperties: true,
      },
      Medication: {
        type: "object",
        description: "Traitement et historique de prises",
        additionalProperties: true,
      },
      Routine: {
        type: "object",
        description: "Routine quotidienne et ses étapes",
        additionalProperties: true,
      },
      CrisisItem: {
        type: "object",
        description: "Étape du plan d'action en cas de crise",
        additionalProperties: true,
      },
      BarkleyBehavior: {
        type: "object",
        description: "Comportement suivi sur l'échelle Barkley",
        additionalProperties: true,
      },
      Stats: {
        type: "object",
        description: "Statistiques agrégées de suivi",
        additionalProperties: true,
      },
    },
  },
  paths: {
    "/api/children": {
      get: listOp("Lister les enfants accessibles", "#/components/schemas/Child"),
    },
    "/api/children/{id}": {
      get: {
        summary: "Détail d'un enfant",
        security: [{ agentKey: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Child" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/AgentForbidden" },
          "404": { description: "Enfant non trouvé" },
        },
      },
    },
    "/api/symptoms/{childId}": {
      get: listOp("Lister les symptômes d'un enfant", "#/components/schemas/Symptom", [childIdParam]),
    },
    "/api/journal/{childId}": {
      get: listOp("Lister les entrées de journal d'un enfant", "#/components/schemas/JournalEntry", [childIdParam]),
    },
    "/api/medications/{childId}": {
      get: listOp("Lister les traitements d'un enfant", "#/components/schemas/Medication", [childIdParam]),
    },
    "/api/medications/{childId}/adherence": {
      get: {
        summary: "Observance des traitements d'un enfant",
        security: [{ agentKey: [] }],
        parameters: [childIdParam],
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { type: "object" } } },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/AgentForbidden" },
        },
      },
    },
    "/api/routines/{childId}": {
      get: listOp("Lister les routines d'un enfant", "#/components/schemas/Routine", [childIdParam]),
    },
    "/api/crisis-list/{childId}": {
      get: listOp("Lister le plan de crise d'un enfant", "#/components/schemas/CrisisItem", [childIdParam]),
    },
    "/api/barkley/behaviors/{childId}": {
      get: listOp("Lister les comportements Barkley d'un enfant", "#/components/schemas/BarkleyBehavior", [childIdParam]),
    },
    "/api/stats/{childId}": {
      get: {
        summary: "Statistiques de suivi d'un enfant",
        security: [{ agentKey: [] }],
        parameters: [childIdParam],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Stats" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/AgentForbidden" },
        },
      },
    },
    "/api/parent-mood": {
      get: {
        summary: "Historique d'humeur du parent",
        security: [{ agentKey: [] }],
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { type: "array", items: { type: "object" } } } },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/AgentForbidden" },
        },
      },
    },
  },
} as const;
