import mongoose from "mongoose";
import { ConflictError, ForbiddenError, NotFoundError } from "../utils/errors.js";
import * as websiteRepository from "../repositories/website.repository.js";
import { TransactionModel } from "../models/transaction.model.js";
import { WebsiteAssetBalanceModel } from "../models/website-asset-balance.model.js";
import type { IWebsite } from "../models/website.model.js";
import { buildFilterObject } from "../shared/utils/filter.js";
import { buildSortObject } from "../shared/utils/sort.js";
import type {
  CreateWebsiteBody,
  UpdateWebsiteBody,
  ListWebsitesQuery,
} from "../schemas/website.schema.js";

const ALLOWED_SORT_FIELDS = ["name", "createdAt", "updatedAt"];
const ALLOWED_FILTER_FIELDS = ["status"];

function toWebsiteResponse(website: IWebsite): Record<string, unknown> {
  const obj = website.toObject() as Record<string, unknown>;
  const { _id, __v, userId, ...rest } = obj;
  return { id: String(_id), userId: String(userId), ...rest };
}

export async function createWebsite(
  userId: string,
  data: CreateWebsiteBody
): Promise<Record<string, unknown>> {
  const existing = await websiteRepository.findByUserAndName(userId, data.name);
  if (existing)
    throw new ConflictError(
      "WEBSITE_NAME_ALREADY_EXISTS",
      `Website with name "${data.name}" already exists`
    );

  const initialBalance = data.initialBalance ?? 0;
  const session = await mongoose.startSession();

  try {
    let website: IWebsite | null = null;
    await session.withTransaction(async () => {
      website = await websiteRepository.create(
        {
          userId,
          name: data.name,
          url: data.url,
          description: data.description,
        },
        session
      );

      if (initialBalance > 0 && website) {
        await WebsiteAssetBalanceModel.findOneAndUpdate(
          {
            websiteId: website._id,
            assetExternalId: "usd",
          },
          { $inc: { balance: initialBalance } },
          { upsert: true, new: true, session }
        ).exec();

        await TransactionModel.create(
          [
            {
              userId: new mongoose.Types.ObjectId(userId),
              type: "WEBSITE_EARNING",
              source: { type: "EXTERNAL" },
              destination: { type: "WEBSITE", id: website._id },
              asset: { externalId: "usd", symbol: "USD", name: "US Dollar" },
              quantity: initialBalance,
              usdValue: initialBalance,
              countsTowardGoal: false,
              date: new Date(),
              description: "Initial balance",
            },
          ],
          { session: session as unknown as undefined }
        );
      }
    });

    if (!website) throw new NotFoundError("Website");
    return toWebsiteResponse(website);
  } finally {
    await session.endSession();
  }
}

export async function getWebsite(
  userId: string,
  websiteId: string
): Promise<Record<string, unknown>> {
  if (!mongoose.Types.ObjectId.isValid(websiteId)) throw new NotFoundError("Website");
  const website = await websiteRepository.findById(websiteId);
  if (!website) throw new NotFoundError("Website");
  if (String(website.userId) !== userId) throw new ForbiddenError();
  return toWebsiteResponse(website);
}

export async function updateWebsite(
  userId: string,
  websiteId: string,
  data: UpdateWebsiteBody
): Promise<Record<string, unknown>> {
  const website = await websiteRepository.findById(websiteId);
  if (!website) throw new NotFoundError("Website");
  if (String(website.userId) !== userId) throw new ForbiddenError();
  if (website.status === "archived")
    throw new ConflictError("WEBSITE_ARCHIVED", "Archived website cannot be updated");

  if (data.name && data.name !== website.name) {
    const dup = await websiteRepository.findByUserAndName(userId, data.name);
    if (dup && String(dup._id) !== websiteId)
      throw new ConflictError(
        "WEBSITE_NAME_ALREADY_EXISTS",
        `Website with name "${data.name}" already exists`
      );
  }

  const updated = await websiteRepository.updateById(websiteId, data);
  if (!updated) throw new NotFoundError("Website");
  return toWebsiteResponse(updated);
}

export async function archiveWebsite(
  userId: string,
  websiteId: string
): Promise<Record<string, unknown>> {
  const website = await websiteRepository.findById(websiteId);
  if (!website) throw new NotFoundError("Website");
  if (String(website.userId) !== userId) throw new ForbiddenError();
  if (website.status === "archived") return toWebsiteResponse(website);
  const archived = await websiteRepository.archiveById(websiteId);
  if (!archived) throw new NotFoundError("Website");
  return toWebsiteResponse(archived);
}

export async function deleteWebsite(userId: string, websiteId: string): Promise<void> {
  const website = await websiteRepository.findById(websiteId);
  if (!website) throw new NotFoundError("Website");
  if (String(website.userId) !== userId) throw new ForbiddenError();

  const count = await TransactionModel.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    $or: [
      { "source.id": new mongoose.Types.ObjectId(websiteId) },
      { "destination.id": new mongoose.Types.ObjectId(websiteId) },
    ],
  }).exec();

  if (count > 0)
    throw new ConflictError(
      "WEBSITE_HAS_TRANSACTIONS",
      "Website has transactions and cannot be deleted; archive it instead"
    );

  await websiteRepository.deleteById(websiteId);
}

export async function listWebsites(
  userId: string,
  query: ListWebsitesQuery
): Promise<{
  data: Record<string, unknown>[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const filterBase = { userId: new mongoose.Types.ObjectId(userId) } as unknown as Record<
    string,
    unknown
  >;
  const extraFilter = buildFilterObject(
    query as unknown as Record<string, unknown>,
    ALLOWED_FILTER_FIELDS
  );
  const filter = { ...filterBase, ...extraFilter };
  const sort = buildSortObject(query.sort, ALLOWED_SORT_FIELDS, { name: 1 });
  const result = await websiteRepository.findAllPaginated(filter, {
    page: query.page,
    limit: query.limit,
    sort,
  });
  return {
    data: result.data.map(w => toWebsiteResponse(w as IWebsite)),
    pagination: result.pagination,
  };
}
