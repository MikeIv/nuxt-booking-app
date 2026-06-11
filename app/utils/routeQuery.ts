/** Безопасно читает строковый query-параметр из route.query */
export function getRouteQueryString(
  query: Record<string, unknown>,
  key: string,
): string | null {
  const value = query[key];
  if (typeof value !== "string" || value.trim() === "") return null;

  const trimmed = value.trim();
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}
