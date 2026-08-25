import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "node:crypto";
dotenv.config();
import { TransactionModel } from "../src/models/transaction.model.ts";
import { WalletModel } from "../src/models/wallet.model.ts";
import { WebsiteModel } from "../src/models/website.model.ts";
import { UserModel } from "../src/models/user.model.ts";
import { IdempotencyKeyModel } from "../src/models/idempotency-key.model.ts";
import * as websiteOps from "../src/services/website-operations.service.ts";
import * as transactionRepo from "../src/repositories/transaction.repository.ts";

await mongoose.connect(process.env.MONGODB_URI);
await TransactionModel.deleteMany({ description: { $regex: /^F10C_/ } });
await WalletModel.deleteMany({ name: { $regex: /^F10C/ } });
await WebsiteModel.deleteMany({ name: { $regex: /^F10C/ } });
await UserModel.deleteMany({ clerkId: "clerk_f10c" });
await IdempotencyKeyModel.deleteMany({});

const user = await UserModel.create({ clerkId: "clerk_f10c", name: "F10C" });
const uid = String(user._id);
const website = await WebsiteModel.create({
  userId: user._id,
  name: "F10C_Site",
  status: "active",
});
const wallet = await WalletModel.create({
  userId: user._id,
  name: "F10C_Wallet",
  type: "exchange",
  status: "active",
});
const asset = { externalId: "tether", symbol: "USDT", name: "Tether" };

// Earn 100
await websiteOps.recordEarning(
  uid,
  String(website._id),
  { asset, quantity: 100, usdValue: 100, date: new Date(), description: "F10C_earn" },
  crypto.randomUUID()
);
console.log(
  "earned 100, bal",
  await transactionRepo.getWebsiteAssetBalance(String(website._id), "tether")
);

// Concurrent withdrawals: two different keys, each 60, total 120 > 100, one should succeed, one should fail with 422 if protected
const key1 = crypto.randomUUID();
const key2 = crypto.randomUUID();
const p1 = websiteOps.withdrawFromWebsite(
  uid,
  String(website._id),
  {
    walletId: String(wallet._id),
    asset,
    quantity: 60,
    usdValue: 60,
    date: new Date(),
    description: "F10C_wd1",
  },
  key1
);
const p2 = websiteOps.withdrawFromWebsite(
  uid,
  String(website._id),
  {
    walletId: String(wallet._id),
    asset,
    quantity: 60,
    usdValue: 60,
    date: new Date(),
    description: "F10C_wd2",
  },
  key2
);

const results = await Promise.allSettled([p1, p2]);
console.log(
  "concurrent results",
  results.map(r => r.status + ":" + (r.value?.id || r.reason?.code + ":" + r.reason?.message))
);
const bal = await transactionRepo.getWebsiteAssetBalance(String(website._id), "tether");
console.log("final website bal (should be 40 if one succeeded, or -20 if race not protected)", bal);
const count = await TransactionModel.countDocuments({
  userId: user._id,
  description: { $regex: /^F10C_wd/ },
});
console.log("withdraw count", count);

await TransactionModel.deleteMany({ description: { $regex: /^F10C_/ } });
await WalletModel.deleteMany({ name: { $regex: /^F10C/ } });
await WebsiteModel.deleteMany({ name: { $regex: /^F10C/ } });
await UserModel.deleteMany({ clerkId: "clerk_f10c" });
await IdempotencyKeyModel.deleteMany({});
await mongoose.disconnect();
console.log("done concurrent");
