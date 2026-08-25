import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { connectTestDb, disconnectTestDb, clearDatabase } from "../../helpers/test-db.js";
import { createTestUser } from "../../factories/user.factory.js";
import { createTestWallet } from "../../factories/wallet.factory.js";
import * as walletOpsService from "../../../src/services/wallet-operations.service.js";
import * as transactionRepository from "../../../src/repositories/transaction.repository.js";
import type { IUser } from "../../../src/models/user.model.js";
import type { IWallet } from "../../../src/models/wallet.model.js";

describe("Wallet Operations — Integration", () => {
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
  const ethAsset = { externalId: "ethereum", symbol: "ETH", name: "Ethereum" };

  describe("Deposit", () => {
    it("should create a WALLET_DEPOSIT transaction", async () => {
      const result = await walletOpsService.depositToWallet(
        String(user._id),
        String(wallet._id),
        {
          asset: btcAsset,
          quantity: 1,
          usdValue: 50000,
          date: new Date(),
        }
      );

      expect(result).toBeDefined();
      expect(result.type).toBe("WALLET_DEPOSIT");
      expect(result.quantity).toBe(1);
      expect(result.usdValue).toBe(50000);
    });

    it("should set source as EXTERNAL and destination as WALLET", async () => {
      const result = await walletOpsService.depositToWallet(
        String(user._id),
        String(wallet._id),
        {
          asset: btcAsset,
          quantity: 2,
          usdValue: 100000,
          date: new Date(),
        }
      );

      expect(result.source).toMatchObject({ type: "EXTERNAL" });
      expect(result.destination).toMatchObject({ type: "WALLET", id: String(wallet._id) });
    });

    it("should create correct derived balance", async () => {
      await walletOpsService.depositToWallet(
        String(user._id),
        String(wallet._id),
        { asset: btcAsset, quantity: 2, usdValue: 100000, date: new Date() }
      );

      const balance = await transactionRepository.getWalletAssetBalance(
        String(wallet._id),
        "bitcoin"
      );
      expect(balance).toBe(2);
    });

    it("should accumulate balance across multiple deposits", async () => {
      await walletOpsService.depositToWallet(
        String(user._id),
        String(wallet._id),
        { asset: btcAsset, quantity: 1, usdValue: 50000, date: new Date() }
      );
      await walletOpsService.depositToWallet(
        String(user._id),
        String(wallet._id),
        { asset: btcAsset, quantity: 2, usdValue: 100000, date: new Date() }
      );

      const balance = await transactionRepository.getWalletAssetBalance(
        String(wallet._id),
        "bitcoin"
      );
      expect(balance).toBe(3);
    });

    it("should handle different assets independently", async () => {
      await walletOpsService.depositToWallet(
        String(user._id),
        String(wallet._id),
        { asset: btcAsset, quantity: 1, usdValue: 50000, date: new Date() }
      );
      await walletOpsService.depositToWallet(
        String(user._id),
        String(wallet._id),
        { asset: ethAsset, quantity: 10, usdValue: 30000, date: new Date() }
      );

      const btcBalance = await transactionRepository.getWalletAssetBalance(
        String(wallet._id),
        "bitcoin"
      );
      const ethBalance = await transactionRepository.getWalletAssetBalance(
        String(wallet._id),
        "ethereum"
      );

      expect(btcBalance).toBe(1);
      expect(ethBalance).toBe(10);
    });

    it("should reject deposit to non-existent wallet", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        walletOpsService.depositToWallet(String(user._id), String(fakeId), {
          asset: btcAsset,
          quantity: 1,
          usdValue: 50000,
          date: new Date(),
        })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("should reject deposit to another user's wallet", async () => {
      const otherUser = await createTestUser();
      await expect(
        walletOpsService.depositToWallet(String(otherUser._id), String(wallet._id), {
          asset: btcAsset,
          quantity: 1,
          usdValue: 50000,
          date: new Date(),
        })
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("should reject deposit to archived wallet", async () => {
      const archivedWallet = await createTestWallet(user._id, { status: "archived" });
      await expect(
        walletOpsService.depositToWallet(String(user._id), String(archivedWallet._id), {
          asset: btcAsset,
          quantity: 1,
          usdValue: 50000,
          date: new Date(),
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("should reject deposit to inactive wallet", async () => {
      const inactiveWallet = await createTestWallet(user._id, { status: "inactive" });
      await expect(
        walletOpsService.depositToWallet(String(user._id), String(inactiveWallet._id), {
          asset: btcAsset,
          quantity: 1,
          usdValue: 50000,
          date: new Date(),
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe("Withdraw", () => {
    beforeEach(async () => {
      await walletOpsService.depositToWallet(
        String(user._id),
        String(wallet._id),
        { asset: btcAsset, quantity: 5, usdValue: 250000, date: new Date() }
      );
    });

    it("should create a WALLET_WITHDRAWAL transaction", async () => {
      const result = await walletOpsService.withdrawFromWallet(
        String(user._id),
        String(wallet._id),
        { asset: btcAsset, quantity: 2, usdValue: 100000, date: new Date() }
      );

      expect(result).toBeDefined();
      expect(result.type).toBe("WALLET_WITHDRAWAL");
      expect(result.quantity).toBe(2);
    });

    it("should set source as WALLET and destination as EXTERNAL", async () => {
      const result = await walletOpsService.withdrawFromWallet(
        String(user._id),
        String(wallet._id),
        { asset: btcAsset, quantity: 1, usdValue: 50000, date: new Date() }
      );

      expect(result.source).toMatchObject({ type: "WALLET", id: String(wallet._id) });
      expect(result.destination).toMatchObject({ type: "EXTERNAL" });
    });

    it("should reduce derived balance correctly", async () => {
      await walletOpsService.withdrawFromWallet(
        String(user._id),
        String(wallet._id),
        { asset: btcAsset, quantity: 2, usdValue: 100000, date: new Date() }
      );

      const balance = await transactionRepository.getWalletAssetBalance(
        String(wallet._id),
        "bitcoin"
      );
      expect(balance).toBe(3);
    });

    it("should reject withdrawal when insufficient balance", async () => {
      await expect(
        walletOpsService.withdrawFromWallet(
          String(user._id),
          String(wallet._id),
          { asset: btcAsset, quantity: 10, usdValue: 500000, date: new Date() }
        )
      ).rejects.toMatchObject({ statusCode: 422 });
    });

    it("should reject withdrawal when asset not in wallet", async () => {
      await expect(
        walletOpsService.withdrawFromWallet(
          String(user._id),
          String(wallet._id),
          { asset: ethAsset, quantity: 1, usdValue: 3000, date: new Date() }
        )
      ).rejects.toMatchObject({ statusCode: 422 });
    });
  });

  describe("Transfer", () => {
    let walletB: IWallet;

    beforeEach(async () => {
      walletB = await createTestWallet(user._id, { name: "Wallet B" });
      await walletOpsService.depositToWallet(
        String(user._id),
        String(wallet._id),
        { asset: btcAsset, quantity: 5, usdValue: 250000, date: new Date() }
      );
    });

    it("should create a WALLET_TRANSFER transaction", async () => {
      const result = await walletOpsService.transferBetweenWallets(
        String(user._id),
        {
          sourceWalletId: String(wallet._id),
          destinationWalletId: String(walletB._id),
          asset: btcAsset,
          quantity: 2,
          usdValue: 100000,
          date: new Date(),
        }
      );

      expect(result).toBeDefined();
      expect(result.type).toBe("WALLET_TRANSFER");
      expect(result.quantity).toBe(2);
    });

    it("should update both wallet balances correctly", async () => {
      await walletOpsService.transferBetweenWallets(
        String(user._id),
        {
          sourceWalletId: String(wallet._id),
          destinationWalletId: String(walletB._id),
          asset: btcAsset,
          quantity: 2,
          usdValue: 100000,
          date: new Date(),
        }
      );

      const sourceBalance = await transactionRepository.getWalletAssetBalance(
        String(wallet._id),
        "bitcoin"
      );
      const destBalance = await transactionRepository.getWalletAssetBalance(
        String(walletB._id),
        "bitcoin"
      );

      expect(sourceBalance).toBe(3);
      expect(destBalance).toBe(2);
    });

    it("should maintain total patrimony after transfer", async () => {
      const totalBefore = await transactionRepository.getWalletAssetBalance(
        String(wallet._id),
        "bitcoin"
      );

      await walletOpsService.transferBetweenWallets(
        String(user._id),
        {
          sourceWalletId: String(wallet._id),
          destinationWalletId: String(walletB._id),
          asset: btcAsset,
          quantity: 2,
          usdValue: 100000,
          date: new Date(),
        }
      );

      const sourceAfter = await transactionRepository.getWalletAssetBalance(
        String(wallet._id),
        "bitcoin"
      );
      const destAfter = await transactionRepository.getWalletAssetBalance(
        String(walletB._id),
        "bitcoin"
      );

      expect(sourceAfter + destAfter).toBe(totalBefore);
    });

    it("should reject transfer to same wallet", async () => {
      await expect(
        walletOpsService.transferBetweenWallets(
          String(user._id),
          {
            sourceWalletId: String(wallet._id),
            destinationWalletId: String(wallet._id),
            asset: btcAsset,
            quantity: 2,
            usdValue: 100000,
            date: new Date(),
          }
        )
      ).rejects.toMatchObject({ statusCode: 422 });
    });

    it("should reject transfer with insufficient balance", async () => {
      await expect(
        walletOpsService.transferBetweenWallets(
          String(user._id),
          {
            sourceWalletId: String(wallet._id),
            destinationWalletId: String(walletB._id),
            asset: btcAsset,
            quantity: 100,
            usdValue: 5000000,
            date: new Date(),
          }
        )
      ).rejects.toMatchObject({ statusCode: 422 });
    });

    it("should reject transfer to another user's wallet", async () => {
      const otherUser = await createTestUser();
      const otherWallet = await createTestWallet(otherUser._id, { name: "Other Wallet" });

      await expect(
        walletOpsService.transferBetweenWallets(
          String(user._id),
          {
            sourceWalletId: String(wallet._id),
            destinationWalletId: String(otherWallet._id),
            asset: btcAsset,
            quantity: 1,
            usdValue: 50000,
            date: new Date(),
          }
        )
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe("Adjust", () => {
    beforeEach(async () => {
      await walletOpsService.depositToWallet(
        String(user._id),
        String(wallet._id),
        { asset: btcAsset, quantity: 5, usdValue: 250000, date: new Date() }
      );
    });

    it("should increase balance with direction=increase", async () => {
      await walletOpsService.adjustWallet(
        String(user._id),
        String(wallet._id),
        {
          asset: btcAsset,
          quantity: 3,
          usdValue: 150000,
          direction: "increase",
          date: new Date(),
        }
      );

      const balance = await transactionRepository.getWalletAssetBalance(
        String(wallet._id),
        "bitcoin"
      );
      expect(balance).toBe(8);
    });

    it("should decrease balance with direction=decrease", async () => {
      await walletOpsService.adjustWallet(
        String(user._id),
        String(wallet._id),
        {
          asset: btcAsset,
          quantity: 2,
          usdValue: 100000,
          direction: "decrease",
          date: new Date(),
        }
      );

      const balance = await transactionRepository.getWalletAssetBalance(
        String(wallet._id),
        "bitcoin"
      );
      expect(balance).toBe(3);
    });

    it("should reject decrease when insufficient balance", async () => {
      await expect(
        walletOpsService.adjustWallet(
          String(user._id),
          String(wallet._id),
          {
            asset: btcAsset,
            quantity: 100,
            usdValue: 5000000,
            direction: "decrease",
            date: new Date(),
          }
        )
      ).rejects.toMatchObject({ statusCode: 422 });
    });
  });
});
