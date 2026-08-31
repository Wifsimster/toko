import { Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { InstallPrompt } from "@/components/shared/install-prompt";
import { useSilentPwaUpdate } from "@/hooks/use-pwa-update";

export function RootLayout() {
  // Tokō se met à jour tout seul, sans rien demander. Ce qui est raconté au
  // parent ensuite vit dans <AppUpdatedBanner />, monté dans l'espace connecté.
  useSilentPwaUpdate();

  return (
    <>
      <Outlet />
      <Toaster />
      <InstallPrompt />
    </>
  );
}
