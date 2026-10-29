const STATIC_ASSET_EXTENSION =
  /\.(?:js|mjs|css|map|json|woff2?|ttf|eot|svg|png|jpe?g|gif|webp|avif|ico|txt|wasm)$/i;

export function isStaticAssetPath(pathname: string): boolean {
  return (
    pathname.startsWith("/assets/") || STATIC_ASSET_EXTENSION.test(pathname)
  );
}
