import { useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUploadAdminDocument } from "@/hooks/use-admin-vault";
import { useUiStore } from "@/stores/ui-store";
import type { AdminDocumentCategory } from "@focusflow/validators";

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

type UploadState = {
  file: File | null;
  category: AdminDocumentCategory;
  title: string;
  description: string;
  occurredOn: string;
  error: string | null;
};

type UploadAction =
  | { type: "SET_FILE"; file: File | null; title?: string }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_CATEGORY"; category: AdminDocumentCategory }
  | { type: "SET_TITLE"; title: string }
  | { type: "SET_DESCRIPTION"; description: string }
  | { type: "SET_OCCURRED_ON"; occurredOn: string };

function uploadReducer(state: UploadState, action: UploadAction): UploadState {
  switch (action.type) {
    case "SET_FILE":
      return {
        ...state,
        file: action.file,
        title: action.title ?? state.title,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.error, file: null };
    case "SET_CATEGORY":
      return { ...state, category: action.category };
    case "SET_TITLE":
      return { ...state, title: action.title };
    case "SET_DESCRIPTION":
      return { ...state, description: action.description };
    case "SET_OCCURRED_ON":
      return { ...state, occurredOn: action.occurredOn };
  }
}

export function UploadForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const upload = useUploadAdminDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, dispatch] = useReducer(uploadReducer, undefined, () => ({
    file: null,
    category: "bilan_neuropsy" as AdminDocumentCategory,
    title: "",
    description: "",
    occurredOn: todayIso(),
    error: null,
  }));

  const { file, category, title, description, occurredOn, error } = state;

  const onFileSelected = (f: File | null) => {
    if (!f) {
      dispatch({ type: "SET_FILE", file: null });
      return;
    }
    if (!ALLOWED_MIME.includes(f.type)) {
      dispatch({ type: "SET_ERROR", error: t("adminVault.errors.mime") });
      return;
    }
    if (f.size > MAX_BYTES) {
      dispatch({ type: "SET_ERROR", error: t("adminVault.errors.size") });
      return;
    }
    const autoTitle = !title ? f.name.replace(/\.[^.]+$/, "") : undefined;
    dispatch({ type: "SET_FILE", file: f, title: autoTitle });
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
          onValueChange={(v) => v && dispatch({ type: "SET_CATEGORY", category: v as AdminDocumentCategory })}
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
          onChange={(e) => dispatch({ type: "SET_TITLE", title: e.target.value })}
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
          onChange={(e) => dispatch({ type: "SET_DESCRIPTION", description: e.target.value })}
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
          onChange={(e) => dispatch({ type: "SET_OCCURRED_ON", occurredOn: e.target.value })}
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
