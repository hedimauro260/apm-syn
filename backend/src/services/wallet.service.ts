import mongoose from "mongoose";
import { ConflictError, ForbiddenError, NotFoundError } from "../utils/errors.js";
import * as walletRepository from "../repositories/wallet.repository.js";
import type { IWallet } from "../models/wallet.model.js";
import { buildFilterObject } from "../shared/utils/filter.js";
import { buildSortObject } from "../shared/utils/sort.js";
import type {
  CreateWalletBody,
  UpdateWalletBody,
  ListWalletsQuery,
} from "../schemas/wallet.schema.js";

const ALLOWED_SORT_FIELDS = ["name", "createdAt", "updatedAt"];
const ALLOWED_FILTER_FIELDS = ["status", "type"];

function toWalletResponse(wallet: IWallet): Record<string, unknown> {
  const obj = wallet.toObject() as Record<string, unknown>;
  const { _id, __v, userId, ...rest } = obj;
  return { id: String(_id), userId: String(userId), ...rest };
}

export async function createWallet(
  userId: string,
  data: CreateWalletBody
): Promise<Record<string, unknown>> {
  const existing = await walletRepository.findByUserAndName(userId, data.name);
  if (existing) {
    throw new ConflictError(
      "WALLET_ALREADY_EXISTS",
      `Wallet with name "${data.name}" already exists`
    );
  }

  const wallet = await walletRepository.create({
    userId,
    name: data.name,
    type: data.type,
    color: data.color,
    description: data.description,
  });

  return toWalletResponse(wallet);
}

export async function getWallet(
  userId: string,
  walletId: string
): Promise<Record<string, unknown>> {
  if (!mongoose.Types.ObjectId.isValid(walletId)) throw new NotFoundError("Wallet");
  const wallet = await walletRepository.findById(walletId);
  if (!wallet) throw new NotFoundError("Wallet");
  if (String(wallet.userId) !== userId) throw new ForbiddenError();
  return toWalletResponse(wallet);
}

export async function updateWallet(
  userId: string,
  walletId: string,
  data: UpdateWalletBody
): Promise<Record<string, unknown>> {
  const wallet = await walletRepository.findById(walletId);
  if (!wallet) throw new NotFoundError("Wallet");
  if (String(wallet.userId) !== userId) throw new ForbiddenError();
  if (wallet.status === "archived") {
    throw new ConflictError("WALLET_ARCHIVED", "Archived wallet cannot be updated");
  }

  if (data.name && data.name !== wallet.name) {
    const dup = await walletRepository.findByUserAndName(userId, data.name);
    if (dup && String(dup._id) !== walletId) {
      throw new ConflictError(
        "WALLET_ALREADY_EXISTS",
        `Wallet with name "${data.name}" already exists`
      );
    }
  }

  const updated = await walletRepository.updateById(walletId, data);
  if (!updated) throw new NotFoundError("Wallet");
  return toWalletResponse(updated);
}

export async function archiveWallet(
  userId: string,
  walletId: string
): Promise<Record<string, unknown>> {
  const wallet = await walletRepository.findById(walletId);
  if (!wallet) throw new NotFoundError("Wallet");
  if (String(wallet.userId) !== userId) throw new ForbiddenError();
  if (wallet.status === "archived") return toWalletResponse(wallet);
  const archived = await walletRepository.archiveById(walletId);
  if (!archived) throw new NotFoundError("Wallet");
  return toWalletResponse(archived);
}

export async function deactivateWallet(
  userId: string,
  walletId: string
): Promise<Record<string, unknown>> {
  const wallet = await walletRepository.findById(walletId);
  if (!wallet) throw new NotFoundError("Wallet");
  if (String(wallet.userId) !== userId) throw new ForbiddenError();
  if (wallet.status === "archived")
    throw new ConflictError("WALLET_ARCHIVED", "Archived wallet cannot be deactivated");
  if (wallet.status === "inactive") return toWalletResponse(wallet);
  const deactivated = await walletRepository.deactivateById(walletId);
  if (!deactivated) throw new NotFoundError("Wallet");
  return toWalletResponse(deactivated);
}

export async function activateWallet(
  userId: string,
  walletId: string
): Promise<Record<string, unknown>> {
  const wallet = await walletRepository.findById(walletId);
  if (!wallet) throw new NotFoundError("Wallet");
  if (String(wallet.userId) !== userId) throw new ForbiddenError();
  if (wallet.status === "archived")
    throw new ConflictError("WALLET_ARCHIVED", "Archived wallet cannot be activated");
  if (wallet.status === "active") return toWalletResponse(wallet);
  const activated = await walletRepository.activateById(walletId);
  if (!activated) throw new NotFoundError("Wallet");
  return toWalletResponse(activated);
}

export async function deleteWallet(userId: string, walletId: string): Promise<void> {
  const wallet = await walletRepository.findById(walletId);
  if (!wallet) throw new NotFoundError("Wallet");
  if (String(wallet.userId) !== userId) throw new ForbiddenError();
  await walletRepository.deleteById(walletId);
}

export async function listWallets(
  userId: string,
  query: ListWalletsQuery
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

  const result = await walletRepository.findAllPaginated(filter, {
    page: query.page,
    limit: query.limit,
    sort,
  });

  return {
    data: result.data.map(w => toWalletResponse(w as IWallet)),
    pagination: result.pagination,
  };
}
