import { z } from "zod";

export const evidenceItemSchema = z.object({
  type: z.string().min(1).max(64),
  ref: z.string().min(1).max(128),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
});

export const recordRecommendationSchema = z.object({
  childId: z.string().uuid().nullable().optional(),
  modelVersion: z.string().min(1).max(128),
  promptTemplate: z.string().min(1).max(128),
  inputs: z.record(z.string(), z.unknown()),
  suggestion: z.string().min(1).max(2000),
  evidence: z.array(evidenceItemSchema).default([]),
});

export const recommendationFeedbackSchema = z
  .object({
    accepted: z.boolean().optional(),
    note: z.string().max(1000).optional(),
  })
  .refine((v) => v.accepted !== undefined || v.note !== undefined, {
    message: "feedback must include `accepted` and/or `note`",
  });

export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
export type RecordRecommendation = z.infer<typeof recordRecommendationSchema>;
export type RecommendationFeedback = z.infer<typeof recommendationFeedbackSchema>;
