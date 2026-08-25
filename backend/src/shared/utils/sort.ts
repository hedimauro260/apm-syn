export function buildSortObject(
  sortString: string | undefined,
  allowedFields: string[],
  defaultSort: Record<string, 1 | -1> = { createdAt: -1 }
): Record<string, 1 | -1> {
  if (!sortString || sortString.trim() === "") return defaultSort;

  const result: Record<string, 1 | -1> = {};
  const parts = sortString
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  for (const part of parts) {
    // Suporta ambos: "-createdAt" (api.md) e "createdAt:desc" (checklist)
    if (part.startsWith("-") && part.length > 1) {
      const field = part.slice(1);
      if (allowedFields.includes(field)) result[field] = -1;
      continue;
    }

    if (part.includes(":")) {
      const [field, dir] = part.split(":") as [string, string | undefined];
      const trimmedField = (field ?? "").trim();
      const direction = (dir ?? "").trim().toLowerCase();
      if (!allowedFields.includes(trimmedField)) continue;
      if (direction === "asc") result[trimmedField] = 1;
      else if (direction === "desc") result[trimmedField] = -1;
      continue;
    }

    // api.md: "field" asc, "-field" desc already handled
    if (allowedFields.includes(part)) result[part] = 1;
  }

  return Object.keys(result).length > 0 ? result : defaultSort;
}
