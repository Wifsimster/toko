import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useSession,
} from "@/lib/auth-client";
import {
  useInviteMetadata,
  useAcceptInvite,
} from "@/hooks/use-child-access";
import { InviteAcceptBody } from "./invite-accept-body";

export const Route = createFileRoute("/invite/$token")({
  component: InviteAcceptPage,
});

function InviteAcceptPage() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const session = useSession();
  const meta = useInviteMetadata(token);
  const accept = useAcceptInvite();
  const [accepted, setAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  // Once accepted, drop the user into the dashboard for the new child.
  useEffect(() => {
    if (accepted) {
      const handle = setTimeout(() => navigate({ to: "/dashboard" }), 1500);
      return () => clearTimeout(handle);
    }
  }, [accepted, navigate]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(i18nInstance.language || "fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <BrandLogo className="mx-auto mb-3 size-12 rounded-xl" />
          <CardTitle className="font-heading text-2xl">
            {t("invitePage.title")}
          </CardTitle>
          <CardDescription>{t("invitePage.subtitle")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {meta.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : meta.isError || !meta.data ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <AlertTriangle className="size-8 text-destructive" />
              <div>
                <p className="font-medium">{t("invitePage.expiredTitle")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("invitePage.expiredHelp")}
                </p>
              </div>
            </div>
          ) : accepted ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Check className="size-8 text-success-foreground" />
              <p className="font-medium">{t("invitePage.acceptedTitle")}</p>
            </div>
          ) : (
            <InviteAcceptBody
              meta={meta.data}
              currentEmail={session.data?.user?.email ?? null}
              emailVerified={session.data?.user?.emailVerified ?? false}
              isPending={accept.isPending}
              acceptError={acceptError}
              onAccept={() => {
                setAcceptError(null);
                accept.mutate(token, {
                  onSuccess: () => setAccepted(true),
                  onError: (err: unknown) => {
                    const status = (err as { status?: number } | null)?.status;
                    if (status === 403) {
                      setAcceptError(t("invitePage.errorEmailUnverified"));
                    } else if (status === 404) {
                      setAcceptError(t("invitePage.errorNotFound"));
                    } else {
                      setAcceptError(t("invitePage.errorGeneric"));
                    }
                  },
                });
              }}
              token={token}
              expiresAt={meta.data.expiresAt}
              formatDate={formatDate}
            />
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t("invitePage.backHome")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
