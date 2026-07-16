import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useBetaEligible,
  useSubmitBetaFeedback,
} from "@/hooks/use-beta-feedback";

// Discreet feedback card shown only to closed-beta families (Phase 3). Renders
// nothing for everyone else. One field, one action — the qualitative channel
// that complements the weekly check-ins.
export function BetaFeedbackWidget() {
  const { data } = useBetaEligible();
  const submit = useSubmitBetaFeedback();
  const [message, setMessage] = useState("");

  if (!data?.eligible) return null;

  const send = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    submit.mutate(trimmed, { onSuccess: () => setMessage("") });
  };

  return (
    <Card className="border-accent-300/50 bg-accent-100/30">
      <CardContent className="space-y-3 py-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MessageSquarePlus className="size-4 text-accent-700" />
          Bêta · votre retour
        </div>
        <p className="text-sm text-muted-foreground">
          Un souci, une idée, ce qui vous aide ou vous freine ? Dites-nous tout.
        </p>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Votre retour…"
          rows={3}
          maxLength={2000}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={send}
            disabled={submit.isPending || !message.trim()}
          >
            {submit.isPending ? "Envoi…" : "Envoyer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
