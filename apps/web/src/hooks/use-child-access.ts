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

export const childAccessKeys = {
  all: ["child-access"] as const,
  forChild: (childId: string) => ["child-access", "child", childId] as const,
};

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

export function useInviteCoParent(childId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) =>
      api.post<{ ok: true; alreadyMember?: boolean }>(
        "/child-invitations",
        { childId, email },
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: childAccessKeys.forChild(childId),
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

export interface InviteMetadata {
  childName: string;
  inviterName: string;
  invitedEmail: string;
  expiresAt: string;
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
