import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import {
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Breadcrumbs, useBreadcrumbs } from "@/components/layout/breadcrumbs";

export function AppHeader() {
  const { t } = useTranslation();
  const hasBreadcrumbs = useBreadcrumbs().length > 0;
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70 md:px-6 lg:px-8 landscape:max-md:h-10">
      <SidebarTrigger
        aria-label={t("nav.toggleSidebar")}
        className="-ml-1 hidden md:inline-flex"
      />
      {hasBreadcrumbs && (
        <>
          <Separator
            orientation="vertical"
            aria-hidden="true"
            className="hidden h-4 data-vertical:self-center md:block"
          />
          <Breadcrumbs className="min-w-0 flex-1" />
        </>
      )}
      <div className="ml-auto flex items-center">
        <ModeToggle />
      </div>
    </header>
  );
}
