import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  MessageSquareText,
  Copy,
  Heart,
  Lightbulb,
  AlertTriangle,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import { SCRIPT_IDS, type ScriptId } from "@/lib/communication-scripts-data";

export const Route = createFileRoute("/_authenticated/scripts/")({
  component: CommunicationScriptsPage,
  staticData: { crumb: "nav.communicationScripts" },
});

function CommunicationScriptsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("scripts.title")}
        description={t("scripts.subtitle")}
      />

      <Card className="border-info-border bg-info-surface/40">
        <CardContent className="py-4 text-sm leading-relaxed text-foreground/90">
          {t("scripts.disclaimer")}
        </CardContent>
      </Card>

      <ul className="grid gap-4">
        {SCRIPT_IDS.map((id) => (
          <li key={id}>
            <ScriptCard id={id} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScriptCard({ id }: { id: ScriptId }) {
  const { t } = useTranslation();
  const principles = t(`scripts.entries.${id}.principles`, {
    returnObjects: true,
  }) as string[];
  const phrases = t(`scripts.entries.${id}.phrases`, {
    returnObjects: true,
  }) as string[];
  const pitfalls = t(`scripts.entries.${id}.pitfalls`, {
    returnObjects: true,
  }) as string[];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-start gap-2 text-base">
          <MessageSquareText
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>{t(`scripts.entries.${id}.title`)}</span>
        </CardTitle>
        <CardDescription className="ml-6 text-sm">
          {t(`scripts.entries.${id}.whyHard`)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-relaxed">
        <Section
          icon={
            <Heart
              className="mt-0.5 size-4 shrink-0 text-warning-foreground"
              aria-hidden="true"
            />
          }
          label={t("scripts.principlesLabel")}
          items={principles}
        />
        <PhrasesSection phrases={phrases} />
        <Section
          icon={
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0 text-destructive"
              aria-hidden="true"
            />
          }
          label={t("scripts.pitfallsLabel")}
          items={pitfalls}
        />
      </CardContent>
    </Card>
  );
}

function Section({
  icon,
  label,
  items,
}: {
  icon: React.ReactNode;
  label: string;
  items: string[];
}) {
  return (
    <div className="flex items-start gap-2">
      {icon}
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <ul className="space-y-1 list-disc pl-4 marker:text-muted-foreground/50">
          {items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PhrasesSection({ phrases }: { phrases: string[] }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-2">
      <Lightbulb
        className="mt-0.5 size-4 shrink-0 text-success-foreground"
        aria-hidden="true"
      />
      <div className="flex-1 space-y-1.5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {t("scripts.phrasesLabel")}
        </p>
        <ul className="space-y-2">
          {phrases.map((phrase) => (
            <PhraseRow key={phrase} phrase={phrase} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function PhraseRow({ phrase }: { phrase: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phrase);
      setCopied(true);
      toast.success(t("scripts.copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("scripts.copyError"));
    }
  };

  return (
    <li className="group flex items-start gap-2 rounded-md bg-muted/40 p-2 transition-colors hover:bg-muted/60">
      <span className="flex-1">{phrase}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        aria-label={t("scripts.copyAria")}
        className={cn(
          "size-7 shrink-0 opacity-60 transition-opacity group-hover:opacity-100",
          copied && "text-success-foreground opacity-100",
        )}
      >
        {copied ? (
          <Check className="size-3.5" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </Button>
    </li>
  );
}
