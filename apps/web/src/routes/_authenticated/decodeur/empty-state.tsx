import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ query }: { query: string }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="py-8 text-center text-sm text-muted-foreground space-y-2">
        <p>{t("decoder.empty", { query })}</p>
        <p className="text-xs">{t("decoder.emptyHint")}</p>
      </CardContent>
    </Card>
  );
}
