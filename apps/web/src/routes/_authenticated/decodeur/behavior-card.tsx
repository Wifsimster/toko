import { useTranslation } from "react-i18next";
import { Brain, Lightbulb, HeartHandshake } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Section({
  icon,
  labelKey,
  bodyKey,
}: {
  icon: React.ReactNode;
  labelKey: string;
  bodyKey: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-2">
      {icon}
      <div className="space-y-0.5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {t(labelKey)}
        </p>
        <p>{t(bodyKey)}</p>
      </div>
    </div>
  );
}

export function BehaviorCard({ id }: { id: string }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-start gap-2 text-base">
          <Brain
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span className="font-medium">
            {t(`decoder.entries.${id}.behavior`)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-relaxed">
        <Section
          icon={
            <Lightbulb
              className="mt-0.5 size-4 shrink-0 text-warning-foreground"
              aria-hidden="true"
            />
          }
          labelKey="decoder.explanationLabel"
          bodyKey={`decoder.entries.${id}.explanation`}
        />
        <Section
          icon={
            <HeartHandshake
              className="mt-0.5 size-4 shrink-0 text-success-foreground"
              aria-hidden="true"
            />
          }
          labelKey="decoder.tipLabel"
          bodyKey={`decoder.entries.${id}.tip`}
        />
      </CardContent>
    </Card>
  );
}
