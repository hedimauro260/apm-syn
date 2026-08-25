import mongoose from "mongoose";
import { NotFoundError } from "../../utils/errors.js";
import { logger } from "../../config/logger.js";
import { UserModel } from "../../models/user.model.js";
import { WalletModel } from "../../models/wallet.model.js";
import { WebsiteModel } from "../../models/website.model.js";
import { TransactionModel } from "../../models/transaction.model.js";
import { GoalModel } from "../../models/goal.model.js";
import { WebsiteAssetBalanceModel } from "../../models/website-asset-balance.model.js";
import { IdempotencyKeyModel } from "../../models/idempotency-key.model.js";
const BACKUP_VERSION = "1.0";

function sanitize(doc: Record<string, unknown>): Record<string, unknown> {
  const { _id, __v, userId, ...rest } = doc;
  const result: Record<string, unknown> = { id: String(_id), ...rest };
  if (userId !== undefined) {
    result.userId = String(userId);
  }
  return result;
}

export async function exportBackup(userId: string) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const user = await UserModel.findById(userObjectId).lean().exec();
  if (!user) {
    throw new NotFoundError("User");
  }

  const wallets = await WalletModel.find({ userId: userObjectId }).lean().exec();
  const websites = await WebsiteModel.find({ userId: userObjectId }).lean().exec();
  const transactions = await TransactionModel.find({ userId: userObjectId }).lean().exec();
  const goals = await GoalModel.find({ userId: userObjectId }).lean().exec();

  const websiteIds = websites.map((w) => w._id);
  const websiteAssetBalances = websiteIds.length > 0
    ? await WebsiteAssetBalanceModel.find({ websiteId: { $in: websiteIds } }).lean().exec()
    : [];

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    application: "APM SYN",
    data: {
      user: sanitize(user as unknown as Record<string, unknown>),
      wallets: wallets.map((w) => sanitize(w as unknown as Record<string, unknown>)),
      websites: websites.map((w) => sanitize(w as unknown as Record<string, unknown>)),
      transactions: transactions.map((t) => sanitize(t as unknown as Record<string, unknown>)),
      goals: goals.map((g) => sanitize(g as unknown as Record<string, unknown>)),
      websiteAssetBalances: websiteAssetBalances.map((b) =>
        sanitize(b as unknown as Record<string, unknown>)
      ),
    },
  };
}

export async function deleteAccountData(userId: string): Promise<void> {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const user = await UserModel.findById(userObjectId).exec();
  if (!user) {
    throw new NotFoundError("User");
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const websites = await WebsiteModel.find({ userId: userObjectId }).session(session).exec();
      const websiteIds = websites.map((w) => w._id);

      const idempotencyResult = await IdempotencyKeyModel.deleteMany(
        { userId: userObjectId },
        { session }
      );
      const transactionResult = await TransactionModel.deleteMany(
        { userId: userObjectId },
        { session }
      );
      const goalResult = await GoalModel.deleteMany({ userId: userObjectId }, { session });

      let balanceResult = { deletedCount: 0 };
      if (websiteIds.length > 0) {
        balanceResult = await WebsiteAssetBalanceModel.deleteMany(
          { websiteId: { $in: websiteIds } },
          { session }
        );
      }

      const websiteResult = await WebsiteModel.deleteMany(
        { userId: userObjectId },
        { session }
      );
      const walletResult = await WalletModel.deleteMany({ userId: userObjectId }, { session });

      await UserModel.findByIdAndDelete(userObjectId, { session });

      logger.info(
        {
          userId,
          idempotencyKeys: idempotencyResult.deletedCount,
          transactions: transactionResult.deletedCount,
          goals: goalResult.deletedCount,
          websiteAssetBalances: balanceResult.deletedCount,
          websites: websiteResult.deletedCount,
          wallets: walletResult.deletedCount,
        },
        "Account data deleted successfully"
      );
    });
  } finally {
    await session.endSession();
  }
}
