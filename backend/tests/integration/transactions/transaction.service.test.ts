import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectTestDb, disconnectTestDb, clearDatabase } from "../../helpers/test-db.js";
import { createTestUser } from "../../factories/user.factory.js";
import { createTestWallet } from "../../factories/wallet.factory.js";
import * as transactionService from "../../../src/services/transaction.service.js";
import type { IUser } from "../../../src/models/user.model.js";
import type { IWallet } from "../../../src/models/wallet.model.js";

describe("Transaction Service — Integration", () => {
  let user: IUser;
  let wallet: IWallet;

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
  });

  const btcAsset = { externalId: "bitcoin", symbol: "BTC", name: "Bitcoin" };

  describe("createTransaction", () => {
    it("should create a transaction with valid data", async () => {
      const result = await transactionService.createTransaction(String(user._id), {
        type: "WALLET_DEPOSIT",
        source: { type: "EXTERNAL" },
        destination: { type: "WALLET", id: String(wallet._id) },
        asset: btcAsset,
        quantity: 1,
        usdValue: 50000,
        date: new Date(),
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.type).toBe("WALLET_DEPOSIT");
    });

    it("should reject transaction with invalid wallet", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        transactionService.createTransaction(String(user._id), {
          type: "WALLET_DEPOSIT",
          source: { type: "EXTERNAL" },
          destination: { type: "WALLET", id: String(fakeId) },
          asset: btcAsset,
          quantity: 1,
          usdValue: 50000,
          date: new Date(),
        })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("should reject transaction using another user's wallet", async () => {
      const otherUser = await createTestUser();
      const otherWallet = await createTestWallet(otherUser._id);

      await expect(
        transactionService.createTransaction(String(user._id), {
          type: "WALLET_DEPOSIT",
          source: { type: "EXTERNAL" },
          destination: { type: "WALLET", id: String(otherWallet._id) },
          asset: btcAsset,
          quantity: 1,
          usdValue: 50000,
          date: new Date(),
        })
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe("getTransaction", () => {
    it("should retrieve a created transaction", async () => {
      const created = await transactionService.createTransaction(String(user._id), {
        type: "WALLET_DEPOSIT",
        source: { type: "EXTERNAL" },
        destination: { type: "WALLET", id: String(wallet._id) },
        asset: btcAsset,
        quantity: 1,
        usdValue: 50000,
        date: new Date(),
      });

      const fetched = await transactionService.getTransaction(String(user._id), created.id as string);
      expect(fetched).toBeDefined();
      expect(fetched.id).toBe(created.id);
    });

    it("should reject access to another user's transaction", async () => {
      const otherUser = await createTestUser();
      const otherWallet = await createTestWallet(otherUser._id);

      const created = await transactionService.createTransaction(String(otherUser._id), {
        type: "WALLET_DEPOSIT",
        source: { type: "EXTERNAL" },
        destination: { type: "WALLET", id: String(otherWallet._id) },
        asset: btcAsset,
        quantity: 1,
        usdValue: 50000,
        date: new Date(),
      });

      await expect(
        transactionService.getTransaction(String(user._id), created.id as string)
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe("updateTransaction", () => {
    it("should update allowed fields", async () => {
      const created = await transactionService.createTransaction(String(user._id), {
        type: "WALLET_DEPOSIT",
        source: { type: "EXTERNAL" },
        destination: { type: "WALLET", id: String(wallet._id) },
        asset: btcAsset,
        quantity: 1,
        usdValue: 50000,
        date: new Date(),
        description: "original",
      });

      const updated = await transactionService.updateTransaction(
        String(user._id),
        created.id as string,
        { description: "updated" }
      );

      expect(updated.description).toBe("updated");
    });

    it("should reject access to another user's transaction", async () => {
      const otherUser = await createTestUser();
      const otherWallet = await createTestWallet(otherUser._id);

      const created = await transactionService.createTransaction(String(otherUser._id), {
        type: "WALLET_DEPOSIT",
        source: { type: "EXTERNAL" },
        destination: { type: "WALLET", id: String(otherWallet._id) },
        asset: btcAsset,
        quantity: 1,
        usdValue: 50000,
        date: new Date(),
      });

      await expect(
        transactionService.updateTransaction(String(user._id), created.id as string, {
          description: "hacked",
        })
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe("deleteTransaction", () => {
    it("should delete a transaction", async () => {
      const created = await transactionService.createTransaction(String(user._id), {
        type: "WALLET_DEPOSIT",
        source: { type: "EXTERNAL" },
        destination: { type: "WALLET", id: String(wallet._id) },
        asset: btcAsset,
        quantity: 1,
        usdValue: 50000,
        date: new Date(),
      });

      await transactionService.deleteTransaction(String(user._id), created.id as string);

      await expect(
        transactionService.getTransaction(String(user._id), created.id as string)
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
