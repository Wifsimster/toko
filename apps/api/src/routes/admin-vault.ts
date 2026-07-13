import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { eq, desc } from "drizzle-orm";
import type { AppEnv } from "../types";
import { db, adminDocuments, encryptBytes, decryptBytes } from "@focusflow/db";
import {
  createAdminDocumentMetadataSchema,
  updateAdminDocumentMetadataSchema,
} from "@focusflow/validators";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { assertChildAccess } from "../lib/child-access";
import { logAudit } from "../lib/audit";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

export const adminVaultRoutes = new Hono<AppEnv>();

// Body limit applied here (not from the global app.use) — these routes
// need to accept files larger than the global 1 MB limit. Cap matches
// MAX_FILE_BYTES + multipart overhead.
adminVaultRoutes.use(
  "*",
  bodyLimit({
    maxSize: MAX_FILE_BYTES + 256 * 1024,
    onError: (c) =>
      c.json({ error: "Fichier trop volumineux (max 10 Mo)" }, 413),
  }),
);

adminVaultRoutes.use("*", authMiddleware);

// Metadata-only listing — never streams the bytes back. Download requires
// a separate /:id/download call so the list endpoint stays cheap.
adminVaultRoutes.get("/:childId", async (c) => {
  const user = c.get("user");
  const childId = c.req.param("childId");

  await assertChildAccess(user.id, childId);

  const rows = await db
    .select({
      id: adminDocuments.id,
      childId: adminDocuments.childId,
      category: adminDocuments.category,
      title: adminDocuments.title,
      description: adminDocuments.description,
      fileName: adminDocuments.fileName,
      mimeType: adminDocuments.mimeType,
      fileSizeBytes: adminDocuments.fileSizeBytes,
      occurredOn: adminDocuments.occurredOn,
      createdAt: adminDocuments.createdAt,
      updatedAt: adminDocuments.updatedAt,
    })
    .from(adminDocuments)
    .where(eq(adminDocuments.childId, childId))
    .orderBy(desc(adminDocuments.occurredOn), desc(adminDocuments.createdAt));

  return c.json(rows);
});

adminVaultRoutes.post("/", async (c) => {
  const user = c.get("user");
  const form = await c.req.parseBody();

  const file = form["file"];
  if (!(file instanceof File)) {
    return c.json({ error: "Fichier manquant" }, 422);
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return c.json(
      { error: "Type de fichier non autorisé (PDF, JPEG, PNG uniquement)" },
      415,
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return c.json({ error: "Fichier trop volumineux (max 10 Mo)" }, 413);
  }

  const metadataRaw = {
    childId: form["childId"],
    category: form["category"],
    title: form["title"],
    description: form["description"] || undefined,
    occurredOn: form["occurredOn"] || undefined,
  };
  const parsed = createAdminDocumentMetadataSchema.safeParse(metadataRaw);
  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422,
    );
  }

  await assertChildAccess(user.id, parsed.data.childId);

  const buf = Buffer.from(await file.arrayBuffer());

  const [inserted] = await db
    .insert(adminDocuments)
    .values({
      childId: parsed.data.childId,
      category: parsed.data.category,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      fileName: file.name,
      mimeType: file.type,
      fileSizeBytes: file.size,
      // Medical files are the most sensitive data we hold — encrypt the bytes
      // at rest (AES-256-GCM). fileSizeBytes stays the plaintext length so the
      // download Content-Length matches the decrypted stream.
      content: encryptBytes(buf),
      occurredOn: parsed.data.occurredOn ?? null,
    })
    .returning({
      id: adminDocuments.id,
      childId: adminDocuments.childId,
      category: adminDocuments.category,
      title: adminDocuments.title,
      description: adminDocuments.description,
      fileName: adminDocuments.fileName,
      mimeType: adminDocuments.mimeType,
      fileSizeBytes: adminDocuments.fileSizeBytes,
      occurredOn: adminDocuments.occurredOn,
      createdAt: adminDocuments.createdAt,
      updatedAt: adminDocuments.updatedAt,
    });

  if (inserted) {
    void logAudit({
      actorId: user.id,
      actorName: user.name ?? null,
      childId: inserted.childId,
      entityType: "admin_document",
      entityId: inserted.id,
      action: "create",
      summary: `Document ajouté : ${inserted.title}`,
    });
  }

  return c.json(inserted, 201);
});

adminVaultRoutes.patch("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateAdminDocumentMetadataSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      422,
    );
  }

  const [existing] = await db
    .select()
    .from(adminDocuments)
    .where(eq(adminDocuments.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Document introuvable", 404);
  }

  await assertChildAccess(user.id, existing.childId);

  const [updated] = await db
    .update(adminDocuments)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(adminDocuments.id, id))
    .returning({
      id: adminDocuments.id,
      childId: adminDocuments.childId,
      category: adminDocuments.category,
      title: adminDocuments.title,
      description: adminDocuments.description,
      fileName: adminDocuments.fileName,
      mimeType: adminDocuments.mimeType,
      fileSizeBytes: adminDocuments.fileSizeBytes,
      occurredOn: adminDocuments.occurredOn,
      createdAt: adminDocuments.createdAt,
      updatedAt: adminDocuments.updatedAt,
    });

  return c.json(updated);
});

// Streams the raw file bytes back. Disposition defaults to attachment
// (force-download); pass ?inline=1 to render inline in an iframe/img
// for the in-app preview. Sniffing-resistant because we set the
// original MIME we recorded at upload time.
adminVaultRoutes.get("/:id/download", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const inline = c.req.query("inline") === "1";

  const [doc] = await db
    .select()
    .from(adminDocuments)
    .where(eq(adminDocuments.id, id));

  if (!doc) {
    throw new AppError("NOT_FOUND", "Document introuvable", 404);
  }

  await assertChildAccess(user.id, doc.childId);

  const disposition = inline ? "inline" : "attachment";

  // decryptBytes returns legacy plaintext rows untouched, so pre-encryption
  // uploads keep working during the rolling migration.
  const plaintext = decryptBytes(Buffer.from(doc.content));

  return new Response(new Uint8Array(plaintext), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `${disposition}; filename="${encodeURIComponent(doc.fileName)}"`,
      "Content-Length": String(doc.fileSizeBytes),
      "Cache-Control": "private, no-store",
    },
  });
});

adminVaultRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(adminDocuments)
    .where(eq(adminDocuments.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Document introuvable", 404);
  }

  await assertChildAccess(user.id, existing.childId);

  await db.delete(adminDocuments).where(eq(adminDocuments.id, id));

  void logAudit({
    actorId: user.id,
    actorName: user.name ?? null,
    childId: existing.childId,
    entityType: "admin_document",
    entityId: existing.id,
    action: "delete",
    summary: `Document supprimé : ${existing.title}`,
  });

  return c.json({ ok: true });
});
