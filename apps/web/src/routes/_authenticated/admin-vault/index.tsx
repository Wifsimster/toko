import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Upload, Download, Vault, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  useDeleteAdminDocument,
  downloadAdminDocumentUrl,
  previewAdminDocumentUrl,
} from "@/hooks/use-admin-vault";
import { useUiStore } from "@/stores/ui-store";
import type {
  AdminDocument,
  AdminDocumentCategory,
} from "@focusflow/validators";
import { DocumentCard } from "./document-card";
import { UploadForm } from "./upload-form";

export const Route = createFileRoute("/_authenticated/admin-vault/")({
  component: AdminVaultPage,
  staticData: {
    crumb: "nav.adminVault",
  },
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

export function AdminVaultPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: docs, isLoading } = useAdminDocuments(activeChildId ?? "");
  const deleteDoc = useDeleteAdminDocument();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [filter, setFilter] = useState<AdminDocumentCategory | "all">("all");
  const [deleting, setDeleting] = useState<AdminDocument | null>(null);
  const [previewing, setPreviewing] = useState<AdminDocument | null>(null);

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
            <Plus className="mr-2 size-4" />
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
                <Vault className="size-10 text-info-foreground" />
                <p className="font-heading text-lg font-semibold">
                  {t("adminVault.emptyTitle")}
                </p>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  {t("adminVault.emptyBody")}
                </p>
                <Button onClick={() => setUploadOpen(true)} className="mt-2">
                  <Upload className="mr-2 size-4" />
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
                  onPreview={setPreviewing}
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
        open={!!previewing}
        onOpenChange={(open) => !open && setPreviewing(null)}
      >
        <DialogContent className="flex h-[85vh] max-w-5xl flex-col gap-3 p-4 sm:h-[85vh] sm:max-w-5xl sm:p-6">
          <DialogHeader className="space-y-0.5 pr-8">
            <DialogTitle className="truncate">{previewing?.title}</DialogTitle>
            <p className="text-xs text-muted-foreground truncate">
              {previewing?.fileName}
            </p>
          </DialogHeader>
          {previewing && (
            <div className="flex-1 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
              {previewing.mimeType.startsWith("image/") ? (
                <img
                  src={previewAdminDocumentUrl(previewing.id)}
                  alt={previewing.title}
                  className="size-full object-contain"
                />
              ) : (
                <iframe
                  src={previewAdminDocumentUrl(previewing.id)}
                  title={previewing.title}
                  className="size-full"
                  sandbox="allow-same-origin allow-scripts"
                />
              )}
            </div>
          )}
          <DialogFooter>
            {previewing && (
              <a
                href={downloadAdminDocumentUrl(previewing.id)}
                target="_blank"
                rel="noopener noreferrer"
                download={previewing.fileName}
              >
                <Button type="button" variant="outline" className="gap-2">
                  <Download className="size-4" />
                  {t("adminVault.download")}
                </Button>
              </a>
            )}
            <DialogClose render={<Button />}>
              {t("adminVault.close")}
            </DialogClose>
          </DialogFooter>
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
