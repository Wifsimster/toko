import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/lib/i18n";
import { api } from "@/lib/api-client";
import type { ChildAccessRole } from "@focusflow/validators";

export interface ChildAccessRow {
  id: string;
  userId: string;
  role: ChildAccessRole;
  grantedAt: string;
  userName: string | null;
  userEmail: string;
}

const childAccessKeys = {
  all: ["child-access"] as const,
  forChild: (childId: string) => ["child-access", "child", childId] as const,
};

const childInvitationsKeys = {
  all: ["child-invitations"] as const,
  pendingForChild: (childId: string) =>
    ["child-invitations", "pending", childId] as const,
};

export interface PendingInvitation {
  id: string;
  invitedEmail: string;
  createdAt: string;
  expiresAt: string;
}

// Owner-only: surface pending invites so a typo'd email or stale invite is
// visible and cancelable instead of vanishing after the form submit.
export function usePendingInvitations(childId: string, enabled = true) {
  return useQuery({
    queryKey: childInvitationsKeys.pendingForChild(childId),
    queryFn: () =>
      api.get<PendingInvitation[]>(
        `/child-invitations?childId=${encodeURIComponent(childId)}`,
      ),
    enabled: !!childId && enabled,
  });
}

export function useCancelInvitation(childId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      api.delete<{ ok: true }>(`/child-invitations/${invitationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: childInvitationsKeys.pendingForChild(childId),
      });
      toast.success(i18n.t("childAccess.cancelSuccess"));
    },
    onError: () => toast.error(i18n.t("childAccess.cancelError")),
  });
}

export function useChildAccess(childId: string) {
  return useQuery({
    queryKey: childAccessKeys.forChild(childId),
    queryFn: () => api.get<ChildAccessRow[]>(`/child-access/child/${childId}`),
    enabled: !!childId,
  });
}

export function useRevokeAccess(childId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.delete<{ ok: true }>(
        `/child-access/child/${childId}/user/${userId}`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: childAccessKeys.forChild(childId),
      });
      toast.success(i18n.t("childAccess.revokeSuccess"));
    },
    onError: () => toast.error(i18n.t("childAccess.revokeError")),
  });
}

export interface InvitePayload {
  email: string;
  parentalAuthorityAttestation: true;
}

export function useInviteCoParent(childId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvitePayload) =>
      api.post<{ ok: true; alreadyMember?: boolean }>(
        "/child-invitations",
        { childId, ...payload },
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: childAccessKeys.forChild(childId),
      });
      queryClient.invalidateQueries({
        queryKey: childInvitationsKeys.pendingForChild(childId),
      });
      if (data.alreadyMember) {
        toast.info(i18n.t("childAccess.alreadyMember"));
      } else {
        toast.success(i18n.t("childAccess.inviteSent"));
      }
    },
    onError: (err: unknown) => {
      const status = (err as { status?: number } | null)?.status;
      if (status === 422) {
        toast.error(i18n.t("childAccess.inviteInvalidEmail"));
      } else if (status === 403) {
        toast.error(i18n.t("childAccess.inviteForbidden"));
      } else {
        toast.error(i18n.t("childAccess.inviteError"));
      }
    },
  });
}

const familyAccessKeys = {
  all: ["family-access"] as const,
  list: () => ["family-access", "list"] as const,
};

export interface FamilyCoParent {
  userId: string;
  userName: string | null;
  userEmail: string;
  childIds: string[];
  grantedAt: string;
}

export interface FamilyAccessResponse {
  coParents: FamilyCoParent[];
  totalOwnedChildren: number;
}

export function useFamilyCoParents() {
  return useQuery({
    queryKey: familyAccessKeys.list(),
    queryFn: () => api.get<FamilyAccessResponse>("/child-access/family"),
  });
}

export interface BulkInvitePayload {
  email: string;
  childIds: string[];
  parentalAuthorityAttestation: true;
}

export interface BulkInviteResult {
  ok: true;
  batchId?: string;
  invitedChildIds: string[];
  alreadyMemberChildIds: string[];
}

export function useInviteFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkInvitePayload) =>
      api.post<BulkInviteResult>("/child-invitations/bulk", payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: familyAccessKeys.list() });
      queryClient.invalidateQueries({ queryKey: childAccessKeys.all });
      queryClient.invalidateQueries({ queryKey: childInvitationsKeys.all });
      if (data.invitedChildIds.length === 0) {
        toast.info(i18n.t("childAccess.alreadyMember"));
      } else {
        toast.success(i18n.t("childAccess.inviteSent"));
      }
    },
    onError: (err: unknown) => {
      const status = (err as { status?: number } | null)?.status;
      if (status === 422) {
        toast.error(i18n.t("childAccess.inviteInvalidEmail"));
      } else if (status === 403) {
        toast.error(i18n.t("childAccess.inviteForbidden"));
      } else {
        toast.error(i18n.t("childAccess.inviteError"));
      }
    },
  });
}

export function useRevokeFamilyAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.delete<{ ok: true; removedChildIds: string[] }>(
        `/child-access/family/user/${userId}`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyAccessKeys.list() });
      queryClient.invalidateQueries({ queryKey: childAccessKeys.all });
      toast.success(i18n.t("childAccess.revokeSuccess"));
    },
    onError: () => toast.error(i18n.t("childAccess.revokeError")),
  });
}

export interface InviteMetadataChild {
  id: string;
  name: string;
}

export interface InviteMetadata {
  childName: string;
  inviterName: string;
  expiresAt: string;
  children?: InviteMetadataChild[];
}

export function useInviteMetadata(token: string) {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: () => api.get<InviteMetadata>(`/child-invitations/${token}`),
    enabled: !!token,
    retry: false,
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      api.post<{ ok: true; childId: string }>(
        `/child-invitations/${token}/accept`,
        {},
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
}
