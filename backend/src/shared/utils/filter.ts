export function buildFilterObject(
  query: Record<string, unknown>,
  allowedFields: string[]
): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  for (const field of allowedFields) {
    const value = query[field];
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "string" && value.trim() === "") continue;
    filter[field] = value;
  }

  return filter;
}
