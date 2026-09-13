export interface AppEnv {
  Variables: {
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
    };
    // Only set when authType === "session". An agent-key request never has
    // one, so declaring it non-optional made the type promise something the
    // middleware does not deliver.
    session?: { id: string; expiresAt: Date };
    // How the request authenticated. "apiKey" means an agent access key —
    // such requests are read-only and restricted to an endpoint allowlist.
    authType: "session" | "apiKey";
    // Set only when authType === "apiKey": the id of the agent_key row.
    agentKeyId?: string;
  };
}
