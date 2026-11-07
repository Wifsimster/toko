import { Mo } from "@/components/mo/mo";

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
    <aside className="my-8 flex items-center gap-4">
      <Mo state="accueil" size={56} />
      <p className="text-base leading-relaxed text-muted-foreground">{message}</p>
    </aside>
  );
}
