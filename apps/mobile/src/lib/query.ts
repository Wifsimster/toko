import { QueryClient } from "@tanstack/react-query";

/** Shared React Query client, mirroring the web app's server-state approach. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});
