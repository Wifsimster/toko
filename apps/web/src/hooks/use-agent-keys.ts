import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { AgentKey, CreateAgentKey } from "@focusflow/validators";

// The freshly-minted key carries the one-time `secret`. The list endpoint
// never returns it again.
export type CreatedAgentKey = AgentKey & { secret: string };

export const agentKeysKeys = { all: ["agent-keys"] as const };

export function useAgentKeys(enabled: boolean) {
  return useQuery({
    queryKey: agentKeysKeys.all,
    queryFn: () => api.get<AgentKey[]>("/agent-keys"),
    enabled,
  });
}

export function useCreateAgentKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAgentKey) =>
      api.post<CreatedAgentKey>("/agent-keys", data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: agentKeysKeys.all }),
  });
}

export function useRevokeAgentKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ ok: true }>(`/agent-keys/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: agentKeysKeys.all }),
  });
}
