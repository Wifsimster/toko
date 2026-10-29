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

export function isAgentReadAllowed(method: string, path: string): boolean {
  if (method !== "GET") return false;
  return AGENT_READ_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export { AGENT_READ_PREFIXES };
