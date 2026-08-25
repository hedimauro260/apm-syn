import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectTestDb, disconnectTestDb, clearDatabase } from "../../helpers/test-db.js";
import { createTestUser } from "../../factories/user.factory.js";
import { createTestWallet } from "../../factories/wallet.factory.js";
import { createTestWebsite } from "../../factories/website.factory.js";
import { createTestTransaction } from "../../factories/transaction.factory.js";
import { createTestGoal } from "../../factories/goal.factory.js";
import * as accountService from "../../../src/modules/account/account.service.js";
import { UserModel } from "../../../src/models/user.model.js";
import { WalletModel } from "../../../src/models/wallet.model.js";
import { WebsiteModel } from "../../../src/models/website.model.js";
import { TransactionModel } from "../../../src/models/transaction.model.js";
import { GoalModel } from "../../../src/models/goal.model.js";
import type { IUser } from "../../../src/models/user.model.js";

describe("Account Service — Integration", () => {
  let userA: IUser;
  let userB: IUser;

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await clearDatabase();
    userA = await createTestUser({ name: "User A" });
    userB = await createTestUser({ name: "User B" });
  });

  describe("Export Backup", () => {
    it("should export user data with correct structure", async () => {
      const wallet = await createTestWallet(userA._id);
      const website = await createTestWebsite(userA._id);
      await createTestTransaction(userA._id, {
        source: { type: "EXTERNAL" },
        destination: { type: "WALLET", id: wallet._id },
      });

      const backup = await accountService.exportBackup(String(userA._id));

      expect(backup).toHaveProperty("version", "1.0");
      expect(backup).toHaveProperty("exportedAt");
      expect(backup).toHaveProperty("application", "APM SYN");
      expect(backup).toHaveProperty("data");
      expect(backup.data).toHaveProperty("user");
      expect(backup.data).toHaveProperty("wallets");
      expect(backup.data).toHaveProperty("websites");
      expect(backup.data).toHaveProperty("transactions");
      expect(backup.data).toHaveProperty("goals");
    });

    it("should include all user's wallets", async () => {
      await createTestWallet(userA._id, { name: "Wallet 1" });
      await createTestWallet(userA._id, { name: "Wallet 2" });

      const backup = await accountService.exportBackup(String(userA._id));
      expect(backup.data.wallets).toHaveLength(2);
    });

    it("should include all user's websites", async () => {
      await createTestWebsite(userA._id, { name: "Site 1" });
      await createTestWebsite(userA._id, { name: "Site 2" });

      const backup = await accountService.exportBackup(String(userA._id));
      expect(backup.data.websites).toHaveLength(2);
    });

    it("should not include other user's data", async () => {
      await createTestWallet(userB._id, { name: "User B Wallet" });
      await createTestWebsite(userB._id, { name: "User B Site" });

      const backup = await accountService.exportBackup(String(userA._id));
      expect(backup.data.wallets).toHaveLength(0);
      expect(backup.data.websites).toHaveLength(0);
    });

    it("should throw for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(accountService.exportBackup(String(fakeId))).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("Delete Account Data", () => {
    it("should delete all user A data", async () => {
      const wallet = await createTestWallet(userA._id);
      const website = await createTestWebsite(userA._id);
      await createTestTransaction(userA._id, {
        source: { type: "EXTERNAL" },
        destination: { type: "WALLET", id: wallet._id },
      });
      await createTestGoal(userA._id, [wallet._id]);

      await accountService.deleteAccountData(String(userA._id));

      const user = await UserModel.findById(userA._id).exec();
      const wallets = await WalletModel.find({ userId: userA._id }).exec();
      const websites = await WebsiteModel.find({ userId: userA._id }).exec();
      const transactions = await TransactionModel.find({ userId: userA._id }).exec();
      const goals = await GoalModel.find({ userId: userA._id }).exec();

      expect(user).toBeNull();
      expect(wallets).toHaveLength(0);
      expect(websites).toHaveLength(0);
      expect(transactions).toHaveLength(0);
      expect(goals).toHaveLength(0);
    });

    it("should not delete other user's data", async () => {
      const walletA = await createTestWallet(userA._id, { name: "A Wallet" });
      const walletB = await createTestWallet(userB._id, { name: "B Wallet" });

      await accountService.deleteAccountData(String(userA._id));

      const userBExists = await UserModel.findById(userB._id).exec();
      const walletBExists = await WalletModel.findById(walletB._id).exec();

      expect(userBExists).not.toBeNull();
      expect(walletBExists).not.toBeNull();
      expect(String(walletBExists!.userId)).toBe(String(userB._id));
    });

    it("should use transaction (atomicity)", async () => {
      const wallet = await createTestWallet(userA._id);
      await createTestTransaction(userA._id, {
        source: { type: "EXTERNAL" },
        destination: { type: "WALLET", id: wallet._id },
      });

      await accountService.deleteAccountData(String(userA._id));

      const transactions = await TransactionModel.find({ userId: userA._id }).exec();
      const wallets = await WalletModel.find({ userId: userA._id }).exec();

      expect(transactions).toHaveLength(0);
      expect(wallets).toHaveLength(0);
    });

    it("should throw for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(accountService.deleteAccountData(String(fakeId))).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
