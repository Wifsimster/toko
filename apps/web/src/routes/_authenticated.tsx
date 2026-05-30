import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";
import {
  getCachedSession,
} from "@/lib/auth-client";
import { AuthenticatedLayout } from "./AuthenticatedLayout";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const session = await getCachedSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedLayout,
});
