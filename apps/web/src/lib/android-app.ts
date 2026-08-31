/**
 * Android companion app promotion.
 *
 * `VITE_ANDROID_APP_URL` holds the public link to the Android app — a Play
 * Store listing, or the Play Internal Testing opt-in link while the listing is
 * still private. The variable is baked into the bundle at build time; when it
 * is unset the promo is simply not rendered, so no dead link ever ships.
 */

/**
 * Normalises the raw env value into a usable link. Returns `null` for a blank
 * value or anything that is not an `http(s)` URL, so a mis-set variable hides
 * the promo instead of rendering a broken one.
 */
export function resolveAndroidAppUrl(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export const androidAppUrl = resolveAndroidAppUrl(
  import.meta.env.VITE_ANDROID_APP_URL,
);

/** True when the device is an iPhone/iPad — an Android app is noise there. */
export function isIosDevice(userAgent: string): boolean {
  return /iPhone|iPad|iPod/.test(userAgent);
}
