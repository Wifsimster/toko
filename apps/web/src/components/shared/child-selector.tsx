import { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Plus, Pencil, Trash2, MoreVertical, Sparkles, ArrowRight } from "lucide-react";
import { getChildEmoji, formatAgeRange } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useChildren, useDeleteChild } from "@/hooks/use-children";
import { useBillingStatus, useCheckout } from "@/hooks/use-billing";
import { useUiStore } from "@/stores/ui-store";
import { ChildForm } from "@/components/shared/child-form";
import { PromoGate } from "@/components/shared/promo-gate";
import type { Child } from "@focusflow/validators";

function AddSecondChildUpsell() {
  const { t } = useTranslation();
  const checkout = useCheckout();
  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-accent/10 to-transparent p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold">
            {t("child.secondChildUpsellTitle")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("child.secondChildUpsellBody")}
          </p>
          <Button
            size="sm"
            className="mt-3 gap-1.5"
            onClick={() => checkout.mutate()}
            disabled={checkout.isPending}
          >
            {t("child.secondChildUpsellCta")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <p className="mt-2 text-xs text-muted-foreground/80">
            {t("child.secondChildUpsellNoCard")}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ChildSelector() {
  const { t } = useTranslation();
  const { data: children, isLoading } = useChildren();
  const { data: billing } = useBillingStatus();
  const { activeChildId, setActiveChild } = useUiStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editChild, setEditChild] = useState<Child | null>(null);
  const [deleteChild, setDeleteChild] = useState<Child | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const deleteMutation = useDeleteChild();
  // Show the "go Family" nudge when the parent already has one child and is
  // not on the paid plan. PromoGate at render time keeps the banner out of
  // the evening tunnel (rule C6).
  const showSecondChildUpsell =
    (children?.length ?? 0) >= 1 && !(billing?.active ?? false);

  // Auto-select first child if none is selected
  useEffect(() => {
    if (!activeChildId && children?.length) {
      setActiveChild(children[0]!.id);
    }
  }, [activeChildId, children, setActiveChild]);

  if (isLoading) return null;

  if (!children?.length) {
    return (
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger
          render={
            <Button size="sm" variant="outline">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {t("child.addChild")}
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("child.addChildTitle")}</DialogTitle>
          </DialogHeader>
          <ChildForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  const selectedChild = children.find((c) => c.id === activeChildId) ?? null;

  const handleDelete = () => {
    if (!deleteChild || deleteConfirm !== deleteChild.name) return;
    deleteMutation.mutate(deleteChild.id, {
      onSuccess: () => {
        // If we deleted the active child, switch to another one (or clear)
        if (deleteChild.id === activeChildId) {
          const remaining = children.filter((c) => c.id !== deleteChild.id);
          setActiveChild(remaining[0]?.id ?? null);
        }
        setDeleteChild(null);
        setDeleteConfirm("");
      },
    });
  };

  return (
    <div className="flex items-center gap-1">
      <Select
        value={activeChildId ?? undefined}
        onValueChange={(v) => v && setActiveChild(v)}
      >
        <SelectTrigger className="w-auto min-w-0 max-w-[9rem] sm:min-w-36 sm:max-w-52">
          <SelectValue placeholder={t("child.firstnameLabel")}>
            <span className="flex items-center gap-1.5">
              <span className="text-base leading-none">{getChildEmoji(selectedChild?.gender)}</span>
              <span className="truncate">{selectedChild?.name}</span>
              {selectedChild?.ageRange && (
                <span className="hidden text-xs text-muted-foreground whitespace-nowrap sm:inline">
                  {formatAgeRange(selectedChild.ageRange)}
                </span>
              )}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {children.map((child) => (
            <SelectItem key={child.id} value={child.id} label={child.name}>
              <span className="flex items-center gap-1.5">
                <span className="text-base leading-none">{getChildEmoji(child.gender)}</span>
                <span>{child.name}</span>
                {child.ageRange && (
                  <span className="text-xs text-muted-foreground">
                    {formatAgeRange(child.ageRange)}
                  </span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Kebab menu for edit/delete of the active child */}
      {selectedChild && (
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                aria-label={t("child.actionsFor", { name: selectedChild.name })}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
          />
          <PopoverContent align="end" className="w-48 gap-0 p-1">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setEditChild(selectedChild);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
              {t("child.edit")}
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setDeleteChild(selectedChild);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-none"
            >
              <Trash2 className="h-4 w-4" />
              {t("child.delete")}
            </button>
          </PopoverContent>
        </Popover>
      )}

      {/* Add child */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger
          render={
            <Button
              size="icon"
              variant="ghost"
              aria-label={t("child.addChild")}
            >
              <Plus className="h-4 w-4" />
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("child.addChild")}</DialogTitle>
          </DialogHeader>
          {showSecondChildUpsell && (
            <PromoGate>
              <AddSecondChildUpsell />
            </PromoGate>
          )}
          <ChildForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit child */}
      <Dialog
        open={!!editChild}
        onOpenChange={(open) => !open && setEditChild(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editChild ? t("child.editChild", { name: editChild.name }) : ""}
            </DialogTitle>
          </DialogHeader>
          {editChild && (
            <ChildForm
              key={editChild.id}
              initialData={editChild}
              onSuccess={() => setEditChild(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={!!deleteChild}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteChild(null);
            setDeleteConfirm("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {deleteChild ? t("child.deleteTitle", { name: deleteChild.name }) : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {deleteChild && (
                <Trans
                  i18nKey="child.deleteBody"
                  values={{ name: deleteChild.name }}
                  components={{ 1: <strong className="text-foreground" /> }}
                />
              )}
            </p>
            <div className="space-y-2">
              <Label htmlFor="delete-child-confirm">
                {deleteChild && (
                  <Trans
                    i18nKey="child.typeNameToConfirm"
                    values={{ name: deleteChild.name }}
                    components={{ 1: <strong /> }}
                  />
                )}
              </Label>
              <Input
                id="delete-child-confirm"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={deleteChild?.name ?? ""}
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("child.cancel")}
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                deleteConfirm !== deleteChild?.name || deleteMutation.isPending
              }
            >
              {deleteMutation.isPending ? t("child.deleting") : t("child.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
