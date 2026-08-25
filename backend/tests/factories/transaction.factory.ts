import mongoose from "mongoose";
import { TransactionModel } from "../../src/models/transaction.model.js";
import type { ITransaction, TransactionType } from "../../src/models/transaction.model.js";

let counter = 0;

export async function createTestTransaction(
  userId: mongoose.Types.ObjectId,
  overrides: Partial<{
    type: TransactionType;
    source: { type: string; id?: mongoose.Types.ObjectId };
    destination: { type: string; id?: mongoose.Types.ObjectId };
    asset: { externalId: string; symbol: string; name: string };
    quantity: number;
    usdValue: number;
    countsTowardGoal: boolean;
    date: Date;
    description: string;
  }> = {}
): Promise<ITransaction> {
  counter++;
  const defaults = {
    userId,
    type: overrides.type || ("WALLET_DEPOSIT" as TransactionType),
    source: overrides.source || { type: "EXTERNAL" },
    destination: overrides.destination || { type: "EXTERNAL" },
    asset: overrides.asset || { externalId: "bitcoin", symbol: "BTC", name: "Bitcoin" },
    quantity: overrides.quantity || 1,
    usdValue: overrides.usdValue || 50000,
    countsTowardGoal: overrides.countsTowardGoal ?? false,
    date: overrides.date || new Date(),
    description: overrides.description || `Test transaction ${counter}`,
  };

  const transaction = new TransactionModel(defaults);
  await transaction.save();
  return transaction;
}
