import { useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Check } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { LegalConsentText } from "@/components/shared/legal-consent-text";
import { SectionLoop } from "@/components/article/section-loop";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useSeoHead } from "@/hooks/use-seo-head";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { GoogleSignInButton } from "./google-sign-in-button";
import { PasskeySignInButton } from "./passkey-sign-in-button";

type Mode = "login" | "register";

// Ce que le parent retrouve derrière le formulaire (panneau large écran).
const ASIDE_POINTS = ["journal", "crisis", "rewards"] as const;

export function LoginPage() {
  const { t } = useTranslation();
  const search = useSearch({ from: "/login" });
  const [mode, setMode] = useState<Mode>(
    search.mode === "register" ? "register" : "login",
  );
  useSeoHead({
    title: "Connexion et inscription — Tokō",
    description:
      "Connectez-vous à Tokō ou créez votre compte gratuit. Journal, plan de crise et suivi du TDAH de votre enfant. Sans carte bancaire.",
    canonical: "https://toko.battistella.ovh/login",
  });

  return (
    <div className="relative grid min-h-dvh bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Panneau de marque : grand écran uniquement, le mobile va droit au formulaire */}
      <aside className="relative hidden overflow-hidden border-r border-border/60 bg-honey-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-[radial-gradient(circle,oklch(0.85_0.09_75_/_0.35),transparent_70%)]" />
        <Link to="/" className="relative flex w-fit items-center gap-2">
          <BrandLogo className="size-9 rounded-xl shadow-md shadow-primary/20" />
          <span className="font-heading text-xl font-semibold tracking-tight">Tokō</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="font-heading text-4xl font-semibold leading-[1.15] tracking-tight text-foreground">
            {t("login.aside.title")}
          </h2>
          <ul className="mt-8 space-y-4">
            {ASIDE_POINTS.map((k) => (
              <li key={k} className="flex items-start gap-3 text-base text-foreground/85">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {t(`login.aside.points.${k}`)}
              </li>
            ))}
          </ul>
          <SectionLoop
            slug="formation"
            name="practice"
            className="-mx-6 mt-4 -mb-6"
            width="max-w-[340px]"
            eager
          />
        </div>

        <p className="relative text-sm text-muted-foreground">{t("login.aside.footer")}</p>
      </aside>

      <main className="relative flex flex-col px-4 py-6 sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,oklch(0.85_0.08_75_/_0.10),transparent)] lg:hidden" />
        <Link
          to="/"
          className="relative inline-flex w-fit items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("login.backToHome")}
        </Link>

        <div className="relative mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
          <div className="text-center lg:text-left">
            <BrandLogo className="mx-auto mb-5 size-12 rounded-2xl shadow-md shadow-primary/20 lg:hidden" />
            <h1 className="font-heading text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground">
              {mode === "register" ? t("login.registerHeading") : t("login.loginHeading")}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {mode === "register" ? t("login.registerSubtitle") : t("login.loginSubtitle")}
            </p>
          </div>

          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as Mode)}
            className="mt-7"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("login.tabLogin")}</TabsTrigger>
              <TabsTrigger value="register">{t("login.tabRegister")}</TabsTrigger>
            </TabsList>

            <div className="mt-5 space-y-3">
              <GoogleSignInButton />
              {/* Une clé d'accès suppose un compte existant : inutile à l'inscription. */}
              {mode === "login" && <PasskeySignInButton />}
            </div>

            <div className="my-5 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">{t("login.orEmail")}</span>
              <Separator className="flex-1" />
            </div>

            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>

          <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground lg:text-left">
            <LegalConsentText i18nKey="login.oauthConsentNotice" />
          </p>
        </div>
      </main>
    </div>
  );
}
