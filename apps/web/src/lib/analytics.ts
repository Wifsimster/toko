declare global {
  interface Window {
    goatcounter?: {
      count?: (vars: { path: string }) => void;
      no_onload?: boolean;
    };
  }
}

const MAX_ATTEMPTS = 20;

// count.js loads async, so window.goatcounter.count may not exist on the
// first route resolution — retry until it is ready, then give up silently
// (e.g. when the script is blocked).
export function trackPageview(path: string, attempt = 0): void {
  const gc = window.goatcounter;
  if (gc?.count) {
    gc.count({ path });
  } else if (attempt < MAX_ATTEMPTS) {
    window.setTimeout(() => trackPageview(path, attempt + 1), 500);
  }
}
