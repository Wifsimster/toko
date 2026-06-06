import { useMutation } from "@tanstack/react-query";

import { api } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReportPeriod = "week" | "month" | "quarter";

export interface SendReportEmailInput {
  childId: string;
  recipientEmail: string;
  /** Defaults to "quarter" on the server when omitted. */
  period?: ReportPeriod;
  /** Optional custom range start (YYYY-MM-DD). Takes precedence over period. */
  from?: string;
  /** Optional custom range end (YYYY-MM-DD). */
  to?: string;
  /** Free-text questions for the doctor (max 5 000 chars). */
  questions?: string;
}

export interface SendReportEmailResult {
  sent: boolean;
  id?: string;
}

// ─── Mutation ─────────────────────────────────────────────────────────────────

/**
 * POST /api/report/send-email
 * Body: { childId, recipientEmail, period?, from?, to?, questions? }
 * Requires active Famille plan on the child owner's account.
 */
export function useSendReportEmail() {
  return useMutation({
    mutationFn: (input: SendReportEmailInput) =>
      api.post<SendReportEmailResult>("/report/send-email", input),
  });
}
