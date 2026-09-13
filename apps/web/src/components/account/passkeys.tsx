import { useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyRound,
  Loader2,
  Trash2,
  Plus,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pkClient, type Passkey } from "./security-clients";

/** Passkeys: list, add, remove. */

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

export function PasskeysSection() {
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
