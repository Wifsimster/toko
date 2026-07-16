// Endpoint allowlist for agent access keys.
//
// Agent keys are READ-ONLY and may only reach the tracking-data endpoints
// listed here. This is a deny-by-default allowlist on purpose: a new route
// is unreachable by an agent key until it is explicitly added, so we can
// never accidentally expose a sensitive surface (medical-document vault,
// RGPD export, account deletion, billing, audit log, family invitations).
//
// Keep this list in sync with the OpenAPI document (lib/openapi-spec.ts)
// and the MCP server tools (apps/mcp).
const AGENT_READ_PREFIXES = [
  "/api/children",
  "/api/symptoms",
  "/api/journal",
  "/api/stats",
  "/api/barkley",
  "/api/medications",
  "/api/crisis-list",
  "/api/routines",
  "/api/parent-mood",
] as const;

/**
 * Whether an agent-key request is allowed: it must be a GET (read-only) and
 * its path must fall under an allowlisted prefix.
 */
export function isAgentReadAllowed(method: string, path: string): boolean {
  if (method !== "GET") return false;
  return AGENT_READ_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export { AGENT_READ_PREFIXES };
