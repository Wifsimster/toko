import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import {
  Loader2,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Callout } from "@/components/ui/callout";
import { tfClient } from "./security-clients";

/**
 * Turning 2FA on, as one short flow the parent can follow: password, then
 * the QR code, then the backup codes. The reducer keeps those steps from
 * drifting out of order — five booleans would let the dialog show a QR
 * code and a password prompt at once.
 */

type EnableTFState = {
  open: boolean;
  password: string;
  step: "password" | "qr" | "verify" | "done";
  totpURI: string | null;
  backupCodes: string[];
  code: string;
  error: string;
  loading: boolean;
};

type EnableTFAction =
  | { type: "open" }
  | { type: "close" }
  | { type: "setPassword"; value: string }
  | { type: "setCode"; value: string }
  | { type: "setError"; value: string }
  | { type: "setLoading"; value: boolean }
  | { type: "enabledSuccess"; totpURI: string; backupCodes: string[] }
  | { type: "goToVerify" }
  | { type: "verifiedSuccess" }
  | { type: "reset" };

const initialEnableTFState: EnableTFState = {
  open: false,
  password: "",
  step: "password",
  totpURI: null,
  backupCodes: [],
  code: "",
  error: "",
  loading: false,
};

function enableTFReducer(
  state: EnableTFState,
  action: EnableTFAction
): EnableTFState {
  switch (action.type) {
    case "open":
      return { ...state, open: true };
    case "close":
      return { ...state, open: false };
    case "setPassword":
      return { ...state, password: action.value };
    case "setCode":
      return { ...state, code: action.value };
    case "setError":
      return { ...state, error: action.value };
    case "setLoading":
      return { ...state, loading: action.value };
    case "enabledSuccess":
      return {
        ...state,
        totpURI: action.totpURI,
        backupCodes: action.backupCodes,
        step: "qr",
        error: "",
      };
    case "goToVerify":
      return { ...state, step: "verify" };
    case "verifiedSuccess":
      return { ...state, step: "done", error: "" };
    case "reset":
      return initialEnableTFState;
    default:
      return state;
  }
}

export function EnableTwoFactorDialog() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(enableTFReducer, initialEnableTFState);
  const { open, password, step, totpURI, backupCodes, code, error, loading } =
    state;

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "setLoading", value: true });
    dispatch({ type: "setError", value: "" });
    try {
      const res = await tfClient().enable({ password });
      if (res.error || !res.data?.totpURI) {
        dispatch({
          type: "setError",
          value: t("security.twoFactor.passwordError"),
        });
        return;
      }
      dispatch({
        type: "enabledSuccess",
        totpURI: res.data.totpURI,
        backupCodes: res.data.backupCodes ?? [],
      });
    } catch {
      dispatch({
        type: "setError",
        value: t("security.twoFactor.networkError"),
      });
    } finally {
      dispatch({ type: "setLoading", value: false });
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "setLoading", value: true });
    dispatch({ type: "setError", value: "" });
    try {
      const res = await (authClient as unknown as {
        twoFactor: {
          verifyTotp: (a: { code: string }) => Promise<{
            data?: unknown;
            error?: { message?: string } | null;
          }>;
        };
      }).twoFactor.verifyTotp({ code });
      if (res.error) {
        dispatch({
          type: "setError",
          value: t("security.twoFactor.codeInvalid"),
        });
        return;
      }
      dispatch({ type: "verifiedSuccess" });
    } catch {
      dispatch({
        type: "setError",
        value: t("security.twoFactor.networkError"),
      });
    } finally {
      dispatch({ type: "setLoading", value: false });
    }
  };

  const handleClose = (next: boolean) => {
    if (next) {
      dispatch({ type: "open" });
    } else {
      if (step === "done") {
        // Refresh the page so the session reflects the new state.
        window.location.reload();
      } else {
        dispatch({ type: "reset" });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger
        render={
          <Button variant="default" size="sm">
            <ShieldCheck className="size-4" data-icon="inline-start" />
            {t("security.twoFactor.enableCta")}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("security.twoFactor.enableTitle")}</DialogTitle>
          <DialogDescription>
            {step === "password" && t("security.twoFactor.enablePasswordHelp")}
            {step === "qr" && t("security.twoFactor.enableScanHelp")}
            {step === "verify" && t("security.twoFactor.enableVerifyHelp")}
            {step === "done" && t("security.twoFactor.enableDoneHelp")}
          </DialogDescription>
        </DialogHeader>

        {step === "password" && (
          <form onSubmit={handleStart} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="tf-password">{t("security.password")}</Label>
              <Input
                id="tf-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) =>
                  dispatch({ type: "setPassword", value: e.target.value })
                }
                required
                autoFocus
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                {t("child.cancel")}
              </DialogClose>
              <Button type="submit" disabled={loading || !password}>
                {loading && (
                  <Loader2
                    className="size-4 animate-spin"
                    data-icon="inline-start"
                  />
                )}
                {t("security.continue")}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "qr" && totpURI && (
          <div className="space-y-4">
            <div className="flex justify-center rounded-md bg-white p-4">
              <QRCode value={totpURI} size={176} />
            </div>
            <TotpSecretRow uri={totpURI} />
            <BackupCodesBlock codes={backupCodes} />
            <DialogFooter>
              <Button
                onClick={() => dispatch({ type: "goToVerify" })}
                className="w-full"
              >
                {t("security.continue")}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "verify" && (
          <form onSubmit={handleVerify} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="tf-code">{t("security.twoFactor.codeLabel")}</Label>
              <Input
                id="tf-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) =>
                  dispatch({
                    type: "setCode",
                    value: e.target.value.replace(/\D/g, ""),
                  })
                }
                required
                autoFocus
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={loading || code.length !== 6}>
                {loading && (
                  <Loader2
                    className="size-4 animate-spin"
                    data-icon="inline-start"
                  />
                )}
                {t("security.twoFactor.verifyCta")}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-3">
            <Callout variant="success">
              {t("security.twoFactor.enableDoneCallout")}
            </Callout>
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>
                {t("security.close")}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TotpSecretRow({ uri }: { uri: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  // Extract `secret=…` from the otpauth:// URI so the user can paste it
  // into an authenticator app that can't read QR codes.
  const secret = (() => {
    try {
      return new URL(uri).searchParams.get("secret") ?? "";
    } catch {
      return "";
    }
  })();
  if (!secret) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in non-HTTPS contexts — silent ignore.
    }
  };
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">
        {t("security.twoFactor.manualKey")}
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded bg-muted px-2 py-1 font-mono text-xs">
          {secret}
        </code>
        <Button variant="outline" size="sm" type="button" onClick={copy}>
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

function BackupCodesBlock({ codes }: { codes: string[] }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  if (!codes.length) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignored
    }
  };
  return (
    <div className="space-y-2 rounded-md border bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">
          {t("security.twoFactor.backupCodesTitle")}
        </p>
        <Button variant="outline" size="sm" type="button" onClick={copy}>
          {copied ? (
            <Check className="size-3.5" data-icon="inline-start" />
          ) : (
            <Copy className="size-3.5" data-icon="inline-start" />
          )}
          {t("security.copy")}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("security.twoFactor.backupCodesHelp")}
      </p>
      <ul className="grid grid-cols-2 gap-1 font-mono text-xs">
        {codes.map((c) => (
          <li key={c} className="rounded bg-background px-2 py-1">
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}
