import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart, AlertTriangle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import {
  useInviteMetadata,
  useAcceptInvite,
} from "@/hooks/use-child-access";

export const Route = createFileRoute("/invite/$token")({
  component: InviteAcceptPage,
});

function InviteAcceptPage() {
  const { t } = useTranslation();
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
      const t = setTimeout(() => navigate({ to: "/dashboard" }), 1500);
      return () => clearTimeout(t);
    }
  }, [accepted, navigate]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Heart className="h-6 w-6" />
          </div>
          <CardTitle className="font-heading text-2xl">
            Invitation à co-parenter
          </CardTitle>
          <CardDescription>
            Tokō · carnet de consultation TDAH partagé
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {meta.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : meta.isError || !meta.data ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="font-medium">Invitation introuvable ou expirée</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Demandez une nouvelle invitation au parent qui vous l'a envoyée.
                </p>
              </div>
            </div>
          ) : accepted ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Check className="h-8 w-8 text-success-foreground" />
              <p className="font-medium">Invitation acceptée — redirection…</p>
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
              t={t}
            />
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Retour à l'accueil
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

interface BodyProps {
  meta: { childName: string; inviterName: string };
  currentEmail: string | null;
  emailVerified: boolean;
  isPending: boolean;
  acceptError: string | null;
  onAccept: () => void;
  token: string;
  expiresAt: string;
  formatDate: (iso: string) => string;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

function InviteAcceptBody({
  meta,
  currentEmail,
  emailVerified,
  isPending,
  acceptError,
  onAccept,
  token,
  expiresAt,
  formatDate,
  t,
}: BodyProps) {
  const signedIn = !!currentEmail;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        <span className="font-semibold">{meta.inviterName}</span> vous invite à
        accéder au carnet de{" "}
        <span className="font-semibold">{meta.childName}</span>. Vous pourrez
        consulter et compléter les symptômes, le journal, le traitement, et le
        programme Barkley — comme l'inviteur.
      </p>

      <p className="text-xs text-muted-foreground">
        Expire le {formatDate(expiresAt)}
      </p>

      <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
        <p>{t("childAccess.consentNotice")}</p>
        <p className="mt-2">{t("childAccess.controllerNotice")}</p>
      </div>

      {!signedIn ? (
        <div className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
          <p>
            Connectez-vous ou créez un compte avec l'adresse à laquelle cette
            invitation a été envoyée pour l'accepter.
          </p>
          <Link
            to="/login"
            search={{ next: `/invite/${token}` } as never}
            className="inline-block"
          >
            <Button size="sm">Se connecter / S'inscrire</Button>
          </Link>
        </div>
      ) : !emailVerified ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <p className="font-medium text-destructive">
            Vérifiez votre adresse e-mail avant d'accepter.
          </p>
          <p className="mt-1">
            Consultez l'e-mail de vérification envoyé à {currentEmail}, puis
            rechargez cette page.
          </p>
        </div>
      ) : (
        <>
          {acceptError && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {acceptError}
            </p>
          )}
          <div className="flex justify-end">
            <Button onClick={onAccept} disabled={isPending}>
              {isPending && (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  data-icon="inline-start"
                />
              )}
              Accepter l'invitation
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
