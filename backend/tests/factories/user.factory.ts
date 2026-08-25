import mongoose from "mongoose";
import { randomUUID } from "crypto";
import { UserModel } from "../../src/models/user.model.js";
import type { IUser } from "../../src/models/user.model.js";

let counter = 0;

export async function createTestUser(overrides: Partial<{ clerkId: string; email: string; name: string }> = {}): Promise<IUser> {
  counter++;
  const uid = randomUUID();
  const defaults = {
    clerkId: overrides.clerkId || `clerk_test_${uid}`,
    email: overrides.email || `test_${uid}@example.com`,
    name: overrides.name || `Test User ${counter}`,
  };

  const user = new UserModel(defaults);
  await user.save();
  return user;
}

export function createTestUserId(): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId();
}
