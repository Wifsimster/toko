// Detect whether the current device exposes a built-in biometric
// authenticator usable by WebAuthn (Touch ID, Face ID, Windows Hello,
// Android fingerprint). Cached after the first probe — the answer never
// changes during a session.
let cached: boolean | null = null;

export async function isBiometricSupported(): Promise<boolean> {
  if (cached !== null) return cached;
  if (typeof window === "undefined") return false;
  const PKC = (window as { PublicKeyCredential?: typeof PublicKeyCredential })
    .PublicKeyCredential;
  if (!PKC || typeof PKC.isUserVerifyingPlatformAuthenticatorAvailable !== "function") {
    cached = false;
    return false;
  }
  try {
    cached = await PKC.isUserVerifyingPlatformAuthenticatorAvailable();
    return cached;
  } catch {
    cached = false;
    return false;
  }
}
