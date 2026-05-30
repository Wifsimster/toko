import { useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import {
  KeyRound,
  Loader2,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  Trash2,
  Plus,
  Fingerprint,
  Copy,
  Check,
} from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

// Better Auth's React client surfaces these methods at runtime via the
// twoFactor/passkey plugins, but the generic-stripped client type doesn't
// expose them. Cast through a narrow interface so the SPA gets type help
// without us re-importing the whole plugin generic.
type TwoFactorEnableResult = {
  data?: { totpURI?: string; backupCodes?: string[] } | null;
  error?: { message?: string } | null;
};
type Passkey = {
  id: string;
  name?: string | null;
  createdAt?: string | Date | null;
  deviceType?: string;
};

const tfClient = () =>
  (authClient as unknown as {
    twoFactor: {
      enable: (a: { password: string }) => Promise<TwoFactorEnableResult>;
      disable: (a: { password: string }) => Promise<TwoFactorEnableResult>;
      getTotpUri: (a: {
        password: string;
      }) => Promise<{ data?: { totpURI?: string } | null; error?: unknown }>;
      generateBackupCodes: (a: { password: string }) => Promise<{
        data?: { backupCodes?: string[] } | null;
        error?: unknown;
      }>;
    };
  }).twoFactor;

const pkClient = () =>
  (authClient as unknown as {
    passkey: {
      addPasskey: (a?: {
        name?: string;
      }) => Promise<{ data?: unknown; error?: { message?: string } | null }>;
      listUserPasskeys: () => Promise<{
        data?: Passkey[] | null;
        error?: unknown;
      }>;
      deletePasskey: (a: { id: string }) => Promise<{
        data?: unknown;
        error?: { message?: string } | null;
      }>;
    };
  }).passkey;

export function SecurityCard() {
  const { t } = useTranslation();
  const session = useSession();
  const twoFactorEnabled =
    (session.data?.user as { twoFactorEnabled?: boolean } | undefined)
      ?.twoFactorEnabled ?? false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4" />
          {t("security.title")}
        </CardTitle>
        <CardDescription>{t("security.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TwoFactorSection enabled={twoFactorEnabled} />
        <PasskeysSection />
      </CardContent>
    </Card>
  );
}

function TwoFactorSection({ enabled }: { enabled: boolean }) {
  const { t } = useTranslation();
  return (
    <section className="space-y-3">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold inline-flex items-center gap-2">
            <Smartphone className="size-4" />
            {t("security.twoFactor.title")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("security.twoFactor.help")}
          </p>
        </div>
        {enabled ? (
          <Badge variant="default" className="shrink-0">
            {t("security.twoFactor.statusOn")}
          </Badge>
        ) : (
          <Badge variant="secondary" className="shrink-0">
            {t("security.twoFactor.statusOff")}
          </Badge>
        )}
      </header>
      {enabled ? <DisableTwoFactorDialog /> : <EnableTwoFactorDialog />}
    </section>
  );
}

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

function EnableTwoFactorDialog() {
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

function DisableTwoFactorDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await tfClient().disable({ password });
      if (res.error) {
        setError(t("security.twoFactor.passwordError"));
        return;
      }
      setOpen(false);
      window.location.reload();
    } catch {
      setError(t("security.twoFactor.networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <ShieldOff className="size-4" data-icon="inline-start" />
            {t("security.twoFactor.disableCta")}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("security.twoFactor.disableTitle")}</DialogTitle>
          <DialogDescription>
            {t("security.twoFactor.disableHelp")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handle} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="tf-disable-password">
              {t("security.password")}
            </Label>
            <Input
              id="tf-disable-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading && (
                <Loader2
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
              )}
              {t("security.twoFactor.disableConfirm")}
            </Button>
          </DialogFooter>
        </form>
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

type PasskeysSectionState = {
  items: Passkey[] | null;
  loading: boolean;
  error: string;
  addingName: string;
  adding: boolean;
};

type PasskeysSectionAction =
  | { type: "setLoading"; value: boolean }
  | { type: "setItems"; items: Passkey[] }
  | { type: "setError"; value: string }
  | { type: "setAddingName"; value: string }
  | { type: "setAdding"; value: boolean }
  | { type: "addedSuccess" };

const initialPasskeysState: PasskeysSectionState = {
  items: null,
  loading: false,
  error: "",
  addingName: "",
  adding: false,
};

function passkeysReducer(
  state: PasskeysSectionState,
  action: PasskeysSectionAction
): PasskeysSectionState {
  switch (action.type) {
    case "setLoading":
      return { ...state, loading: action.value };
    case "setItems":
      return { ...state, items: action.items };
    case "setError":
      return { ...state, error: action.value };
    case "setAddingName":
      return { ...state, addingName: action.value };
    case "setAdding":
      return { ...state, adding: action.value };
    case "addedSuccess":
      return { ...state, addingName: "", error: "" };
    default:
      return state;
  }
}

function PasskeysSection() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(passkeysReducer, initialPasskeysState);
  const { items, loading, error, addingName, adding } = state;

  const refresh = async () => {
    dispatch({ type: "setLoading", value: true });
    try {
      const res = await pkClient().listUserPasskeys();
      dispatch({ type: "setItems", items: res.data ?? [] });
    } catch {
      dispatch({ type: "setItems", items: [] });
    } finally {
      dispatch({ type: "setLoading", value: false });
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async () => {
    dispatch({ type: "setAdding", value: true });
    dispatch({ type: "setError", value: "" });
    try {
      const res = await pkClient().addPasskey({
        name: addingName.trim() || undefined,
      });
      if (res.error) {
        // The browser cancels the WebAuthn prompt on user dismiss — show
        // a soft message rather than scary "error".
        dispatch({
          type: "setError",
          value: res.error.message ?? t("security.passkeys.addError"),
        });
        return;
      }
      dispatch({ type: "addedSuccess" });
      await refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      // `NotAllowedError` is what browsers throw on cancel/timeout.
      dispatch({
        type: "setError",
        value: /NotAllowedError|cancel/i.test(msg)
          ? t("security.passkeys.addCancelled")
          : t("security.passkeys.addError"),
      });
    } finally {
      dispatch({ type: "setAdding", value: false });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await pkClient().deletePasskey({ id });
      await refresh();
    } catch {
      // Ignore — the list refetch below would surface stale state, but a
      // failed delete is rare enough that the next list call will retry.
    }
  };

  return (
    <section className="space-y-3">
      <header className="space-y-0.5">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2">
          <Fingerprint className="size-4" />
          {t("security.passkeys.title")}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t("security.passkeys.help")}
        </p>
      </header>

      {loading && !items ? (
        <p className="text-xs text-muted-foreground">{t("security.loading")}</p>
      ) : items && items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((pk) => (
            <li
              key={pk.id}
              className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <KeyRound className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {pk.name || t("security.passkeys.unnamed")}
                  </p>
                  {pk.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      {t("security.passkeys.added")}{" "}
                      {new Date(pk.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(pk.id)}
                aria-label={t("security.passkeys.deleteAria")}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t("security.passkeys.empty")}
        </p>
      )}

      <div className="space-y-2 rounded-md border bg-muted/30 p-3">
        <Label htmlFor="pk-name" className="text-xs">
          {t("security.passkeys.nameLabel")}
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="pk-name"
            placeholder={t("security.passkeys.namePlaceholder")}
            value={addingName}
            onChange={(e) =>
              dispatch({ type: "setAddingName", value: e.target.value })
            }
            maxLength={64}
          />
          <Button onClick={handleAdd} disabled={adding}>
            {adding ? (
              <Loader2
                className="size-4 animate-spin"
                data-icon="inline-start"
              />
            ) : (
              <Plus className="size-4" data-icon="inline-start" />
            )}
            {t("security.passkeys.addCta")}
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
