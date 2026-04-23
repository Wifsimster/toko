import { z } from "zod";

export const roadmapStatusSchema = z.enum([
  "proposed",
  "planned",
  "in_progress",
  "shipped",
  "declined",
]);

export const createRoadmapItemSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(2000).optional(),
  status: roadmapStatusSchema.optional().default("proposed"),
});

export const updateRoadmapItemSchema = createRoadmapItemSchema.partial();

export type RoadmapStatus = z.infer<typeof roadmapStatusSchema>;
export type CreateRoadmapItem = z.infer<typeof createRoadmapItemSchema>;
