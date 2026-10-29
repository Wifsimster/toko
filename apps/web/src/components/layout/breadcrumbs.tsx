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

type CrumbContext = {
  params: Record<string, string>;
  t: TFunction;
  loaderData?: unknown;
};

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    crumb?: string;
    crumbParent?: { to: string; crumb: string };
    crumbLabel?: (ctx: CrumbContext) => string;
  }
}

export type Crumb = { to: string; label: string };

type CrumbMatch = {
  pathname: string;
  params: Record<string, string>;
  staticData?: StaticDataRouteOption;
  loaderData?: unknown;
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
      ? crumbLabel({ params: match.params, t, loaderData: match.loaderData })
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
