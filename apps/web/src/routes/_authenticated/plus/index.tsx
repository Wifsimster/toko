import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ChevronRight, ExternalLink, LifeBuoy, LogOut, MessagesSquare, Presentation, Sparkles } from "lucide-react";
import { DISCORD_INVITE_URL, MORE_GROUPS } from "@focusflow/validators";
import { PageHeader } from "@/components/layout/page-header";
import { AndroidAppPromo } from "@/components/layout/android-app-promo";
import { ChildSelector } from "@/components/shared/child-selector";
import { Button } from "@/components/ui/button";
import { useKoeTrigger } from "@/components/koe-widget";
import { adminNavItems, moreItems } from "@/config/nav";
import { useBillingStatus } from "@/hooks/use-billing";
import { useSession } from "@/lib/auth-client";
import { markQuizOpenedFromApp } from "@/lib/quiz-origin";
import { signOutAndLeave } from "@/lib/sign-out";
import { useUiStore } from "@/stores/ui-store";

export const Route = createFileRoute("/_authenticated/plus/")({
  component: PlusPage,
  staticData: {
    crumb: "nav.more",
  },
});

const rowClass =
  "group flex min-h-16 w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left outline-none transition-colors hover:border-brand/40 hover:bg-brand/5 focus-visible:ring-3 focus-visible:ring-ring";

function RowBody({ icon, label, hint, external }: { icon: ReactNode; label: string; hint?: string; external?: boolean }) {
  const Trailing = external ? ExternalLink : ChevronRight;
  return (
    <>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/70 group-hover:bg-brand/10 group-hover:text-brand-strong [&_svg]:size-5">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-sm text-muted-foreground">{hint}</span>}
      </span>
      <Trailing className="size-4 shrink-0 text-muted-foreground group-hover:text-brand-strong" aria-hidden="true" />
    </>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2">{children}</ul>
    </section>
  );
}

function PlusPage() {
  const { t } = useTranslation();
  const session = useSession();
  const billing = useBillingStatus();
  const { openKoe, available: koeAvailable } = useKoeTrigger();
  const user = session.data?.user as { email?: string | null; isAdmin?: boolean } | undefined;
  const isPremium = billing.data?.active === true || billing.data?.granted === true;

  return (
    <div className="space-y-8">
      <PageHeader title={t("more.title")} description={t("more.subtitle")} />

      <div className="md:hidden">
        <ChildSelector />
      </div>

      {MORE_GROUPS.map((group) => (
        <Group key={group.key} title={t(group.labelKey)}>
          {group.ids.map((id) => {
            const item = moreItems[id];
            return (
              <li key={id}>
                <Link
                  to={item.to}
                  className={rowClass}
                  onClick={id === "quiz" ? markQuizOpenedFromApp : undefined}
                >
                  <RowBody icon={<item.icon />} label={t(item.labelKey)} hint={t(item.descriptionKey)} />
                </Link>
              </li>
            );
          })}
          {group.key === "account" && (
            <>
              <li>
                <Link to="/account" hash="billing" className={rowClass}>
                  <RowBody
                    icon={<Sparkles />}
                    label={t("more.premium")}
                    hint={isPremium ? t("more.premiumActive") : t("more.premiumHint")}
                  />
                </Link>
              </li>
              <li>
                <button type="button" className={rowClass} onClick={() => useUiStore.getState().resetOnboarding()}>
                  <RowBody icon={<Presentation />} label={t("nav.tour")} hint={t("more.tourHint")} />
                </button>
              </li>
              {koeAvailable && (
                <li>
                  <button type="button" className={rowClass} onClick={openKoe}>
                    <RowBody icon={<LifeBuoy />} label={t("nav.support")} hint={t("more.supportHint")} />
                  </button>
                </li>
              )}
            </>
          )}
        </Group>
      ))}

      <Group title={t("more.community")}>
        <li>
          <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className={rowClass}>
            <RowBody icon={<MessagesSquare />} label={t("more.discord")} hint={t("more.discordHint")} external />
          </a>
        </li>
      </Group>

      {user?.isAdmin === true && (
        <Group title={t("more.admin")}>
          {adminNavItems.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className={rowClass}>
                <RowBody icon={<item.icon />} label={t(item.labelKey)} />
              </Link>
            </li>
          ))}
        </Group>
      )}

      <div className="md:hidden">
        <AndroidAppPromo />
      </div>

      <div className="flex flex-col items-start gap-1 border-t border-border/60 pt-6">
        <Button variant="ghost" className="min-h-11 gap-2 px-2 text-destructive hover:text-destructive" onClick={() => void signOutAndLeave()}>
          <LogOut className="size-4" aria-hidden="true" />
          {t("more.signOut")}
        </Button>
        {user?.email && <p className="px-2 text-xs text-muted-foreground">{user.email}</p>}
      </div>
    </div>
  );
}
