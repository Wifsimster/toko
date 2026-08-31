import { Link, useMatches } from "@tanstack/react-router";
import type { StaticDataRouteOption } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Fragment } from "react";
import type { TFunction } from "i18next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/** Everything a route needs to build its own label for the trail. */
type CrumbContext = {
  params: Record<string, string>;
  t: TFunction;
};

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    /** i18n key rendered in the breadcrumb trail for this route. */
    crumb?: string;
    /**
     * Section this route hangs under, prepended to the trail. Detail pages
     * (`/connaissances/$slug`) sit next to their section's index route rather
     * than under it, so the section never matches on its own — it has to be
     * declared here to give the parent something to click back to.
     */
    crumbParent?: { to: string; crumb: string };
    /**
     * Label for routes whose title is only known at runtime (an article
     * title, a step number). Takes precedence over `crumb`.
     */
    crumbLabel?: (ctx: CrumbContext) => string;
  }
}

export type Crumb = { to: string; label: string };

/** A route match, narrowed to what the trail actually reads. */
type CrumbMatch = {
  pathname: string;
  params: Record<string, string>;
  staticData?: StaticDataRouteOption;
};

export function buildCrumbs(matches: CrumbMatch[], t: TFunction): Crumb[] {
  const crumbs: Crumb[] = [];
  for (const match of matches) {
    const parent = match.staticData?.crumbParent;
    if (parent && !crumbs.some((c) => c.to === parent.to)) {
      crumbs.push({ to: parent.to, label: t(parent.crumb) });
    }

    const { crumb, crumbLabel } = match.staticData ?? {};
    const label = crumbLabel
      ? crumbLabel({ params: match.params, t })
      : crumb
        ? t(crumb)
        : null;

    if (label) crumbs.push({ to: match.pathname, label });
  }
  return crumbs;
}

export function useBreadcrumbs() {
  const { t } = useTranslation();
  return buildCrumbs(useMatches() as CrumbMatch[], t);
}

export function Breadcrumbs({ className }: { className?: string }) {
  const crumbs = useBreadcrumbs();

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
