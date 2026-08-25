import { WebsiteModel, type IWebsite } from "../models/website.model.js";
import { paginate, type PaginatedResult } from "../shared/utils/pagination.js";

export async function create(data: {
  userId: string;
  name: string;
  url?: string;
  description?: string;
}): Promise<IWebsite> {
  const website = new WebsiteModel(data);
  return website.save();
}

export async function findById(id: string): Promise<IWebsite | null> {
  return WebsiteModel.findById(id).exec();
}

export async function findByUserAndName(userId: string, name: string): Promise<IWebsite | null> {
  return WebsiteModel.findOne({ userId, name }).exec();
}

export async function findAllPaginated(
  filter: Record<string, unknown>,
  options: { page: number; limit: number; sort: Record<string, 1 | -1> }
): Promise<PaginatedResult<IWebsite>> {
  return paginate<IWebsite>(WebsiteModel as never, filter as never, options);
}

export async function updateById(
  id: string,
  data: Partial<Pick<IWebsite, "name" | "url" | "description">>
): Promise<IWebsite | null> {
  return WebsiteModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
}

export async function archiveById(id: string): Promise<IWebsite | null> {
  return WebsiteModel.findByIdAndUpdate(id, { $set: { status: "archived" } }, { new: true }).exec();
}

export async function deleteById(id: string): Promise<{ deletedCount: number }> {
  const result = await WebsiteModel.deleteOne({ _id: id }).exec();
  return { deletedCount: result.deletedCount };
}
