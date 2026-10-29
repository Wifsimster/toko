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

export function isIosDevice(userAgent: string): boolean {
  return /iPhone|iPad|iPod/.test(userAgent);
}
