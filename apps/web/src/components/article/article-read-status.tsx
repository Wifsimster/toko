import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ArticleReadStatus } from "@focusflow/validators";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ArticleStatusBadge({ status }: { status?: ArticleReadStatus }) {
  const { t } = useTranslation();
  if (status !== "new" && status !== "updated") return null;
  return (
    <Badge variant="brand" className="h-auto bg-card px-2.5 py-1 font-semibold">
      <span className="size-1.5 rounded-full bg-brand" aria-hidden />
      {t(status === "new" ? "articles.newBadge" : "articles.updatedBadge")}
    </Badge>
  );
}

export function ArticleReadMark({
  status,
  className,
}: {
  status?: ArticleReadStatus;
  className?: string;
}) {
  const { t } = useTranslation();
  if (status !== "read") return null;
  return (
    <span className={cn("inline-flex items-center gap-1 align-bottom text-muted-foreground", className)}>
      <Check className="size-3.5" aria-hidden />
      {t("articles.readMark")}
    </span>
  );
}
