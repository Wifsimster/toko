#!/usr/bin/env bash
# Construit l'AAB release de Tokō signé avec la clé d'upload Google Play.
# Procédure complète : docs/android-play-release.md
set -euo pipefail

cd "$(dirname "$0")/.."

PROPS="${TOKO_KEYSTORE_PROPERTIES:-$HOME/toko-keys/keystore.properties}"
ABIS="${TOKO_ABIS:-arm64-v8a,armeabi-v7a}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"

[ -f "$PROPS" ] || { echo "keystore.properties introuvable : $PROPS" >&2; exit 1; }
prop() { grep -E "^$1=" "$PROPS" | head -1 | cut -d= -f2-; }
STORE_FILE="$(prop storeFile)"
[ -f "$STORE_FILE" ] || { echo "keystore introuvable : $STORE_FILE" >&2; exit 1; }

# Même recette que .github/workflows/android-apk.yml
npx --yes pnpm@9.15.4 install --frozen-lockfile --ignore-workspace --config.node-linker=hoisted
CI=1 npx expo prebuild --platform android --no-install --clean

(
  cd android
  ./gradlew bundleRelease --no-daemon \
    -PreactNativeArchitectures="$ABIS" \
    -Pandroid.injected.signing.store.file="$STORE_FILE" \
    -Pandroid.injected.signing.store.password="$(prop storePassword)" \
    -Pandroid.injected.signing.key.alias="$(prop keyAlias)" \
    -Pandroid.injected.signing.key.password="$(prop keyPassword)"
)

# Les permissions de android.blockedPermissions ne doivent pas revenir par une lib.
MANIFEST="$(ls android/app/build/intermediates/merged_manifests/release/*/AndroidManifest.xml \
  android/app/build/intermediates/merged_manifest/release/*/AndroidManifest.xml 2>/dev/null | head -1)"
BLOCKED="$(node -p "require('./app.json').expo.android.blockedPermissions.join('\n')")"
LEAKS="$(grep -oE 'uses-permission[^>]*"android\.permission\.[A-Z_]+"' "$MANIFEST" \
  | grep -oE 'android\.permission\.[A-Z_]+' | grep -Fxf <(echo "$BLOCKED") || true)"
if [ -n "$LEAKS" ]; then
  echo "Permissions bloquées présentes dans le manifeste :" >&2
  echo "$LEAKS" >&2
  exit 1
fi

AAB=android/app/build/outputs/bundle/release/app-release.aab
echo
keytool -printcert -jarfile "$AAB" | grep -E 'Owner|SHA1'
grep -E 'versionCode|versionName' android/app/build.gradle | sed 's/^ */  /'
sha256sum "$AAB"
