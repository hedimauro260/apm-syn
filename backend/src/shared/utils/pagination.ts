import type { Model, FilterQuery } from "mongoose";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export async function paginate<T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  options: { page: number; limit: number; sort?: Record<string, 1 | -1> }
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, options.page);
  const limit = Math.min(100, Math.max(1, options.limit));
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model
      .find(filter)
      .sort(options.sort ?? { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    model.countDocuments(filter).exec(),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    pagination: { page, limit, total, totalPages },
  };
}
