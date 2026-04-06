import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createNewsSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(slugRegex, "Slug invalide"),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1).max(50_000),
  published: z.boolean().optional().default(false),
});

export const updateNewsSchema = createNewsSchema.partial();

export const newsSchema = createNewsSchema.extend({
  id: z.string().uuid(),
  authorId: z.string(),
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateNews = z.infer<typeof createNewsSchema>;
export type UpdateNews = z.infer<typeof updateNewsSchema>;
export type News = z.infer<typeof newsSchema>;
