const STATIC_ASSET_EXTENSION =
  /\.(?:js|mjs|css|map|json|woff2?|ttf|eot|svg|png|jpe?g|gif|webp|avif|ico|txt|wasm)$/i;

export function isStaticAssetPath(pathname: string): boolean {
  return (
    pathname.startsWith("/assets/") || STATIC_ASSET_EXTENSION.test(pathname)
  );
}

const REVALIDATED_FILE =
  /^\/(?:index\.html|sw\.js|push-sw\.js|registerSW\.js|workbox-[\w-]+\.js|manifest\.webmanifest)$/;

export function staticCacheControl(pathname: string): string | null {
  if (pathname.startsWith("/assets/")) {
    return "public, max-age=31536000, immutable";
  }
  if (REVALIDATED_FILE.test(pathname)) return "no-cache";
  return null;
}
