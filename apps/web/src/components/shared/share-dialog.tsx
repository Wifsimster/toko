import { useState, useMemo, useEffect } from "react";
import { Copy, Check, MessageCircle, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  SHARE_TONES,
  type ShareTone,
  generateShareId,
  buildShareUrl,
  shareChannels,
  canWebShare,
} from "@/lib/share";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleSlug: string;
  articleTitle: string;
}

/** WhatsApp brand icon (inline SVG, no extra deps). */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.6 6.3A7.85 7.85 0 0 0 12 4a7.92 7.92 0 0 0-6.84 11.9L4 20l4.2-1.1A7.9 7.9 0 0 0 12 19.9a7.92 7.92 0 0 0 5.6-13.6Zm-5.6 12.2a6.55 6.55 0 0 1-3.35-.92l-.24-.14-2.5.66.67-2.43-.16-.26a6.57 6.57 0 1 1 5.58 3.09Zm3.6-4.92c-.2-.1-1.17-.58-1.35-.65-.18-.07-.31-.1-.44.1-.13.2-.5.65-.62.78-.11.13-.23.15-.43.05a5.4 5.4 0 0 1-1.6-.99 5.93 5.93 0 0 1-1.1-1.37c-.12-.2 0-.3.08-.4.09-.09.2-.23.29-.34.1-.12.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.44-1.07-.6-1.46-.16-.38-.32-.33-.44-.34h-.38a.73.73 0 0 0-.53.25 2.24 2.24 0 0 0-.69 1.66c0 .98.72 1.94.82 2.07.1.13 1.4 2.15 3.4 3.02.47.2.85.33 1.14.42.48.15.92.13 1.26.08.38-.06 1.17-.48 1.33-.94.17-.46.17-.86.12-.94-.05-.08-.18-.13-.38-.23Z" />
    </svg>
  );
}

export function ShareDialog({
  open,
  onOpenChange,
  articleSlug,
  articleTitle,
}: ShareDialogProps) {
  const [tone, setTone] = useState<ShareTone>("pedagogue");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate a fresh share ID each time the dialog opens
  const shareId = useMemo(() => (open ? generateShareId() : ""), [open]);
  const shareUrl = useMemo(
    () => (shareId ? buildShareUrl(articleSlug, shareId) : ""),
    [articleSlug, shareId]
  );

  // When opening OR switching tone, refresh the pre-filled message
  useEffect(() => {
    if (open) {
      setMessage(SHARE_TONES[tone].template(articleTitle));
    }
  }, [open, tone, articleTitle]);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const handleCopy = async () => {
    try {
      const text = `${message}\n\n${shareUrl}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Message copié");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Impossible de copier");
    }
  };

  const handleWhatsApp = () => {
    const url = shareChannels.whatsapp(message, shareUrl);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    try {
      const data = shareChannels.webShare(message, shareUrl, articleTitle);
      await navigator.share(data);
    } catch (err) {
      // User cancelled — silent
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("Partage impossible");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Tendre un pont vers un proche
          </DialogTitle>
          <DialogDescription>
            Vous n'êtes pas seul·e à porter ça. Envoyez une page simple, écrite
            pour être lue sans connaissances préalables, pour qu'un proche
            comprenne ce que vit votre enfant.
          </DialogDescription>
        </DialogHeader>

        {/* Tone selector */}
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Ton du message
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(SHARE_TONES) as ShareTone[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={
                  "rounded-lg border px-3 py-2 text-left text-xs transition-colors " +
                  (tone === t
                    ? "border-primary/40 bg-primary/5 text-foreground"
                    : "border-border/60 bg-background text-muted-foreground hover:border-primary/20 hover:text-foreground")
                }
              >
                <span
                  className={
                    "block font-medium " +
                    (tone === t ? "text-primary" : "")
                  }
                >
                  {SHARE_TONES[t].label}
                </span>
                <span className="mt-0.5 block leading-snug">
                  {SHARE_TONES[t].description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Editable message */}
        <div className="space-y-2">
          <Label
            htmlFor="share-message"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Votre message (modifiable)
          </Label>
          <Textarea
            id="share-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground/80">
            Aucune donnée de votre enfant n'est incluse.
          </p>
        </div>

        {/* Channels */}
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            {canWebShare() && (
              <Button
                variant="default"
                size="lg"
                onClick={handleNativeShare}
                className="flex-1 gap-2 shadow-sm"
              >
                <Share2 className="h-4 w-4" />
                Partager
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={handleWhatsApp}
              className="flex-1 gap-2"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleCopy}
              className="flex-1 gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-sage-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copié" : "Copier"}
            </Button>
          </div>
          <DialogClose render={<Button variant="ghost" size="sm" className="w-full" />}>
            Annuler
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Trigger icon for the share action (MessageCircle ~= dialogue/pont). */
export const ShareIcon = MessageCircle;
