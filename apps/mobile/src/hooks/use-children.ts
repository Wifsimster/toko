import type { Child } from "@focusflow/validators";
import { useQuery } from "@tanstack/react-query";

import { api } from "../lib/api";

export function useChildren() {
  return useQuery({
    queryKey: ["children"],
    queryFn: () => api.get<Child[]>("/children"),
  });
}
