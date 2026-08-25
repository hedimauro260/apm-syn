import mongoose from "mongoose";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";
import * as transactionRepository from "../repositories/transaction.repository.js";
import { WalletModel } from "../models/wallet.model.js";
import { WebsiteModel } from "../models/website.model.js";
import type { ITransaction } from "../models/transaction.model.js";
import { buildSortObject } from "../shared/utils/sort.js";
import type {
  CreateTransactionBody,
  UpdateTransactionBody,
  ListTransactionsQuery,
} from "../schemas/transaction.schema.js";

const ALLOWED_SORT_FIELDS = ["date", "createdAt", "usdValue", "quantity"];

function toResponse(doc: ITransaction): Record<string, unknown> {
  const obj = doc.toObject() as Record<string, unknown>;
  const { _id, __v, userId, ...rest } = obj;
  // Normalize ObjectIds in source/destination
  const source = rest.source as { type: string; id?: unknown } | undefined;
  const destination = rest.destination as { type: string; id?: unknown } | undefined;
  const normSource = source
    ? { ...source, ...(source.id ? { id: String(source.id) } : {}) }
    : source;
  const normDest = destination
    ? { ...destination, ...(destination.id ? { id: String(destination.id) } : {}) }
    : destination;
  return {
    id: String(_id),
    userId: String(userId),
    ...rest,
    source: normSource,
    destination: normDest,
  };
}

async function assertOwnership(
  userId: string,
  participant: { type: string; id?: string }
): Promise<void> {
  if (participant.type === "EXTERNAL") return;
  if (!participant.id) throw new NotFoundError("Wallet");
  if (!mongoose.Types.ObjectId.isValid(participant.id))
    throw new NotFoundError(participant.type === "WALLET" ? "Wallet" : "Website");
  if (participant.type === "WALLET") {
    const wallet = await WalletModel.findById(participant.id).exec();
    if (!wallet) throw new NotFoundError("Wallet");
    if (String(wallet.userId) !== userId) throw new ForbiddenError();
    if (wallet.status === "archived") {
      // Fase 6: ainda não bloqueia transações em arquivada? Permitir leitura, mas criação futura bloqueará
    }
  } else if (participant.type === "WEBSITE") {
    const website = await WebsiteModel.findById(participant.id).exec();
    if (!website) throw new NotFoundError("Website");
    if (String(website.userId) !== userId) throw new ForbiddenError();
  }
}

export async function createTransaction(
  userId: string,
  data: CreateTransactionBody
): Promise<Record<string, unknown>> {
  await assertOwnership(userId, data.source as { type: string; id?: string });
  await assertOwnership(userId, data.destination as { type: string; id?: string });

  // Converter ids string → ObjectId para persistência
  const toParticipant = (p: { type: string; id?: string }) => ({
    type: p.type,
    ...(p.id ? { id: new mongoose.Types.ObjectId(p.id) } : {}),
  });

  const doc = await transactionRepository.create({
    userId: new mongoose.Types.ObjectId(userId) as unknown as ITransaction["userId"],
    type: data.type,
    source: toParticipant(data.source as { type: string; id?: string }) as ITransaction["source"],
    destination: toParticipant(
      data.destination as { type: string; id?: string }
    ) as ITransaction["destination"],
    asset: data.asset,
    quantity: data.quantity,
    usdValue: data.usdValue,
    countsTowardGoal: data.countsTowardGoal ?? false,
    date: data.date,
    description: data.description,
  } as Partial<ITransaction>);

  return toResponse(doc);
}

export async function getTransaction(
  userId: string,
  transactionId: string
): Promise<Record<string, unknown>> {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) throw new NotFoundError("Transaction");
  const doc = await transactionRepository.findById(transactionId);
  if (!doc) throw new NotFoundError("Transaction");
  if (String(doc.userId) !== userId) throw new ForbiddenError();
  return toResponse(doc);
}

export async function listTransactions(
  userId: string,
  query: ListTransactionsQuery
): Promise<{
  data: Record<string, unknown>[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const filter: Record<string, unknown> = { userId: new mongoose.Types.ObjectId(userId) };

  if (query.type) filter.type = query.type;
  if (query.asset) filter["asset.externalId"] = query.asset;
  if (query.countsTowardGoal !== undefined) filter.countsTowardGoal = query.countsTowardGoal;
  if (query.from || query.to) {
    const dateFilter: Record<string, Date> = {};
    if (query.from) dateFilter.$gte = query.from;
    if (query.to) dateFilter.$lte = query.to;
    filter.date = dateFilter;
  }
  if (query.walletId) {
    const oid = new mongoose.Types.ObjectId(query.walletId);
    filter.$or = [{ "source.id": oid }, { "destination.id": oid }];
  }
  if (query.websiteId) {
    const oid = new mongoose.Types.ObjectId(query.websiteId);
    // websiteId filter: source ou destination com type WEBSITE
    const or = (filter.$or as unknown[]) || [];
    or.push({ "source.id": oid }, { "destination.id": oid });
    filter.$or = or;
  }

  const sort = buildSortObject(query.sort, ALLOWED_SORT_FIELDS, { date: -1 });

  const result = await transactionRepository.findAllPaginated(filter as never, {
    page: query.page,
    limit: query.limit,
    sort,
  });

  return {
    data: result.data.map(d => toResponse(d as ITransaction)),
    pagination: result.pagination,
  };
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  data: UpdateTransactionBody
): Promise<Record<string, unknown>> {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) throw new NotFoundError("Transaction");
  const doc = await transactionRepository.findById(transactionId);
  if (!doc) throw new NotFoundError("Transaction");
  if (String(doc.userId) !== userId) throw new ForbiddenError();

  // Apenas campos permitidos (business-rules 4.3/4.4 imutáveis já garantidos pelo Zod, mas reforçado aqui)
  const allowed: Partial<
    Pick<ITransaction, "quantity" | "usdValue" | "date" | "description" | "countsTowardGoal">
  > = {};
  if (data.quantity !== undefined) allowed.quantity = data.quantity;
  if (data.usdValue !== undefined) allowed.usdValue = data.usdValue;
  if (data.date !== undefined) allowed.date = data.date;
  if (data.description !== undefined) allowed.description = data.description;
  if (data.countsTowardGoal !== undefined) allowed.countsTowardGoal = data.countsTowardGoal;

  const updated = await transactionRepository.updateById(transactionId, allowed);
  if (!updated) throw new NotFoundError("Transaction");
  return toResponse(updated);
}

export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) throw new NotFoundError("Transaction");
  const doc = await transactionRepository.findById(transactionId);
  if (!doc) throw new NotFoundError("Transaction");
  if (String(doc.userId) !== userId) throw new ForbiddenError();
  await transactionRepository.deleteById(transactionId);
}
