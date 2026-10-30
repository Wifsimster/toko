export const REPORT_DISCLAIMER = "Ce document aide le dialogue avec le soignant. Ce n'est pas un diagnostic médical.";

export function cssString(value: string): string {
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/</g, "\\3C ")
    .replace(/[\n\r\f]+/g, " ");
  return `"${escaped}"`;
}

export function reportPrintPageName(childId: string): string {
  return `report-${childId.replace(/[^a-zA-Z0-9-]/g, "") || "child"}`;
}

export function reportPrintCss({
  pageName,
  childName,
  period,
}: {
  pageName: string;
  childName: string;
  period: string;
}): string {
  return [
    `.report-document[data-print-page="${pageName}"] { page: ${pageName}; }`,
    `@page ${pageName} {`,
    `  size: A4;`,
    `  margin: 20mm 17mm 24mm;`,
    `  @top-left { content: ${cssString(`Rapport de suivi · ${childName}`)}; }`,
    `  @top-right { content: ${cssString(period)}; }`,
    `  @bottom-left { content: ${cssString(`Tokō · ${REPORT_DISCLAIMER}`)}; }`,
    `  @bottom-right { content: "Page " counter(page) " sur " counter(pages); }`,
    `}`,
    `@page ${pageName}:first {`,
    `  @top-left { content: none; }`,
    `  @top-right { content: none; }`,
    `}`,
  ].join("\n");
}
