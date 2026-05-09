import { useState } from "react";
import { useNavigate, useMatches } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export type QuickAction = {
  to:
    | "/dashboard"
    | "/journal"
    | "/symptoms"
    | "/strengths"
    | "/routines"
    | "/rewards"
    | "/crisis-list"
    | "/medications"
    | "/timer"
    | "/care-pathway"
    | "/admin-vault"
    | "/barkley"
    | "/activity"
    | "/achievements";
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  /**
   * Optional search params to deep-link the destination's create flow.
   * Routes that opt in expose `?new=1` to auto-open their primary create dialog.
   */
  search?: { new?: true };
};

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    /** Page-contextual quick actions surfaced by the mobile QuickActionFab. */
    quickActions?: readonly QuickAction[];
  }
}

export function QuickActionFab() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const matches = useMatches();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const actions = [...matches]
    .reverse()
    .find((m) => (m.staticData?.quickActions?.length ?? 0) > 0)
    ?.staticData?.quickActions;

  if (!isMobile || !actions || actions.length === 0) return null;

  return (
    <>
      <Button
        type="button"
        size="icon"
        aria-label={t("quickActionFab.open")}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="quick-action-sheet"
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 z-40 h-12 w-12 rounded-full shadow-lg"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          id="quick-action-sheet"
          side="bottom"
          className="px-4 pb-2 pt-4"
        >
          <SheetHeader className="px-0">
            <SheetTitle>{t("quickActionFab.title")}</SheetTitle>
            <SheetDescription className="sr-only">
              {t("quickActionFab.description")}
            </SheetDescription>
          </SheetHeader>
          <ul className="grid grid-cols-2 gap-2 pt-2">
            {actions.map((action) => (
              <li key={action.to}>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-auto w-full justify-start gap-3 py-3"
                  onClick={() => {
                    setOpen(false);
                    navigate({
                      to: action.to,
                      search: action.search ?? {},
                    });
                  }}
                >
                  <action.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {t(action.labelKey)}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
