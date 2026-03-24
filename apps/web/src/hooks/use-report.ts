import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface ReportSymptomEntry {
  date: string;
  agitation: number;
  focus: number;
  impulse: number;
  mood: number;
  sleep: number;
  social: number;
  autonomy: number;
  context: string | null;
  notes: string | null;
}

interface ReportJournalEntry {
  date: string;
  moodRating: number;
  tags: string[];
  text: string;
}

export interface Report {
  title: string;
  period: { from: string; to: string };
  child: {
    name: string;
    birthDate: string;
    diagnosisType: string;
  };
  symptoms: {
    entryCount: number;
    averages: {
      agitation: number;
      focus: number;
      impulse: number;
      mood: number;
      sleep: number;
      social: number;
      autonomy: number;
    } | null;
    entries: ReportSymptomEntry[];
  };
  journal: {
    entryCount: number;
    entries: ReportJournalEntry[];
  };
  generatedAt: string;
}

export const reportKeys = {
  child: (childId: string, from: string, to: string) =>
    ["report", childId, from, to] as const,
};

export function useReport(childId: string, from: string, to: string) {
  return useQuery({
    queryKey: reportKeys.child(childId, from, to),
    queryFn: () =>
      api.get<Report>(`/report/${childId}?from=${from}&to=${to}`),
    enabled: !!childId && !!from && !!to,
  });
}
