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
console.log("connected");
await TransactionModel.deleteMany({ description: { $regex: /^F10_/ } });
await WalletModel.deleteMany({ name: { $regex: /^F10W/ } });
await WebsiteModel.deleteMany({ name: { $regex: /^F10S/ } });
await UserModel.deleteMany({ clerkId: { $in: ["clerk_f10_A"] } });
await IdempotencyKeyModel.deleteMany({ scope: { $in: ["WEBSITE_EARNING", "WEBSITE_WITHDRAWAL"] } });

const user = await UserModel.create({ clerkId: "clerk_f10_A", name: "F10 A" });
const uid = String(user._id);
console.log("user", uid);

const website = await WebsiteModel.create({
  userId: user._id,
  name: "F10S_FaucetPay",
  url: "https://faucetpay.io",
  status: "active",
});
const wallet = await WalletModel.create({
  userId: user._id,
  name: "F10W_Binance",
  type: "exchange",
  status: "active",
});
console.log("website", website._id.toString(), "wallet", wallet._id.toString());

const assetUSDT = { externalId: "tether", symbol: "USDT", name: "Tether" };

// 4. earning +100 USDT with idempotency
const earnKey = crypto.randomUUID();
const earn1 = await websiteOps.recordEarning(
  uid,
  String(website._id),
  {
    asset: assetUSDT,
    quantity: 100,
    usdValue: 100,
    date: new Date("2026-08-20"),
    description: "F10_earn",
  },
  earnKey
);
console.log("earn1", earn1.id, earn1.type);

// 5. website balance 100
let balW = await transactionRepo.getWebsiteAssetBalance(String(website._id), "tether");
console.log("website balance after earn 100:", balW);

// 6. withdrawal 40 with idempotency
const wdKey = crypto.randomUUID();
const wdDate = new Date("2026-08-21T10:00:00Z");
const wd1 = await websiteOps.withdrawFromWebsite(
  uid,
  String(website._id),
  {
    walletId: String(wallet._id),
    asset: assetUSDT,
    quantity: 40,
    usdValue: 40,
    date: wdDate,
    description: "F10_withdraw",
    countsTowardGoal: true,
  },
  wdKey
);
console.log("withdraw1", wd1.id, wd1.type, wd1.source.id, wd1.destination.id, wd1.countsTowardGoal);

// 7. verify transaction
if (
  String(wd1.source.id) !== String(website._id) ||
  String(wd1.destination.id) !== String(wallet._id)
)
  throw new Error("ids mismatch");
if (wd1.quantity !== 40) throw new Error("quantity");

// 8. balances
balW = await transactionRepo.getWebsiteAssetBalance(String(website._id), "tether");
console.log("website balance after withdraw 40 (should 60):", balW);
let balWallet = await transactionRepo.getWalletAssetBalance(String(wallet._id), "tether");
console.log("wallet balance after withdraw 40 (should 40):", balWallet);

// 9. idempotency: repeat same request same key (same date!)
const wd1Repeat = await websiteOps.withdrawFromWebsite(
  uid,
  String(website._id),
  {
    walletId: String(wallet._id),
    asset: assetUSDT,
    quantity: 40,
    usdValue: 40,
    date: wdDate,
    description: "F10_withdraw",
    countsTowardGoal: true,
  },
  wdKey
);
console.log("repeat same key", wd1Repeat.id, "same as original?", wd1Repeat.id === wd1.id);

// 10. verify balances unchanged, only one transaction
balW = await transactionRepo.getWebsiteAssetBalance(String(website._id), "tether");
balWallet = await transactionRepo.getWalletAssetBalance(String(wallet._id), "tether");
console.log("balances after repeat (should still 60/40):", balW, balWallet);
const totalWithdrawals = await TransactionModel.countDocuments({
  userId: user._id,
  type: "WEBSITE_WITHDRAWAL",
  description: "F10_withdraw",
});
console.log("total withdrawals with desc F10_withdraw (should 1):", totalWithdrawals);

// 11. same key different payload -> 409
try {
  await websiteOps.withdrawFromWebsite(
    uid,
    String(website._id),
    {
      walletId: String(wallet._id),
      asset: assetUSDT,
      quantity: 50,
      usdValue: 50,
      date: new Date(),
      description: "F10_withdraw diff",
    },
    wdKey
  );
  console.log("FAIL same key diff payload should 409");
} catch (e) {
  console.log("same key diff payload 409 OK", e.code);
}

// 12. insufficient after idempotent? available 60, try 70 -> 422
const newKey = crypto.randomUUID();
try {
  await websiteOps.withdrawFromWebsite(
    uid,
    String(website._id),
    {
      walletId: String(wallet._id),
      asset: assetUSDT,
      quantity: 70,
      usdValue: 70,
      date: new Date(),
      description: "F10_insufficient",
    },
    newKey
  );
  console.log("FAIL insufficient");
} catch (e) {
  console.log("insufficient 422 OK", e.code);
}

// 13. Test missing/invalid idempotency via controller? Direct service requires key, but controller validates. Here we test service with invalid key still passes (service doesn't validate UUID). Controller does. So we test controller validation via direct call?
import * as websiteOpsController from "../src/controllers/website-operations.controller.ts";
console.log(
  "controller idempotency validation tested via HTTP in previous phases; service accepts any string key"
);

// 14. Verify portfolio helper still works (getWalletAssetBalance aggregated)
const allBalances = await transactionRepo.getWalletAssetBalance(String(wallet._id), "tether");
console.log("final wallet balance", allBalances);

// 15. Ensure single transaction truth: check that website and wallet reflect same tx
const tx = await TransactionModel.findById(wd1.id).lean();
console.log("single transaction truth", tx.type, tx.source, tx.destination);

// Cleanup
await TransactionModel.deleteMany({ description: { $regex: /^F10_/ } });
await WalletModel.deleteMany({ name: { $regex: /^F10W/ } });
await WebsiteModel.deleteMany({ name: { $regex: /^F10S/ } });
await UserModel.deleteMany({ clerkId: "clerk_f10_A" });
await IdempotencyKeyModel.deleteMany({ scope: { $in: ["WEBSITE_EARNING", "WEBSITE_WITHDRAWAL"] } });
await mongoose.disconnect();
console.log("done Fase10");
