import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TwoFactorSection } from "./two-factor";
import { PasskeysSection } from "./passkeys";

export function SecurityCard() {
  const { t } = useTranslation();
  const session = useSession();
  const twoFactorEnabled =
    (session.data?.user as { twoFactorEnabled?: boolean } | undefined)
      ?.twoFactorEnabled ?? false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4" />
          {t("security.title")}
        </CardTitle>
        <CardDescription>{t("security.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TwoFactorSection enabled={twoFactorEnabled} />
        <PasskeysSection />
      </CardContent>
    </Card>
  );
}
