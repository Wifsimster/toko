import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { LegalConsentText } from "@/components/shared/legal-consent-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useSeoHead } from "@/hooks/use-seo-head";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { GoogleSignInButton } from "./google-sign-in-button";
import { PasskeySignInButton } from "./passkey-sign-in-button";

export function LoginPage() {
  const { t } = useTranslation();
  useSeoHead({
    title: "Connexion et inscription — Tokō",
    description:
      "Connectez-vous à Tokō ou créez votre compte gratuit. Journal, plan de crise et suivi du TDAH de votre enfant. Sans carte bancaire.",
    canonical: "https://toko.battistella.ovh/login",
  });
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-4">
      {/* Warm ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_40%,oklch(0.85_0.08_30_/_0.08),transparent)]" />

      <Link
        to="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("login.backToHome")}
      </Link>

      <div className="relative w-full max-w-md space-y-8">
        <div className="text-center">
          <BrandLogo className="mx-auto mb-4 size-12 rounded-2xl shadow-md shadow-primary/20" />
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Tokō
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("login.tagline")}
          </p>
        </div>

        <GoogleSignInButton />

        <PasskeySignInButton />

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          <LegalConsentText i18nKey="login.oauthConsentNotice" />
        </p>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">{t("login.or")}</span>
          <Separator className="flex-1" />
        </div>

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t("login.tabLogin")}</TabsTrigger>
            <TabsTrigger value="register">{t("login.tabRegister")}</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
