import { Link, useMatches } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    /** i18n key rendered in the breadcrumb trail for this route. */
    crumb?: string;
  }
}

export function Breadcrumbs({ className }: { className?: string }) {
  const { t } = useTranslation();
  const matches = useMatches();

  const crumbs = matches
    .filter((m) => !!m.staticData?.crumb)
    .map((m) => ({
      to: m.pathname,
      label: t(m.staticData!.crumb!),
    }));

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Fragment key={c.to}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link to={c.to} />}
                  >
                    {c.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
