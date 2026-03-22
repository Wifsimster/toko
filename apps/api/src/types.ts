export interface AppEnv {
  Variables: {
    user: { id: string; name: string; email: string };
    session: { id: string; expiresAt: Date };
  };
}
