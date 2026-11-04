import type { CreatePause, Garden } from "@focusflow/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";
import { withTodayLeaf } from "../lib/pause";

const GARDEN_KEY = ["pauses", "garden"] as const;

export function useGarden() {
  return useQuery({
    queryKey: GARDEN_KEY,
    queryFn: () => api.get<Garden>("/pauses/garden"),
  });
}

export function useCreatePause() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePause) => api.post<unknown>("/pauses", data),
    retry: 2,
    onMutate: async (data: CreatePause) => {
      await qc.cancelQueries({ queryKey: GARDEN_KEY });
      qc.setQueryData<Garden>(GARDEN_KEY, (old) => (old && old.today === data.date ? withTodayLeaf(old) : old));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: GARDEN_KEY }),
  });
}
