import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";

import { registerMutationDefaults } from "./mutations";

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

/** Persists the query/mutation cache to AsyncStorage so offline check-ins
 * survive an app restart and replay on reconnect. */
export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "toko-query-cache",
  throttleTime: 1000,
});
