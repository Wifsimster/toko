import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  Appointment,
  CreateAppointment,
  UpdateAppointment,
} from "@focusflow/validators";

export const appointmentKeys = {
  all: (childId: string) => ["appointments", childId] as const,
  upcoming: (childId: string) =>
    ["appointments", childId, "upcoming"] as const,
};

export function useAppointments(childId: string) {
  return useQuery({
    queryKey: appointmentKeys.all(childId),
    queryFn: () => api.get<Appointment[]>(`/appointments/${childId}`),
    enabled: !!childId,
  });
}

export function useUpcomingAppointments(childId: string) {
  return useQuery({
    queryKey: appointmentKeys.upcoming(childId),
    queryFn: () => api.get<Appointment[]>(`/appointments/${childId}/upcoming`),
    enabled: !!childId,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppointment) =>
      api.post<Appointment>("/appointments", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all(variables.childId),
      });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.upcoming(variables.childId),
      });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      childId,
      ...data
    }: UpdateAppointment & { id: string; childId: string }) =>
      api.patch<Appointment>(`/appointments/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all(variables.childId),
      });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.upcoming(variables.childId),
      });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; childId: string }) =>
      api.delete<{ ok: true }>(`/appointments/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all(variables.childId),
      });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.upcoming(variables.childId),
      });
    },
  });
}
