import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Upload,
  Download,
  Trash2,
  FileText,
  FileImage,
  Vault,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import {
  useAdminDocuments,
  useUploadAdminDocument,
  useDeleteAdminDocument,
  downloadAdminDocumentUrl,
} from "@/hooks/use-admin-vault";
import { useUiStore } from "@/stores/ui-store";
import type {
  AdminDocument,
  AdminDocumentCategory,
} from "@focusflow/validators";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin-vault/")({
  component: AdminVaultPage,
  staticData: { crumb: "nav.adminVault" },
});

const CATEGORIES: AdminDocumentCategory[] = [
  "bilan_orthophonie",
  "bilan_psychomot",
  "bilan_neuropsy",
  "compte_rendu_medical",
  "mdph",
  "ecole_pap_pps",
  "ordonnance",
  "autre",
];

const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024;

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} Ko`;
  return `${(b / (1024 * 1024)).toFixed(1)} Mo`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function AdminVaultPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: docs, isLoading } = useAdminDocuments(activeChildId ?? "");
  const deleteDoc = useDeleteAdminDocument();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [filter, setFilter] = useState<AdminDocumentCategory | "all">("all");
  const [deleting, setDeleting] = useState<AdminDocument | null>(null);

  const filtered = useMemo(() => {
    if (!docs) return [];
    if (filter === "all") return docs;
    return docs.filter((d) => d.category === filter);
  }, [docs, filter]);

  const handleDelete = () => {
    if (!deleting || !activeChildId) return;
    deleteDoc.mutate(
      { id: deleting.id, childId: activeChildId },
      {
        onSuccess: () => {
          toast.success(t("adminVault.deletedToast"));
          setDeleting(null);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("adminVault.title")}
        description={t("adminVault.subtitle")}
        actions={
          <Button onClick={() => setUploadOpen(true)} disabled={!activeChildId}>
            <Plus className="mr-2 h-4 w-4" />
            {t("adminVault.uploadButton")}
          </Button>
        }
      />

      {!activeChildId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("adminVault.selectChild")}
          </CardContent>
        </Card>
      ) : (
        <>
          {docs && docs.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant={filter === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFilter("all")}
              >
                {t("adminVault.filterAll")}
              </Badge>
              {CATEGORIES.map((c) => (
                <Badge
                  key={c}
                  variant={filter === c ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilter(c)}
                >
                  {t(`adminVault.categories.${c}`)}
                </Badge>
              ))}
            </div>
          )}

          {isLoading ? (
            <PageLoader />
          ) : !docs?.length ? (
            <Card className="bg-info-surface ring-1 ring-info-border">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <Vault className="h-10 w-10 text-info-foreground" />
                <p className="font-heading text-lg font-semibold">
                  {t("adminVault.emptyTitle")}
                </p>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  {t("adminVault.emptyBody")}
                </p>
                <Button onClick={() => setUploadOpen(true)} className="mt-2">
                  <Upload className="mr-2 h-4 w-4" />
                  {t("adminVault.emptyCta")}
                </Button>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {t("adminVault.noMatch")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  {t("adminVault.clearFilter")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filtered.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  locale={locale}
                  onDelete={setDeleting}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-lg">
          <UploadForm onSuccess={() => setUploadOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("adminVault.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("adminVault.deleteBodyPrefix")}{" "}
            <strong className="text-foreground">{deleting?.title}</strong>{" "}
            {t("adminVault.deleteBodySuffix")}
          </p>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("adminVault.cancel")}
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteDoc.isPending}
            >
              {deleteDoc.isPending
                ? t("adminVault.deleting")
                : t("adminVault.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DocumentCard({
  doc,
  locale,
  onDelete,
}: {
  doc: AdminDocument;
  locale: string;
  onDelete: (d: AdminDocument) => void;
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
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1",
            isImage
              ? "bg-accent-100 text-accent-700 ring-accent-200 dark:bg-accent-900/40 dark:text-accent-200 dark:ring-accent-800"
              : "bg-info-surface text-info-foreground ring-info-border",
          )}
        >
          {isImage ? (
            <FileImage className="h-5 w-5" />
          ) : (
            <FileText className="h-5 w-5" />
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
          <a
            href={downloadAdminDocumentUrl(doc.id)}
            target="_blank"
            rel="noopener noreferrer"
            download={doc.fileName}
          >
            <Button variant="ghost" size="icon" aria-label={t("adminVault.download")}>
              <Download className="h-4 w-4" />
            </Button>
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(doc)}
            aria-label={t("adminVault.delete")}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UploadForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const upload = useUploadAdminDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<AdminDocumentCategory>("bilan_neuropsy");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [occurredOn, setOccurredOn] = useState(todayIso());
  const [error, setError] = useState<string | null>(null);

  const onFileSelected = (f: File | null) => {
    setError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (!ALLOWED_MIME.includes(f.type)) {
      setError(t("adminVault.errors.mime"));
      return;
    }
    if (f.size > MAX_BYTES) {
      setError(t("adminVault.errors.size"));
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId || !file || !title.trim()) return;
    upload.mutate(
      {
        file,
        childId: activeChildId,
        category,
        title: title.trim(),
        description: description.trim() || undefined,
        occurredOn: occurredOn || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t("adminVault.uploadedToast"));
          onSuccess();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{t("adminVault.uploadTitle")}</DialogTitle>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="vault-file">
          {t("adminVault.fields.file")}
          <span className="text-destructive" aria-hidden="true">
            {" *"}
          </span>
        </Label>
        <Input
          id="vault-file"
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf,image/jpeg,image/png"
          onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
          required
        />
        {file && (
          <p className="text-xs text-muted-foreground">
            {file.name} · {formatBytes(file.size)}
          </p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          {t("adminVault.fields.fileHint")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vault-category">{t("adminVault.fields.category")}</Label>
        <Select
          value={category}
          onValueChange={(v) => v && setCategory(v as AdminDocumentCategory)}
          items={Object.fromEntries(
            CATEGORIES.map((c) => [c, t(`adminVault.categories.${c}`)]),
          )}
        >
          <SelectTrigger id="vault-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem
                key={c}
                value={c}
                label={t(`adminVault.categories.${c}`)}
              >
                {t(`adminVault.categories.${c}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vault-title">
          {t("adminVault.fields.title")}
          <span className="text-destructive" aria-hidden="true">
            {" *"}
          </span>
        </Label>
        <Input
          id="vault-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("adminVault.fields.titlePlaceholder")}
          maxLength={200}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="vault-description">
          {t("adminVault.fields.description")}
        </Label>
        <Textarea
          id="vault-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("adminVault.fields.descriptionPlaceholder")}
          maxLength={2000}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="vault-date">{t("adminVault.fields.occurredOn")}</Label>
        <Input
          id="vault-date"
          type="date"
          value={occurredOn}
          onChange={(e) => setOccurredOn(e.target.value)}
        />
      </div>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          {t("adminVault.cancel")}
        </DialogClose>
        <Button
          type="submit"
          disabled={!activeChildId || !file || !title.trim() || upload.isPending}
        >
          {upload.isPending
            ? t("adminVault.uploading")
            : t("adminVault.upload")}
        </Button>
      </DialogFooter>
    </form>
  );
}
