import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Loader2,
  ShieldOff,
} from "lucide-react";
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
import { tfClient } from "./security-clients";

/** Turning 2FA off — password confirmation, then a single destructive action. */

export function DisableTwoFactorDialog() {
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
