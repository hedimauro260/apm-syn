import mongoose from "mongoose";
import { ConflictError, ForbiddenError, NotFoundError, AppError } from "../utils/errors.js";
import { WalletModel } from "../models/wallet.model.js";
import * as transactionService from "./transaction.service.js";
import * as transactionRepository from "../repositories/transaction.repository.js";
import type {
  DepositBody,
  WithdrawBody,
  AdjustBody,
  TransferBody,
} from "../schemas/wallet-operations.schema.js";

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

async function getWalletOrFail(
  walletId: string,
  userId: string
): Promise<{ wallet: typeof WalletModel.prototype }> {
  if (!mongoose.Types.ObjectId.isValid(walletId)) throw new NotFoundError("Wallet");
  const wallet = await WalletModel.findById(walletId).exec();
  if (!wallet) throw new NotFoundError("Wallet");
  if (String(wallet.userId) !== userId) throw new ForbiddenError();
  return { wallet: wallet as unknown as typeof WalletModel.prototype };
}

async function checkInsufficientBalance(
  walletId: string,
  assetExternalId: string,
  requestedQuantity: number
): Promise<void> {
  const available = await transactionRepository.getWalletAssetBalance(walletId, assetExternalId);
  if (requestedQuantity > available) {
    throw new AppError(422, "INSUFFICIENT_BALANCE", "Insufficient balance", {
      asset: assetExternalId,
      available,
      requested: requestedQuantity,
    });
  }
}

export async function depositToWallet(
  userId: string,
  walletId: string,
  data: DepositBody
): Promise<Record<string, unknown>> {
  const { wallet } = await getWalletOrFail(walletId, userId);
  assertWalletOperable(wallet);

  return transactionService.createTransaction(userId, {
    type: "WALLET_DEPOSIT",
    source: { type: "EXTERNAL" },
    destination: { type: "WALLET", id: walletId },
    asset: data.asset,
    quantity: data.quantity,
    usdValue: data.usdValue,
    countsTowardGoal: data.countsTowardGoal ?? false,
    date: data.date,
    description: data.description,
  } as unknown as Parameters<typeof transactionService.createTransaction>[1]);
}

export async function withdrawFromWallet(
  userId: string,
  walletId: string,
  data: WithdrawBody
): Promise<Record<string, unknown>> {
  const { wallet } = await getWalletOrFail(walletId, userId);
  assertWalletOperable(wallet);

  await checkInsufficientBalance(walletId, data.asset.externalId, data.quantity);

  return transactionService.createTransaction(userId, {
    type: "WALLET_WITHDRAWAL",
    source: { type: "WALLET", id: walletId },
    destination: { type: "EXTERNAL" },
    asset: data.asset,
    quantity: data.quantity,
    usdValue: data.usdValue,
    countsTowardGoal: false,
    date: data.date,
    description: data.description,
  } as unknown as Parameters<typeof transactionService.createTransaction>[1]);
}

export async function adjustWallet(
  userId: string,
  walletId: string,
  data: AdjustBody
): Promise<Record<string, unknown>> {
  const { wallet } = await getWalletOrFail(walletId, userId);
  assertWalletOperable(wallet);

  const isIncrease = data.direction === "increase";

  if (!isIncrease) {
    await checkInsufficientBalance(walletId, data.asset.externalId, data.quantity);
  }

  const source = isIncrease
    ? { type: "EXTERNAL" as const }
    : { type: "WALLET" as const, id: walletId };
  const destination = isIncrease
    ? { type: "WALLET" as const, id: walletId }
    : { type: "EXTERNAL" as const };

  return transactionService.createTransaction(userId, {
    type: "WALLET_ADJUSTMENT",
    source,
    destination,
    asset: data.asset,
    quantity: data.quantity,
    usdValue: data.usdValue,
    countsTowardGoal: isIncrease ? (data.countsTowardGoal ?? false) : false,
    date: data.date,
    description: data.description,
  } as unknown as Parameters<typeof transactionService.createTransaction>[1]);
}

export async function transferBetweenWallets(
  userId: string,
  data: TransferBody
): Promise<Record<string, unknown>> {
  if (data.sourceWalletId === data.destinationWalletId) {
    throw new AppError(422, "INVALID_TRANSFER", "Source and destination wallet must be different");
  }

  const { wallet: sourceWallet } = await getWalletOrFail(data.sourceWalletId, userId);
  const { wallet: destWallet } = await getWalletOrFail(data.destinationWalletId, userId);

  assertWalletOperable(sourceWallet);
  assertWalletOperable(destWallet);

  await checkInsufficientBalance(data.sourceWalletId, data.asset.externalId, data.quantity);

  return transactionService.createTransaction(userId, {
    type: "WALLET_TRANSFER",
    source: { type: "WALLET", id: data.sourceWalletId },
    destination: { type: "WALLET", id: data.destinationWalletId },
    asset: data.asset,
    quantity: data.quantity,
    usdValue: data.usdValue,
    countsTowardGoal: false,
    date: data.date,
    description: data.description,
  } as unknown as Parameters<typeof transactionService.createTransaction>[1]);
}
