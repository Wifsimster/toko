import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Fingerprint, Loader2, Plus, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddPasskey,
  useDeletePasskey,
  useListPasskeys,
} from "@/hooks/use-passkeys";
import { isBiometricSupported } from "@/lib/biometric";

export function PasskeysCard() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const [supported, setSupported] = useState<boolean | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const passkeys = useListPasskeys();
  const addPasskey = useAddPasskey();
  const deletePasskey = useDeletePasskey();

  useEffect(() => {
    void isBiometricSupported().then(setSupported);
  }, []);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim() || t("passkey.defaultName");
    await addPasskey.mutateAsync(trimmed);
    if (!addPasskey.isError) {
      setName("");
      setDialogOpen(false);
    }
  };

  if (supported === false) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-4 w-4" />
          {t("passkey.title")}
        </CardTitle>
        <CardDescription>{t("passkey.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {passkeys.isLoading || supported === null ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : passkeys.data && passkeys.data.length > 0 ? (
          <ul className="space-y-2">
            {passkeys.data.map((pk) => (
              <li
                key={pk.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {pk.name?.trim() || t("passkey.defaultName")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("passkey.addedOn", {
                      date: new Date(pk.createdAt).toLocaleDateString(locale, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }),
                    })}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={t("passkey.remove")}
                        className="text-muted-foreground hover:text-destructive"
                        disabled={deletePasskey.isPending}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("passkey.removeConfirmTitle")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("passkey.removeConfirmDescription")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {t("common.cancel")}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deletePasskey.mutate(pk.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t("passkey.remove")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("passkey.empty")}</p>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t("passkey.add")}
              </Button>
            }
          />
          <DialogContent>
            <form onSubmit={handleAdd}>
              <DialogHeader>
                <DialogTitle>{t("passkey.addDialogTitle")}</DialogTitle>
                <DialogDescription>
                  {t("passkey.addDialogDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-4">
                <Label htmlFor="passkey-name">{t("passkey.nameLabel")}</Label>
                <Input
                  id="passkey-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("passkey.namePlaceholder")}
                  autoComplete="off"
                  autoFocus
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {t("passkey.sharedDeviceWarning")}
                </p>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" type="button" />}>
                  {t("common.cancel")}
                </DialogClose>
                <Button
                  type="submit"
                  disabled={addPasskey.isPending}
                  className="gap-2"
                >
                  {addPasskey.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  {t("passkey.addSubmit")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
