import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Compass } from "lucide-react";

export function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Warm radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_40%,oklch(0.85_0.08_30_/_0.12),transparent)]" />

      {/* Floating shapes — terracotta & sage organic blobs */}
      <div className="animate-float-slow pointer-events-none absolute left-[12%] top-[18%] size-20 rounded-full bg-accent-200/40 blur-sm" />
      <div className="animate-float-slow pointer-events-none absolute right-[15%] top-[22%] size-14 rounded-2xl bg-sage-200/50 blur-[2px] [animation-delay:-3s] [animation-duration:10s]" />
      <div className="animate-float-slow pointer-events-none absolute bottom-[20%] left-[18%] size-10 rounded-full bg-sage-300/30 blur-sm [animation-delay:-5s] [animation-duration:7s]" />
      <div className="animate-float-slow pointer-events-none absolute bottom-[28%] right-[10%] size-16 rounded-full bg-accent-300/30 blur-[3px] [animation-delay:-2s] [animation-duration:9s]" />
      <div className="animate-float-slow pointer-events-none absolute left-[8%] top-[55%] size-8 rotate-45 rounded-lg bg-accent-100/60 [animation-delay:-7s] [animation-duration:11s]" />
      <div className="animate-float-slow pointer-events-none absolute right-[22%] top-[60%] size-6 rounded-full bg-sage-200/40 [animation-delay:-1s] [animation-duration:6s]" />

      {/* Small decorative dots */}
      <div className="pointer-events-none absolute left-[30%] top-[30%] size-2 rounded-full bg-accent-400/40" />
      <div className="pointer-events-none absolute right-[30%] top-[35%] size-1.5 rounded-full bg-sage-400/40" />
      <div className="pointer-events-none absolute bottom-[35%] left-[25%] size-2.5 rounded-full bg-accent-300/50" />
      <div className="pointer-events-none absolute bottom-[40%] right-[28%] size-1.5 rounded-full bg-sage-300/40" />

      {/* Main content */}
      <div className="animate-fade-in-up relative z-10 flex flex-col items-center text-center">
        {/* Compass icon with gentle spin */}
        <div className="animate-gentle-spin mb-8 flex size-20 items-center justify-center rounded-2xl bg-primary/10">
          <Compass className="size-10 text-primary" strokeWidth={1.5} />
        </div>

        {/* 404 number */}
        <h1 className="animate-fade-in-up font-heading text-[8rem] font-bold leading-none tracking-tighter text-primary/15 [animation-delay:0.1s] sm:text-[10rem]">
          404
        </h1>

        {/* Message */}
        <div className="animate-fade-in-up -mt-6 space-y-3 [animation-delay:0.2s]">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("notFound.title")}
          </h2>
          <p className="mx-auto max-w-md text-base leading-relaxed text-muted-foreground">
            {t("notFound.description")}
            <br className="hidden sm:block" />
            {t("notFound.reassurance")}
          </p>
        </div>

        {/* Actions */}
        <div className="animate-fade-in-up mt-10 flex w-full flex-col gap-3 [animation-delay:0.35s] sm:w-auto sm:flex-row">
          <Link to="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2 px-6 shadow-sm shadow-primary/20 sm:w-auto">
              <Home className="size-4" />
              {t("notFound.home")}
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 px-6 sm:w-auto"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="size-4" />
            {t("notFound.previous")}
          </Button>
        </div>
      </div>
    </div>
  );
}
