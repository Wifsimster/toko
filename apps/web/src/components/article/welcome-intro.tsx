import { Sparkles } from "lucide-react";

export function WelcomeIntro({
  audience = "parent",
}: {
  audience?: "parent" | "entourage";
}) {
  const message =
    audience === "entourage"
      ? "Vous êtes au bon endroit. Ce guide est court, sans jargon, et il a été écrit pour vous aider à comprendre — pas pour vous faire la leçon. Prenez le temps de le lire à votre rythme."
      : "Vous êtes au bon endroit. Vous n'êtes pas seul·e. Cet article a été pensé pour vous accompagner, pas pour vous juger. Lisez à votre rythme — vous pouvez y revenir autant de fois que nécessaire.";

  return (
    <aside className="my-6 flex items-start gap-3.5 rounded-xl border border-brand/20 bg-brand/5 p-4 sm:p-5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand-strong">
        <Sparkles className="size-4" />
      </div>
      <p className="text-base leading-relaxed text-foreground/90">{message}</p>
    </aside>
  );
}
