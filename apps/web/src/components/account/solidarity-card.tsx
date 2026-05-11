import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HandHeart, Clock, Check, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMySolidarityRequest,
  useCreateSolidarityRequest,
} from "@/hooks/use-solidarity";

const MAX_MESSAGE_LENGTH = 500;

export function SolidarityCard() {
  const { t } = useTranslation();
  const request = useMySolidarityRequest();
  const create = useCreateSolidarityRequest();
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    create.mutate(trimmed.length > 0 ? { message: trimmed } : {}, {
      onSuccess: () => setMessage(""),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HandHeart className="h-4 w-4" />
          {t("solidarity.title")}
        </CardTitle>
        <CardDescription>{t("solidarity.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {request.isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : request.data?.status === "pending" ? (
          <StatusBadge
            icon={<Clock className="h-4 w-4" />}
            label={t("solidarity.statusPending")}
            hint={t("solidarity.statusPendingHint")}
          />
        ) : request.data?.status === "approved" ? (
          <StatusBadge
            icon={<Check className="h-4 w-4" />}
            label={t("solidarity.statusApproved")}
            hint={t("solidarity.statusApprovedHint")}
            tone="success"
          />
        ) : (
          // No request OR rejected → allow a fresh submission. Rejected
          // never blocks a retry — the parent's situation may evolve.
          <form onSubmit={handleSubmit} className="space-y-3">
            {request.data?.status === "rejected" && (
              <p className="text-xs text-muted-foreground">
                {t("solidarity.statusRejectedHint")}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="solidarity-message">
                {t("solidarity.messageLabel")}
              </Label>
              <Textarea
                id="solidarity-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("solidarity.messagePlaceholder")}
                maxLength={MAX_MESSAGE_LENGTH}
                rows={4}
              />
              <p className="text-xs text-muted-foreground text-right">
                {message.length}/{MAX_MESSAGE_LENGTH}
              </p>
            </div>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  data-icon="inline-start"
                />
              )}
              {t("solidarity.submit")}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({
  icon,
  label,
  hint,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  tone?: "neutral" | "success";
}) {
  return (
    <div className="space-y-2">
      <div
        className={
          tone === "success"
            ? "inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
            : "inline-flex items-center gap-2 rounded-full bg-info-surface px-3 py-1 text-sm font-medium text-info-foreground"
        }
      >
        {icon}
        {label}
      </div>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}
