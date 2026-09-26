import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";
import { AuthenticatedLayout } from "./AuthenticatedLayout";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    // Imported on demand: keeps better-auth out of the public pages' bundle.
    const { getCachedSession } = await import("@/lib/auth-client");
    const session = await getCachedSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedLayout,
});
