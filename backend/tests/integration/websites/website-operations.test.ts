import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectTestDb, disconnectTestDb, clearDatabase } from "../../helpers/test-db.js";
import { createTestUser } from "../../factories/user.factory.js";
import { createTestWallet } from "../../factories/wallet.factory.js";
import { createTestWebsite } from "../../factories/website.factory.js";
import * as websiteOpsService from "../../../src/services/website-operations.service.js";
import * as transactionRepository from "../../../src/repositories/transaction.repository.js";
import { WebsiteAssetBalanceModel } from "../../../src/models/website-asset-balance.model.js";
import type { IUser } from "../../../src/models/user.model.js";
import type { IWallet } from "../../../src/models/wallet.model.js";
import type { IWebsite } from "../../../src/models/website.model.js";

describe("Website Operations — Integration", () => {
  let user: IUser;
  let wallet: IWallet;
  let website: IWebsite;

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await clearDatabase();
    user = await createTestUser();
    wallet = await createTestWallet(user._id);
    website = await createTestWebsite(user._id);
  });

  const btcAsset = { externalId: "bitcoin", symbol: "BTC", name: "Bitcoin" };

  describe("Earning", () => {
    it("should create a WEBSITE_EARNING transaction", async () => {
      const key = new mongoose.Types.ObjectId().toString();
      const result = await websiteOpsService.recordEarning(
        String(user._id),
        String(website._id),
        { asset: btcAsset, quantity: 10, usdValue: 500000, date: new Date() },
        key
      );

      expect(result).toBeDefined();
      expect(result.type).toBe("WEBSITE_EARNING");
      expect(result.quantity).toBe(10);
    });

    it("should increase website balance", async () => {
      const key = new mongoose.Types.ObjectId().toString();
      await websiteOpsService.recordEarning(
        String(user._id),
        String(website._id),
        { asset: btcAsset, quantity: 10, usdValue: 500000, date: new Date() },
        key
      );

      const balance = await WebsiteAssetBalanceModel.findOne({
        websiteId: website._id,
        assetExternalId: "bitcoin",
      }).exec();

      expect(balance).not.toBeNull();
      expect(balance!.balance).toBe(10);
    });

    it("should not affect wallet balance", async () => {
      const key = new mongoose.Types.ObjectId().toString();
      await websiteOpsService.recordEarning(
        String(user._id),
        String(website._id),
        { asset: btcAsset, quantity: 10, usdValue: 500000, date: new Date() },
        key
      );

      const walletBalance = await transactionRepository.getWalletAssetBalance(
        String(wallet._id),
        "bitcoin"
      );
      expect(walletBalance).toBe(0);
    });

    it("should reject earning on archived website", async () => {
      const archivedWebsite = await createTestWebsite(user._id, { status: "archived" });
      const key = new mongoose.Types.ObjectId().toString();
      await expect(
        websiteOpsService.recordEarning(
          String(user._id),
          String(archivedWebsite._id),
          { asset: btcAsset, quantity: 10, usdValue: 500000, date: new Date() },
          key
        )
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("should reject earning on another user's website", async () => {
      const otherUser = await createTestUser();
      const otherWebsite = await createTestWebsite(otherUser._id);
      const key = new mongoose.Types.ObjectId().toString();
      await expect(
        websiteOpsService.recordEarning(
          String(user._id),
          String(otherWebsite._id),
          { asset: btcAsset, quantity: 10, usdValue: 500000, date: new Date() },
          key
        )
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe("Withdrawal", () => {
    beforeEach(async () => {
      const key = new mongoose.Types.ObjectId().toString();
      await websiteOpsService.recordEarning(
        String(user._id),
        String(website._id),
        { asset: btcAsset, quantity: 10, usdValue: 500000, date: new Date() },
        key
      );
    });

    it("should create a WEBSITE_WITHDRAWAL transaction", async () => {
      const key = new mongoose.Types.ObjectId().toString();
      const result = await websiteOpsService.withdrawFromWebsite(
        String(user._id),
        String(website._id),
        {
          walletId: String(wallet._id),
          asset: btcAsset,
          quantity: 3,
          usdValue: 150000,
          date: new Date(),
        },
        key
      );

      expect(result).toBeDefined();
      expect(result.type).toBe("WEBSITE_WITHDRAWAL");
      expect(result.quantity).toBe(3);
    });

    it("should reduce website balance in USD", async () => {
      const key = new mongoose.Types.ObjectId().toString();
      await websiteOpsService.withdrawFromWebsite(
        String(user._id),
        String(website._id),
        {
          walletId: String(wallet._id),
          asset: btcAsset,
          quantity: 3,
          usdValue: 150000,
          date: new Date(),
        },
        key
      );

      const balance = await WebsiteAssetBalanceModel.findOne({
        websiteId: website._id,
        assetExternalId: "usd",
      }).exec();

      expect(balance!.balance).toBe(350000);
    });

    it("should allow withdrawal when USD balance covers the amount", async () => {
      const key = new mongoose.Types.ObjectId().toString();
      await websiteOpsService.withdrawFromWebsite(
        String(user._id),
        String(website._id),
        {
          walletId: String(wallet._id),
          asset: btcAsset,
          quantity: 1,
          usdValue: 100000,
          date: new Date(),
        },
        key
      );

      const balance = await WebsiteAssetBalanceModel.findOne({
        websiteId: website._id,
        assetExternalId: "usd",
      }).exec();

      expect(balance!.balance).toBe(400000);
    });

    it("should increase wallet balance", async () => {
      const key = new mongoose.Types.ObjectId().toString();
      await websiteOpsService.withdrawFromWebsite(
        String(user._id),
        String(website._id),
        {
          walletId: String(wallet._id),
          asset: btcAsset,
          quantity: 3,
          usdValue: 150000,
          date: new Date(),
        },
        key
      );

      const walletBalance = await transactionRepository.getWalletAssetBalance(
        String(wallet._id),
        "bitcoin"
      );
      expect(walletBalance).toBe(3);
    });

    it("should reject withdrawal when USD exceeds website balance", async () => {
      const key = new mongoose.Types.ObjectId().toString();
      await expect(
        websiteOpsService.withdrawFromWebsite(
          String(user._id),
          String(website._id),
          {
            walletId: String(wallet._id),
            asset: btcAsset,
            quantity: 1,
            usdValue: 600000,
            date: new Date(),
          },
          key
        )
      ).rejects.toMatchObject({ statusCode: 422 });
    });

    it("should reject withdrawal to another user's wallet", async () => {
      const otherUser = await createTestUser();
      const otherWallet = await createTestWallet(otherUser._id);
      const key = new mongoose.Types.ObjectId().toString();
      await expect(
        websiteOpsService.withdrawFromWebsite(
          String(user._id),
          String(website._id),
          {
            walletId: String(otherWallet._id),
            asset: btcAsset,
            quantity: 1,
            usdValue: 50000,
            date: new Date(),
          },
          key
        )
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("should reject withdrawal to archived wallet", async () => {
      const archivedWallet = await createTestWallet(user._id, { status: "archived" });
      const key = new mongoose.Types.ObjectId().toString();
      await expect(
        websiteOpsService.withdrawFromWebsite(
          String(user._id),
          String(website._id),
          {
            walletId: String(archivedWallet._id),
            asset: btcAsset,
            quantity: 1,
            usdValue: 50000,
            date: new Date(),
          },
          key
        )
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe("Idempotency", () => {
    it("should return same result when same key+payload is used", async () => {
      const key = new mongoose.Types.ObjectId().toString();
      const data = { asset: btcAsset, quantity: 5, usdValue: 250000, date: new Date() };

      const first = await websiteOpsService.recordEarning(
        String(user._id),
        String(website._id),
        data,
        key
      );
      const second = await websiteOpsService.recordEarning(
        String(user._id),
        String(website._id),
        data,
        key
      );

      expect(first.id).toBe(second.id);
    });

    it("should return 409 when same key but different payload", async () => {
      const key = new mongoose.Types.ObjectId().toString();
      const data1 = { asset: btcAsset, quantity: 5, usdValue: 250000, date: new Date() };
      const data2 = { asset: btcAsset, quantity: 10, usdValue: 500000, date: new Date() };

      await websiteOpsService.recordEarning(
        String(user._id),
        String(website._id),
        data1,
        key
      );

      await expect(
        websiteOpsService.recordEarning(
          String(user._id),
          String(website._id),
          data2,
          key
        )
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("should not duplicate transactions on idempotent repeat", async () => {
      const key = new mongoose.Types.ObjectId().toString();
      const data = { asset: btcAsset, quantity: 5, usdValue: 250000, date: new Date() };

      await websiteOpsService.recordEarning(
        String(user._id),
        String(website._id),
        data,
        key
      );
      await websiteOpsService.recordEarning(
        String(user._id),
        String(website._id),
        data,
        key
      );

      const balance = await WebsiteAssetBalanceModel.findOne({
        websiteId: website._id,
        assetExternalId: "bitcoin",
      }).exec();

      expect(balance!.balance).toBe(5);
    });
  });
});
