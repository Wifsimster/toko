import { QueryClient } from "@tanstack/react-query";

import { registerMutationDefaults } from "./mutations";
import { createSecurePersister } from "./secure-persister";

const DAY_MS = 1000 * 60 * 60 * 24;

/** Shared React Query client, mirroring the web app's server-state approach.
 * gcTime is a full day so cached data (and paused mutations) survive being
 * persisted to AsyncStorage for offline use. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      gcTime: DAY_MS,
    },
    mutations: {
      // Resumed paused mutations should not also retry-storm on errors.
      retry: 0,
    },
  },
});

registerMutationDefaults(queryClient);

/** Persists the query/mutation cache so offline check-ins survive an app
 * restart and replay on reconnect. The cache holds children's health data, so
 * it is encrypted at rest (AES-256, key in the device keystore) rather than
 * written as plaintext to AsyncStorage. See secure-persister.ts. */
export const persister = createSecurePersister();
