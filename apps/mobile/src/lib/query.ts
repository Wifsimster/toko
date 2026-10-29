import { QueryClient } from "@tanstack/react-query";

import { registerMutationDefaults } from "./mutations";
import { createSecurePersister } from "./secure-persister";

const DAY_MS = 1000 * 60 * 60 * 24;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      gcTime: DAY_MS,
    },
    mutations: {
      retry: 0,
    },
  },
});

registerMutationDefaults(queryClient);

export const persister = createSecurePersister();
