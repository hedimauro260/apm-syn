export function toResponse<
  T extends { _id: unknown; __v?: unknown; toObject?: () => Record<string, unknown> },
>(doc: T): Record<string, unknown> {
  const obj =
    typeof doc.toObject === "function" ? doc.toObject() : ({ ...doc } as Record<string, unknown>);
  const { _id, __v, ...rest } = obj;
  return { id: String(_id), ...rest };
}

export function toResponseArray<
  T extends { _id: unknown; __v?: unknown; toObject?: () => Record<string, unknown> },
>(docs: T[]): Record<string, unknown>[] {
  return docs.map(toResponse);
}
