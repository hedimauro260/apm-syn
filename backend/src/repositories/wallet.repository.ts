import { WalletModel, type IWallet } from "../models/wallet.model.js";
import { paginate, type PaginatedResult } from "../shared/utils/pagination.js";

export async function create(data: {
  userId: string;
  name: string;
  type: IWallet["type"];
  color?: string;
  description?: string;
}): Promise<IWallet> {
  const wallet = new WalletModel(data);
  return wallet.save();
}

export async function findById(id: string): Promise<IWallet | null> {
  return WalletModel.findById(id).exec();
}

export async function findByUserAndName(userId: string, name: string): Promise<IWallet | null> {
  return WalletModel.findOne({ userId, name }).exec();
}

export async function findAllPaginated(
  filter: Record<string, unknown>,
  options: { page: number; limit: number; sort: Record<string, 1 | -1> }
): Promise<PaginatedResult<IWallet>> {
  return paginate<IWallet>(WalletModel as never, filter as never, options);
}

export async function updateById(
  id: string,
  data: Partial<Pick<IWallet, "name" | "type" | "color" | "description">>
): Promise<IWallet | null> {
  return WalletModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
}

export async function archiveById(id: string): Promise<IWallet | null> {
  return WalletModel.findByIdAndUpdate(id, { $set: { status: "archived" } }, { new: true }).exec();
}

export async function deactivateById(id: string): Promise<IWallet | null> {
  return WalletModel.findByIdAndUpdate(id, { $set: { status: "inactive" } }, { new: true }).exec();
}

export async function activateById(id: string): Promise<IWallet | null> {
  return WalletModel.findByIdAndUpdate(id, { $set: { status: "active" } }, { new: true }).exec();
}

export async function deleteById(id: string): Promise<{ deletedCount: number }> {
  const result = await WalletModel.deleteOne({ _id: id }).exec();
  return { deletedCount: result.deletedCount };
}
