import { z } from "zod";

export const adminDocumentCategorySchema = z.enum([
  "bilan_orthophonie",
  "bilan_psychomot",
  "bilan_neuropsy",
  "compte_rendu_medical",
  "mdph",
  "ecole_pap_pps",
  "ordonnance",
  "autre",
]);

// Metadata sent alongside the multipart upload. The file itself comes
// from a separate "file" form field and is validated server-side
// (size + MIME type).
export const createAdminDocumentMetadataSchema = z.object({
  childId: z.string().uuid(),
  category: adminDocumentCategorySchema,
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  occurredOn: z.string().date().optional(),
});

export const updateAdminDocumentMetadataSchema = z.object({
  category: adminDocumentCategorySchema.optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  occurredOn: z.string().date().optional(),
});

// API list-shape — never includes `content` (the bytes), only metadata.
export const adminDocumentSchema = z.object({
  id: z.string().uuid(),
  childId: z.string().uuid(),
  category: adminDocumentCategorySchema,
  title: z.string(),
  description: z.string().nullable(),
  fileName: z.string(),
  mimeType: z.string(),
  fileSizeBytes: z.number(),
  occurredOn: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AdminDocumentCategory = z.infer<typeof adminDocumentCategorySchema>;
export type CreateAdminDocumentMetadata = z.infer<
  typeof createAdminDocumentMetadataSchema
>;
export type UpdateAdminDocumentMetadata = z.infer<
  typeof updateAdminDocumentMetadataSchema
>;
export type AdminDocument = z.infer<typeof adminDocumentSchema>;
