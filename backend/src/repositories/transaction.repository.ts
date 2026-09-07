import { TransactionModel, type ITransaction } from "../models/transaction.model.js";
import { paginate, type PaginatedResult } from "../shared/utils/pagination.js";
import type { FilterQuery } from "mongoose";
import mongoose from "mongoose";

export async function create(data: Partial<ITransaction>): Promise<ITransaction> {
  const doc = new TransactionModel(data);
  return doc.save();
}

export async function findById(id: string): Promise<ITransaction | null> {
  return TransactionModel.findById(id).exec();
}

export async function findAllPaginated(
  filter: FilterQuery<ITransaction>,
  options: { page: number; limit: number; sort: Record<string, 1 | -1> }
): Promise<PaginatedResult<ITransaction>> {
  return paginate<ITransaction>(TransactionModel as never, filter as never, options);
}

export async function updateById(
  id: string,
  data: Partial<
    Pick<ITransaction, "quantity" | "usdValue" | "date" | "description" | "countsTowardGoal">
  >
): Promise<ITransaction | null> {
  return TransactionModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
}

export async function deleteById(id: string): Promise<{ deletedCount: number }> {
  const result = await TransactionModel.deleteOne({ _id: id }).exec();
  return { deletedCount: result.deletedCount };
}

const BALANCE_QUERY_LIMIT = 10_000;

export async function getWalletAssetBalance(
  walletId: string,
  assetExternalId: string,
  session?: unknown
): Promise<number> {
  const query = TransactionModel.find({
    "asset.externalId": assetExternalId,
    $or: [{ "source.id": walletId }, { "destination.id": walletId }],
  })
    .select("type source destination quantity")
    .limit(BALANCE_QUERY_LIMIT)
    .lean();
  if (session) (query as unknown as { session: (s: unknown) => unknown }).session(session);
  const docs = await query.exec();

  let balance = 0;
  for (const doc of docs as unknown as Array<{
    type: string;
    source: { type: string; id?: unknown };
    destination: { type: string; id?: unknown };
    quantity: number;
  }>) {
    const sourceId = doc.source?.id ? String(doc.source.id) : null;
    const destId = doc.destination?.id ? String(doc.destination.id) : null;
    const wid = String(walletId);
    if (destId === wid) balance += doc.quantity;
    if (sourceId === wid) balance -= doc.quantity;
  }
  return balance;
}

export async function findAllByUser(
  userId: string
): Promise<ITransaction[]> {
  return TransactionModel.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ date: -1 })
    .lean()
    .exec() as unknown as Promise<ITransaction[]>;
}

export async function getWebsiteUsdBalance(
  websiteId: string,
  session?: unknown
): Promise<number> {
  const query = TransactionModel.find({
    $or: [{ "source.id": websiteId }, { "destination.id": websiteId }],
  })
    .select("source destination usdValue")
    .limit(BALANCE_QUERY_LIMIT)
    .lean();
  if (session) (query as unknown as { session: (s: unknown) => unknown }).session(session);
  const docs = await query.exec();

  let balance = 0;
  for (const doc of docs as unknown as Array<{
    source: { type: string; id?: unknown };
    destination: { type: string; id?: unknown };
    usdValue: number;
  }>) {
    const sourceId = doc.source?.id ? String(doc.source.id) : null;
    const destId = doc.destination?.id ? String(doc.destination.id) : null;
    const wid = String(websiteId);
    if (destId === wid) balance += doc.usdValue;
    if (sourceId === wid) balance -= doc.usdValue;
  }
  return balance;
}
