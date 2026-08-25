import mongoose from "mongoose";
import { WalletModel } from "../../src/models/wallet.model.js";
import type { IWallet, WalletType, WalletStatus } from "../../src/models/wallet.model.js";

let counter = 0;

export async function createTestWallet(
  userId: mongoose.Types.ObjectId,
  overrides: Partial<{ name: string; type: WalletType; status: WalletStatus; color: string; description: string }> = {}
): Promise<IWallet> {
  counter++;
  const defaults = {
    userId,
    name: overrides.name || `Wallet ${counter}`,
    type: overrides.type || ("exchange" as WalletType),
    status: overrides.status || ("active" as WalletStatus),
    color: overrides.color || "#000000",
    description: overrides.description || `Test wallet ${counter}`,
  };

  const wallet = new WalletModel(defaults);
  await wallet.save();
  return wallet;
}
