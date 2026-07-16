import { Card, CardContent } from "@/components/ui/card";
import { useBetaFeedbackList } from "@/hooks/use-beta-feedback";

// Admin-side reader for the closed-beta feedback (Phase 3). Renders nothing
// until there's feedback, so it stays out of the way pre-beta.
export function BetaFeedbackList() {
  const { data } = useBetaFeedbackList();
  if (!data || data.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Retours bêta
      </h2>
      <div className="space-y-2">
        {data.map((f) => (
          <Card key={f.id}>
            <CardContent className="py-3">
              <p className="whitespace-pre-wrap text-sm">{f.message}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {f.userName} ·{" "}
                {new Date(f.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
