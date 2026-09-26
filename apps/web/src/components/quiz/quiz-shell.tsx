import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Compass, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { canWebShare } from "@/lib/share";
import { umamiTrack } from "@/lib/umami";

export const QUIZ_ORIGIN = "https://toko.battistella.ovh";

export function quizUrl(path = "/quiz"): string {
  const origin = typeof window === "undefined" ? QUIZ_ORIGIN : window.location.origin;
  return `${origin}${path}`;
}

/** Share a link with the native sheet on mobile, or copy it on desktop. */
export async function shareLink(url: string, title: string, text: string, copiedMessage: string) {
  umamiTrack("quiz-share", { path: new URL(url).pathname });
  if (canWebShare()) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch (err) {
      // The user closed the share sheet: nothing to do.
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast.success(copiedMessage);
  } catch {
    window.prompt(title, url);
  }
}

interface QuizShellProps {
  children: ReactNode;
  /** Path shared by the header button (defaults to the quiz home). */
  sharePath?: string;
  /**
   * Question screens: no footer, tighter padding, so the question and every
   * answer fit on one phone screen without scrolling.
   */
  immersive?: boolean;
}

export function QuizShell({ children, sharePath = "/quiz", immersive = false }: QuizShellProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/85 backdrop-blur print:hidden">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link to="/quiz" className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Compass className="size-4.5" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="font-heading block text-base font-semibold tracking-tight">
                {t("quiz.brand")}
              </span>
              <span className="hidden text-xs text-muted-foreground min-[400px]:block">{t("quiz.brandTagline")}</span>
            </span>
          </Link>
          <Button
            variant="ghost"
            className="gap-1.5 text-muted-foreground"
            onClick={() =>
              shareLink(quizUrl(sharePath), t("quiz.seo.title"), t("quiz.shareText"), t("quiz.linkCopied"))
            }
          >
            <Share2 aria-hidden />
            <span className="sr-only min-[400px]:not-sr-only">{t("quiz.share")}</span>
          </Button>
        </div>
      </header>

      <main
        className={`mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 ${
          immersive
            ? "pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:py-10"
            : "py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10"
        }`}
      >
        {children}
      </main>

      <footer className={`border-t border-border/60 print:hidden ${immersive ? "hidden sm:block" : ""}`}>
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground">
          <span>{t("quiz.footer")}</span>
          <Link to="/confidentialite" className="underline-offset-4 hover:underline">
            {t("quiz.footerPrivacy")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
