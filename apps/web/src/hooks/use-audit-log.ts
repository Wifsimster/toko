import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

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

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "accept"
  | "revoke";

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

const auditLogKeys = {
  all: ["audit-log"] as const,
  forChild: (childId: string) => ["audit-log", "child", childId] as const,
};

export function useAuditLogForChild(childId: string, limit = 50) {
  return useQuery({
    queryKey: auditLogKeys.forChild(childId),
    queryFn: () =>
      api.get<AuditEntry[]>(
        `/audit-log/child/${childId}?limit=${limit}`,
      ),
    enabled: !!childId,
  });
}
