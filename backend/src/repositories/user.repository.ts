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

export async function updateByClerkId(
  clerkId: string,
  data: { name?: string }
): Promise<IUser | null> {
  return UserModel.findOneAndUpdate({ clerkId }, { $set: data }, { new: true }).exec();
}

export async function deleteByClerkId(clerkId: string): Promise<{ deletedCount: number }> {
  const result = await UserModel.deleteOne({ clerkId }).exec();
  return { deletedCount: result.deletedCount };
}
