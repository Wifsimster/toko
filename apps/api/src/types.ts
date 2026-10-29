export interface AppEnv {
  Variables: {
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
    };
    session?: { id: string; expiresAt: Date };
    authType: "session" | "apiKey";
    agentKeyId?: string;
  };
}
