import { UserModel, type IUser } from "../models/user.model.js";

export async function findByClerkId(clerkId: string): Promise<IUser | null> {
  return UserModel.findOne({ clerkId }).exec();
}

export async function findById(id: string): Promise<IUser | null> {
  return UserModel.findById(id).exec();
}

export async function createUser(data: {
  clerkId: string;
  email?: string;
  name?: string;
  imageUrl?: string;
}): Promise<IUser> {
  const user = new UserModel(data);
  return user.save();
}

export type UpdateUserData = {
  name?: string;
  onboarding?: {
    completed?: boolean;
    skipped?: boolean;
  };
};

export async function updateByClerkId(
  clerkId: string,
  data: UpdateUserData
): Promise<IUser | null> {
  const $set: Record<string, unknown> = {};

  if (data.name !== undefined) {
    $set.name = data.name;
  }
  if (data.onboarding?.completed !== undefined) {
    $set["onboarding.completed"] = data.onboarding.completed;
  }
  if (data.onboarding?.skipped !== undefined) {
    $set["onboarding.skipped"] = data.onboarding.skipped;
  }

  if (Object.keys($set).length === 0) {
    return UserModel.findOne({ clerkId }).exec();
  }

  return UserModel.findOneAndUpdate({ clerkId }, { $set }, { new: true }).exec();
}

export async function deleteByClerkId(clerkId: string): Promise<{ deletedCount: number }> {
  const result = await UserModel.deleteOne({ clerkId }).exec();
  return { deletedCount: result.deletedCount };
}
