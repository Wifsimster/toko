import { useQuery } from "@tanstack/react-query";

import { api } from "../lib/api";

// ─── Local types (mirrors apps/web/src/hooks/use-audit-log.ts) ───────────────

export type AuditEntityType =
  | "child"
  | "symptom"
  | "journal"
  | "medication"
  | "medication_log"
  | "crisis_item"
  | "child_access"
  | "child_invitation"
  | "strength"
  | "routine"
  | "routine_completion"
  | "admin_document";

export type AuditAction = "create" | "update" | "delete" | "accept" | "revoke";

export interface AuditEntry {
  id: string;
  actorId: string | null;
  actorName: string | null;
  childId: string | null;
  entityType: AuditEntityType;
  entityId: string | null;
  action: AuditAction;
  summary: string | null;
  createdAt: string;
}

// ─── Query key ────────────────────────────────────────────────────────────────

const key = (childId: string, limit: number) =>
  ["activity", "child", childId, limit] as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetches the activity feed for a child.
 * Endpoint: GET /api/audit-log/child/:childId?limit=<n>
 * Returns entries ordered most-recent first (the API returns them that way).
 */
export function useActivity(childId: string, limit = 50) {
  return useQuery({
    queryKey: key(childId, limit),
    queryFn: () =>
      api.get<AuditEntry[]>(`/audit-log/child/${childId}?limit=${limit}`),
    enabled: !!childId,
  });
}
