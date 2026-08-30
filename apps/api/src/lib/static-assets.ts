// Paths that must never fall through to the SPA's index.html.
//
// A client running a previous build requests route chunks by their old content
// hash. Answering those with index.html hands the browser 200 text/html where
// it expected a JS module: the dynamic import rejects, the route never mounts,
// and the user gets a blank shell — invisible in the access log because it was
// a 200. Returning 404 lets the client detect the stale build and reload.
const STATIC_ASSET_EXTENSION =
  /\.(?:js|mjs|css|map|json|woff2?|ttf|eot|svg|png|jpe?g|gif|webp|avif|ico|txt|wasm)$/i;

export function isStaticAssetPath(pathname: string): boolean {
  return (
    pathname.startsWith("/assets/") || STATIC_ASSET_EXTENSION.test(pathname)
  );
}
