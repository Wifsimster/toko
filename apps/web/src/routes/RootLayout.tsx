import { Outlet, useRouterState } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { InstallPrompt } from "@/components/shared/install-prompt";
import { useSilentPwaUpdate } from "@/hooks/use-pwa-update";

export function RootLayout() {
  useSilentPwaUpdate();

  const isQuiz = useRouterState({
    select: (s) => s.location.pathname.startsWith("/quiz"),
  });
  return (
    <>
      <Outlet />
      <Toaster />
      {!isQuiz && <InstallPrompt />}
    </>
  );
}
