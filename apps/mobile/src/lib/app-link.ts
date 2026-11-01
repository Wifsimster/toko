export type ParsedLink = {
  scheme: string | null;
  hostname: string | null;
  path: string | null;
};

const SERVER_SCHEMES = new Set(["http", "https", "exp", "exps"]);

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

export function appLinkRoute(parsed: ParsedLink): string {
  const scheme = (parsed.scheme ?? "").toLowerCase();
  const path = trimSlashes(parsed.path ?? "");
  const host = SERVER_SCHEMES.has(scheme) ? "" : trimSlashes(parsed.hostname ?? "");
  return [host, path].filter(Boolean).join("/");
}

export function isAppLink(parsed: ParsedLink | null | undefined): boolean {
  return parsed ? appLinkRoute(parsed) !== "" : false;
}
