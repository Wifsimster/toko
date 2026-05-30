import { useTranslation } from "react-i18next";
import { Download, Trash2, FileText, FileImage, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { downloadAdminDocumentUrl, previewAdminDocumentUrl } from "@/hooks/use-admin-vault";
import type { AdminDocument } from "@focusflow/validators";
import { cn } from "@/lib/utils";

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} Ko`;
  return `${(b / (1024 * 1024)).toFixed(1)} Mo`;
}

export function DocumentCard({
  doc,
  locale,
  onDelete,
  onPreview,
}: {
  doc: AdminDocument;
  locale: string;
  onDelete: (d: AdminDocument) => void;
  onPreview: (d: AdminDocument) => void;
}) {
  const { t } = useTranslation();
  const isImage = doc.mimeType.startsWith("image/");
  const dateLabel = doc.occurredOn
    ? new Date(doc.occurredOn).toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date(doc.createdAt).toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-4">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl ring-1",
            isImage
              ? "bg-accent-100 text-accent-700 ring-accent-200 dark:bg-accent-900/40 dark:text-accent-200 dark:ring-accent-800"
              : "bg-info-surface text-info-foreground ring-info-border",
          )}
        >
          {isImage ? (
            <FileImage className="size-5" />
          ) : (
            <FileText className="size-5" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="font-heading text-base font-semibold leading-snug">
              {doc.title}
            </h3>
            <Badge variant="outline" className="text-xs">
              {t(`adminVault.categories.${doc.category}`)}
            </Badge>
          </div>
          {doc.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {doc.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {doc.fileName} · {formatBytes(doc.fileSizeBytes)} · {dateLabel}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onPreview(doc)}
            aria-label={t("adminVault.preview")}
          >
            <Eye className="size-4" />
          </Button>
          <a
            href={downloadAdminDocumentUrl(doc.id)}
            target="_blank"
            rel="noopener noreferrer"
            download={doc.fileName}
          >
            <Button type="button" variant="ghost" size="icon" aria-label={t("adminVault.download")}>
              <Download className="size-4" />
            </Button>
          </a>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(doc)}
            aria-label={t("adminVault.delete")}
          >
            <Trash2 className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
