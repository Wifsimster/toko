import { cloneElement, isValidElement, type ReactNode } from "react";

export function frenchSpacing(text: string): string {
  return text
    .replace(/ ([:;?!»])/g, "\u00a0$1")
    .replace(/« /g, "«\u00a0")
    .replace(/(\d) ([%€])/g, "$1\u00a0$2");
}

const RAW_TEXT_TAGS = new Set(["code", "pre", "kbd", "samp"]);

export function frenchSpacingNode(node: ReactNode): ReactNode {
  if (typeof node === "string") return frenchSpacing(node);
  if (Array.isArray(node)) return node.map(frenchSpacingNode);
  if (!isValidElement<{ children?: ReactNode }>(node)) return node;
  if (typeof node.type === "string" && RAW_TEXT_TAGS.has(node.type)) {
    return node;
  }
  const { children } = node.props;
  if (children === undefined || children === null) return node;
  return cloneElement(node, { children: frenchSpacingNode(children) });
}
