import { createLazyFileRoute } from "@tanstack/react-router";
import { AdminAnalyticsPage } from "./AdminAnalyticsPage";

export const Route = createLazyFileRoute("/_authenticated/admin-analytics/")({
  component: AdminAnalyticsPage,
});
