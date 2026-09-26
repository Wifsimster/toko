// Umami-only custom events for the public quiz. Unlike `trackEvent`
// (analytics.ts), nothing is sent to /api/events: the quiz leaves no trace on
// our server. Never pass answers or results here, only which questionnaire.
// `window.umami` is typed in analytics.ts.

export function umamiTrack(event: string, data?: Record<string, string | number>): void {
  try {
    window.umami?.track(event, data);
  } catch {
    // Analytics must never break the page.
  }
}
