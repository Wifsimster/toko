import { useMutation } from "@tanstack/react-query";

import { api } from "../lib/api";

export type ReportPeriod = "week" | "month" | "quarter";

export interface SendReportEmailInput {
  childId: string;
  recipientEmail: string;
  period?: ReportPeriod;
  from?: string;
  to?: string;
  questions?: string;
}

export interface SendReportEmailResult {
  sent: boolean;
  id?: string;
}

export function useSendReportEmail() {
  return useMutation({
    mutationFn: (input: SendReportEmailInput) =>
      api.post<SendReportEmailResult>("/report/send-email", input),
  });
}
