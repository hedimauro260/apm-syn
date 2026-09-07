import mongoose from "mongoose";
import crypto from "node:crypto";
import { ConflictError, ForbiddenError, NotFoundError, AppError } from "../utils/errors.js";
import { WebsiteModel } from "../models/website.model.js";
import { WalletModel } from "../models/wallet.model.js";
import { TransactionModel } from "../models/transaction.model.js";
import { IdempotencyKeyModel } from "../models/idempotency-key.model.js";
import { WebsiteAssetBalanceModel } from "../models/website-asset-balance.model.js";
import * as transactionRepository from "../repositories/transaction.repository.js";
import type { EarningBody, WithdrawalBody } from "../schemas/website-operations.schema.js";

function assertWebsiteOperable(website: { status: string }): void {
  if (website.status === "archived")
    throw new ConflictError(
      "WEBSITE_ARCHIVED",
      "Archived website cannot be used for financial operations"
    );
}

function assertWalletOperable(wallet: { status: string }): void {
  if (wallet.status === "archived")
    throw new ConflictError(
      "WALLET_ARCHIVED",
      "Archived wallet cannot be used for financial operations"
    );
  if (wallet.status === "inactive")
    throw new ConflictError(
      "WALLET_INACTIVE",
      "Inactive wallet cannot be used for financial operations"
    );
}

async function getWebsiteOrFail(
  websiteId: string,
  userId: string
): Promise<{ website: (typeof WebsiteModel)["prototype"] }> {
  if (!mongoose.Types.ObjectId.isValid(websiteId)) throw new NotFoundError("Website");
  const website = await WebsiteModel.findById(websiteId).exec();
  if (!website) throw new NotFoundError("Website");
  if (String(website.userId) !== userId) throw new ForbiddenError();
  return { website: website as unknown as (typeof WebsiteModel)["prototype"] };
}

async function getWalletOrFail(
  walletId: string,
  userId: string
): Promise<{ wallet: (typeof WalletModel)["prototype"] }> {
  if (!mongoose.Types.ObjectId.isValid(walletId)) throw new NotFoundError("Wallet");
  const wallet = await WalletModel.findById(walletId).exec();
  if (!wallet) throw new NotFoundError("Wallet");
  if (String(wallet.userId) !== userId) throw new ForbiddenError();
  return { wallet: wallet as unknown as (typeof WalletModel)["prototype"] };
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map(k => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

function hashRequest(payload: unknown): string {
  return crypto.createHash("sha256").update(stableStringify(payload)).digest("hex");
}

function buildEarningHash(websiteId: string, data: EarningBody): string {
  return hashRequest({ websiteId, ...data, type: "WEBSITE_EARNING" });
}

function buildWithdrawalHash(websiteId: string, data: WithdrawalBody): string {
  return hashRequest({ websiteId, ...data, type: "WEBSITE_WITHDRAWAL" });
}

async function handleIdempotent<T>(
  userId: string,
  key: string,
  scope: string,
  requestHash: string,
  operation: (session: mongoose.ClientSession | null) => Promise<T>
): Promise<{ result: T; status: number; fromCache: boolean }> {
  const existing = await IdempotencyKeyModel.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    key,
  })
    .lean()
    .exec();

  if (existing) {
    if (existing.requestHash !== requestHash) {
      throw new ConflictError(
        "IDEMPOTENCY_CONFLICT",
        "Idempotency key already used with different payload"
      );
    }
    return { result: existing.responseBody as T, status: existing.responseStatus, fromCache: true };
  }

  const session = await mongoose.startSession();
  let result: T | null = null;
  let status = 201;
  try {
    await session.withTransaction(async () => {
      const existingInTx = await IdempotencyKeyModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        key,
      })
        .session(session)
        .exec();

      if (existingInTx) {
        if (existingInTx.requestHash !== requestHash) {
          throw new ConflictError(
            "IDEMPOTENCY_CONFLICT",
            "Idempotency key already used with different payload"
          );
        }
        result = existingInTx.responseBody as T;
        status = existingInTx.responseStatus;
        return;
      }

      const opResult = await operation(session);
      result = opResult;
      status = 201;

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      try {
        await IdempotencyKeyModel.create(
          [
            {
              userId: new mongoose.Types.ObjectId(userId),
              key,
              scope,
              requestHash,
              transactionId: (opResult as { id?: string })?.id
                ? new mongoose.Types.ObjectId((opResult as { id: string }).id)
                : undefined,
              responseStatus: status,
              responseBody: opResult as unknown as Record<string, unknown>,
              expiresAt,
            },
          ],
          { session }
        );
      } catch (err: unknown) {
        const isDup = (err as { code?: number })?.code === 11000;
        if (isDup) {
          const dup = await IdempotencyKeyModel.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            key,
          })
            .session(session)
            .lean()
            .exec();
          if (dup) {
            if (dup.requestHash !== requestHash) {
              throw new ConflictError(
                "IDEMPOTENCY_CONFLICT",
                "Idempotency key already used with different payload"
              );
            }
            result = dup.responseBody as T;
            status = dup.responseStatus;
            return;
          }
        }
        throw err;
      }
    });
  } finally {
    await session.endSession();
  }

  if (result) return { result, status, fromCache: false };

  const fallback = await IdempotencyKeyModel.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    key,
  })
    .lean()
    .exec();
  if (fallback)
    return { result: fallback.responseBody as T, status: fallback.responseStatus, fromCache: true };
  throw new AppError(500, "IDEMPOTENCY_ERROR", "Failed to process idempotent request");
}

export async function recordEarning(
  userId: string,
  websiteId: string,
  data: EarningBody,
  idempotencyKey: string
): Promise<Record<string, unknown>> {
  const { website } = await getWebsiteOrFail(websiteId, userId);
  assertWebsiteOperable(website);

  const requestHash = buildEarningHash(websiteId, data);

  const { result } = await handleIdempotent<Record<string, unknown>>(
    userId,
    idempotencyKey,
    "WEBSITE_EARNING",
    requestHash,
    async session => {
      const toParticipant = (p: { type: string; id?: string }) => ({
        type: p.type,
        ...(p.id ? { id: new mongoose.Types.ObjectId(p.id) } : {}),
      });

      await WebsiteAssetBalanceModel.findOneAndUpdate(
        {
          websiteId: new mongoose.Types.ObjectId(websiteId),
          assetExternalId: data.asset.externalId,
        },
        { $inc: { balance: data.quantity } },
        { upsert: true, new: true, session: session as never }
      ).exec();

      const docs = await TransactionModel.create(
        [
          {
            userId: new mongoose.Types.ObjectId(userId),
            type: "WEBSITE_EARNING",
            source: toParticipant({ type: "EXTERNAL" }),
            destination: toParticipant({ type: "WEBSITE", id: websiteId }),
            asset: data.asset,
            quantity: data.quantity,
            usdValue: data.usdValue,
            countsTowardGoal: false,
            date: data.date,
            description: data.description,
          },
        ],
        { session: session as unknown as undefined }
      );
      const doc = docs[0] as unknown as {
        toObject: () => Record<string, unknown>;
        _id: mongoose.Types.ObjectId;
        userId: mongoose.Types.ObjectId;
        source: unknown;
        destination: unknown;
      };
      const obj = doc.toObject() as Record<string, unknown>;
      const { _id, __v, userId: uid, ...rest } = obj;
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
        userId: String(uid),
        ...rest,
        source: normSource,
        destination: normDest,
      } as Record<string, unknown>;
    }
  );

  return result;
}

export async function withdrawFromWebsite(
  userId: string,
  websiteId: string,
  data: WithdrawalBody,
  idempotencyKey: string
): Promise<Record<string, unknown>> {
  const { website } = await getWebsiteOrFail(websiteId, userId);
  const { wallet } = await getWalletOrFail(data.walletId, userId);
  assertWebsiteOperable(website);
  assertWalletOperable(wallet);

  const requestHash = buildWithdrawalHash(websiteId, data);

  const { result } = await handleIdempotent<Record<string, unknown>>(
    userId,
    idempotencyKey,
    "WEBSITE_WITHDRAWAL",
    requestHash,
    async session => {
      const updated = await WebsiteAssetBalanceModel.findOneAndUpdate(
        {
          websiteId: new mongoose.Types.ObjectId(websiteId),
          assetExternalId: "usd",
          balance: { $gte: data.usdValue },
        },
        { $inc: { balance: -data.usdValue } },
        { new: true, session: session as never }
      ).exec();

      if (!updated) {
        const available = await transactionRepository.getWebsiteUsdBalance(
          websiteId,
          session
        );
        if (data.usdValue > available) {
          throw new AppError(422, "INSUFFICIENT_BALANCE", "Insufficient website balance", {
            asset: "usd",
            available,
            requested: data.usdValue,
          });
        }
        await WebsiteAssetBalanceModel.findOneAndUpdate(
          {
            websiteId: new mongoose.Types.ObjectId(websiteId),
            assetExternalId: "usd",
          },
          { $set: { balance: available - data.usdValue } },
          { upsert: true, new: true, session: session as never }
        ).exec();
      }

      const toParticipant = (p: { type: string; id?: string }) => ({
        type: p.type,
        ...(p.id ? { id: new mongoose.Types.ObjectId(p.id) } : {}),
      });

      const docs = await TransactionModel.create(
        [
          {
            userId: new mongoose.Types.ObjectId(userId),
            type: "WEBSITE_WITHDRAWAL",
            source: toParticipant({ type: "WEBSITE", id: websiteId }),
            destination: toParticipant({ type: "WALLET", id: data.walletId }),
            asset: data.asset,
            quantity: data.quantity,
            usdValue: data.usdValue,
            countsTowardGoal: data.countsTowardGoal ?? false,
            date: data.date,
            description: data.description,
          },
        ],
        { session: session as unknown as undefined }
      );
      const doc = docs[0] as unknown as {
        toObject: () => Record<string, unknown>;
        _id: mongoose.Types.ObjectId;
        userId: mongoose.Types.ObjectId;
        source: unknown;
        destination: unknown;
      };
      const obj = doc.toObject() as Record<string, unknown>;
      const { _id, __v, userId: uid, ...rest } = obj;
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
        userId: String(uid),
        ...rest,
        source: normSource,
        destination: normDest,
      } as Record<string, unknown>;
    }
  );

  return result;
}
