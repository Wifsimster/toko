import { createRootRoute } from "@tanstack/react-router";
import { NotFound } from "@/components/not-found";
import { RootErrorBoundary } from "./root-error-boundary";
import { RootLayout } from "./RootLayout";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: RootErrorBoundary,
});
