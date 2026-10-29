import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { trackEvent } from "@/lib/analytics";

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
