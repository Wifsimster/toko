import { createAuthClient } from "better-auth/react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authClient: any = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "",
});

export const { useSession, signIn, signUp, signOut } = authClient;
