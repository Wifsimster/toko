import { createFileRoute } from "@tanstack/react-router";

// Component lives in `./index.lazy.tsx` so Recharts ships in its own
// async chunk and stays out of the initial bundle (rule B11).
export const Route = createFileRoute("/_authenticated/admin-analytics/")({});
