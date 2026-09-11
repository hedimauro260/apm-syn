import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { connectTestDb, disconnectTestDb, clearDatabase } from "../../helpers/test-db.js";
import { createTestUser } from "../../factories/user.factory.js";
import * as userService from "../../../src/services/user.service.js";
import type { IUser } from "../../../src/models/user.model.js";

describe("User Service — Onboarding", () => {
  let user: IUser;

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await clearDatabase();
    user = await createTestUser();
  });

  describe("updateMe — onboarding", () => {
    it("should set onboarding.completed to true", async () => {
      const updated = await userService.updateMe(String(user.clerkId), {
        onboarding: { completed: true },
      });

      expect(updated.onboarding).toBeDefined();
      expect(updated.onboarding!.completed).toBe(true);
      expect(updated.onboarding!.skipped).toBe(false);
    });

    it("should set onboarding.skipped to true", async () => {
      const updated = await userService.updateMe(String(user.clerkId), {
        onboarding: { skipped: true },
      });

      expect(updated.onboarding!.skipped).toBe(true);
      expect(updated.onboarding!.completed).toBe(false);
    });

    it("should update completed without wiping skipped", async () => {
      await userService.updateMe(String(user.clerkId), {
        onboarding: { skipped: true },
      });

      const updated = await userService.updateMe(String(user.clerkId), {
        onboarding: { completed: true },
      });

      expect(updated.onboarding!.completed).toBe(true);
      expect(updated.onboarding!.skipped).toBe(true);
    });

    it("should update skipped without wiping completed", async () => {
      await userService.updateMe(String(user.clerkId), {
        onboarding: { completed: true },
      });

      const updated = await userService.updateMe(String(user.clerkId), {
        onboarding: { skipped: true },
      });

      expect(updated.onboarding!.skipped).toBe(true);
      expect(updated.onboarding!.completed).toBe(true);
    });

    it("should throw for non-existent user", async () => {
      await expect(
        userService.updateMe("nonexistent-clerk-id", {
          onboarding: { completed: true },
        })
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe("toUserResponse — onboarding", () => {
    it("should default onboarding to completed:false, skipped:false for new users", async () => {
      const response = userService.toUserResponse(user);

      expect(response.onboarding).toEqual({
        completed: false,
        skipped: false,
      });
    });

    it("should reflect persisted onboarding state", async () => {
      await userService.updateMe(String(user.clerkId), {
        onboarding: { completed: true, skipped: true },
      });

      const fresh = await (await import("../../../src/repositories/user.repository.js")).findByClerkId(
        String(user.clerkId)
      );
      expect(fresh).not.toBeNull();

      const response = userService.toUserResponse(fresh!);
      expect(response.onboarding).toEqual({
        completed: true,
        skipped: true,
      });
    });
  });
});
