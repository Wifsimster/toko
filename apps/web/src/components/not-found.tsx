import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Compass } from "lucide-react";

export function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Warm radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_40%,oklch(0.85_0.08_30_/_0.12),transparent)]" />

      {/* Floating shapes — terracotta & sage organic blobs */}
      <div
        className="pointer-events-none absolute left-[12%] top-[18%] h-20 w-20 rounded-full bg-accent-200/40 blur-sm"
        style={{ animation: "float-slow 8s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute right-[15%] top-[22%] h-14 w-14 rounded-2xl bg-sage-200/50 blur-[2px]"
        style={{
          animation: "float-slow 10s ease-in-out infinite",
          animationDelay: "-3s",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[20%] left-[18%] h-10 w-10 rounded-full bg-sage-300/30 blur-sm"
        style={{
          animation: "float-slow 7s ease-in-out infinite",
          animationDelay: "-5s",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[28%] right-[10%] h-16 w-16 rounded-full bg-accent-300/30 blur-[3px]"
        style={{
          animation: "float-slow 9s ease-in-out infinite",
          animationDelay: "-2s",
        }}
      />
      <div
        className="pointer-events-none absolute left-[8%] top-[55%] h-8 w-8 rotate-45 rounded-lg bg-accent-100/60"
        style={{
          animation: "float-slow 11s ease-in-out infinite",
          animationDelay: "-7s",
        }}
      />
      <div
        className="pointer-events-none absolute right-[22%] top-[60%] h-6 w-6 rounded-full bg-sage-200/40"
        style={{
          animation: "float-slow 6s ease-in-out infinite",
          animationDelay: "-1s",
        }}
      />

      {/* Small decorative dots */}
      <div className="pointer-events-none absolute left-[30%] top-[30%] h-2 w-2 rounded-full bg-accent-400/40" />
      <div className="pointer-events-none absolute right-[30%] top-[35%] h-1.5 w-1.5 rounded-full bg-sage-400/40" />
      <div className="pointer-events-none absolute bottom-[35%] left-[25%] h-2.5 w-2.5 rounded-full bg-accent-300/50" />
      <div className="pointer-events-none absolute bottom-[40%] right-[28%] h-1.5 w-1.5 rounded-full bg-sage-300/40" />

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col items-center text-center"
        style={{
          animation: "fade-in-up 0.8s ease-out both",
        }}
      >
        {/* Compass icon with gentle spin */}
        <div
          className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
          style={{ animation: "gentle-spin 20s linear infinite" }}
        >
          <Compass className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>

        {/* 404 number */}
        <h1
          className="font-heading text-[8rem] font-bold leading-none tracking-tighter text-primary/15 sm:text-[10rem]"
          style={{
            animation: "fade-in-up 0.8s ease-out 0.1s both",
          }}
        >
          404
        </h1>

        {/* Message */}
        <div
          className="-mt-6 space-y-3"
          style={{
            animation: "fade-in-up 0.8s ease-out 0.2s both",
          }}
        >
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
        <div
          className="mt-10 flex flex-col gap-3 sm:flex-row"
          style={{
            animation: "fade-in-up 0.8s ease-out 0.35s both",
          }}
        >
          <Link to="/">
            <Button size="lg" className="gap-2 px-6 shadow-sm shadow-primary/20">
              <Home className="h-4 w-4" />
              {t("notFound.home")}
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 px-6"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("notFound.previous")}
          </Button>
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-12px) translateX(5px); }
          50% { transform: translateY(-6px) translateX(-8px); }
          75% { transform: translateY(-16px) translateX(3px); }
        }

        @keyframes gentle-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
