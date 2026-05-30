import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function PasskeySignInButton() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Hide the button outright on browsers that can't do WebAuthn. Keeps
  // the login screen honest — no dead buttons.
  const supported =
    typeof window !== "undefined" &&
    "PublicKeyCredential" in window;
  if (!supported) return null;

  const handle = async () => {
    setError("");
    setLoading(true);
    try {
      const pk = (authClient as unknown as {
        signIn: { passkey: () => Promise<{ error?: { message?: string } | null }> };
      }).signIn.passkey;
      const res = await pk();
      if (res?.error) {
        setError(t("login.passkeyError"));
        return;
      }
      window.location.assign("/dashboard");
    } catch {
      // User cancelled the prompt or no passkey registered — silent.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full border-border/60"
        onClick={handle}
        disabled={loading}
      >
        <Fingerprint className="mr-2 size-4" />
        {loading ? t("login.passkeyLoading") : t("login.passkeyContinue")}
      </Button>
      {error && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
