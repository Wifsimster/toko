/**
 * Search-param contract for the QuickActionFab "open create dialog" deep-link.
 * Routes that opt in expose `?new=1` (or `?new=true`) to auto-open their primary
 * create dialog; the page is expected to clear the param after consuming it.
 */
export type NewDialogSearch = { new?: true };

export function parseNewDialogSearch(
  search: Record<string, unknown>,
): NewDialogSearch {
  if (search.new === true || search.new === "1" || search.new === "true") {
    return { new: true };
  }
  return {};
}
