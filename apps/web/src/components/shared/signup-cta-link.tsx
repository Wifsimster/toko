import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { trackEvent } from "@/lib/analytics";

// Every "start for free" button on the public pages. Opens /login on the
// registration tab and records which button was clicked, so the funnel
// visit → CTA → signup can be read per entry point.
export function SignupCtaLink({
  location,
  className,
  children,
}: {
  location: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      to="/login"
      search={{ mode: "register" }}
      className={className}
      onClick={() => trackEvent("cta_clicked", { location })}
    >
      {children}
    </Link>
  );
}
