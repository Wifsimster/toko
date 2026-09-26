// Custom events for the self-hosted Umami tracker loaded in index.html.
// Never pass answers or results here: only which page/questionnaire was used.

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string | number>) => void };
  }
}

export function umamiTrack(event: string, data?: Record<string, string | number>): void {
  try {
    window.umami?.track(event, data);
  } catch {
    // Analytics must never break the page.
  }
}
