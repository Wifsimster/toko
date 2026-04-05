/**
 * Client-side sharing utilities for Tokō ressources.
 *
 * Design constraints (from product meeting):
 * - Zero child data in shared content
 * - Zero personal identification of the sharer
 * - Attribution via URL ?s= param (random 8-char ID, per-share, not per-user)
 * - Full RGPD compliance: no cookie, no fingerprint, no leaderboard
 * - Works offline / without backend (localStorage for the parent's own reference)
 */

const SHARE_ID_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"; // no 0/O/1/I/l
const SHARE_ID_LENGTH = 8;

/** Generate a random 8-char share ID (unambiguous alphabet). */
export function generateShareId(): string {
  let out = "";
  const arr = new Uint32Array(SHARE_ID_LENGTH);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
    for (let i = 0; i < SHARE_ID_LENGTH; i++) {
      out += SHARE_ID_ALPHABET[arr[i]! % SHARE_ID_ALPHABET.length];
    }
  } else {
    // Fallback
    for (let i = 0; i < SHARE_ID_LENGTH; i++) {
      out +=
        SHARE_ID_ALPHABET[
          Math.floor(Math.random() * SHARE_ID_ALPHABET.length)
        ];
    }
  }
  return out;
}

export type ShareTone = "pedagogue" | "complice" | "pose";

interface ToneCopy {
  label: string;
  description: string;
  template: (articleTitle: string) => string;
}

/**
 * Three adaptive tones designed to preserve family relationships.
 * No accusatory language, no "you need to understand this" framing.
 */
export const SHARE_TONES: Record<ShareTone, ToneCopy> = {
  pedagogue: {
    label: "Pédagogique",
    description: "J'aimerais qu'on apprenne ensemble",
    template: (title) =>
      `Salut,\n\nJ'ai lu cet article qui m'a aidé·e à mieux comprendre ce qu'on vit en ce moment : « ${title} ». J'aimerais qu'on le lise ensemble quand tu auras 5 minutes. Rien d'urgent, juste pour qu'on avance ensemble.\n\nMerci.`,
  },
  complice: {
    label: "Complice",
    description: "Tu le connais bien, voilà ce qui m'aide",
    template: (title) =>
      `Coucou,\n\nTu es une des personnes qui le connaît le mieux — je voulais partager avec toi ce que j'ai lu récemment qui m'a beaucoup aidé·e : « ${title} ». Ça fait du bien de se sentir moins seul·e avec ça.\n\nBisous.`,
  },
  pose: {
    label: "Posé",
    description: "Je te partage ça calmement, on en reparle quand tu veux",
    template: (title) =>
      `Bonjour,\n\nJe te partage cet article, « ${title} », sans attendre de retour immédiat. Lis-le quand tu seras disponible, on en reparlera calmement si tu en as envie.\n\nÀ bientôt.`,
  },
};

/** Build a share URL for a given article slug with an attribution ID. */
export function buildShareUrl(slug: string, shareId: string): string {
  if (typeof window === "undefined") return "";
  const url = new URL(`/ressources/${slug}`, window.location.origin);
  url.searchParams.set("s", shareId);
  return url.toString();
}

/** Extract share ID from current URL if present. */
export function getIncomingShareId(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("s");
}

/**
 * Channel builders — construct channel-specific share URLs from a message + link.
 * All channels include both the parent's message and the article URL.
 */
export const shareChannels = {
  whatsapp(message: string, url: string): string {
    const text = `${message}\n\n${url}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  },
  webShare(message: string, url: string, articleTitle: string): ShareData {
    return {
      title: articleTitle,
      text: message,
      url,
    };
  },
};

/** Check whether the Web Share API is available (mobile devices mostly). */
export function canWebShare(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function"
  );
}
