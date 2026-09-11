import { AppError } from "../utils/app-error.js";
import * as userRepository from "../repositories/user.repository.js";
import type { IUser } from "../models/user.model.js";

export type SyncUserData = {
  email?: string;
  name?: string;
  imageUrl?: string;
};

export async function syncUser(clerkId: string, data?: SyncUserData): Promise<IUser> {
  const existing = await userRepository.findByClerkId(clerkId);
  if (existing) {
    // Optional: update if clerk data changed (non-destructive)
    const needsUpdate =
      (data?.email && data.email !== existing.email) ||
      (data?.name && data.name !== existing.name) ||
      (data?.imageUrl && data.imageUrl !== existing.imageUrl);

    if (needsUpdate && data) {
      const updated = await userRepository.updateByClerkId(clerkId, {
        ...(data.name ? { name: data.name } : {}),
        // email/imageUrl updates are optional; we keep name as editable via PATCH
      });
      return updated ?? existing;
    }
    return existing;
  }

  return userRepository.createUser({
    clerkId,
    email: data?.email,
    name: data?.name,
    imageUrl: data?.imageUrl,
  });
}

export async function getMe(clerkId: string): Promise<IUser> {
  const user = await userRepository.findByClerkId(clerkId);
  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }
  return user;
}

export async function updateMe(
  clerkId: string,
  data: {
    name?: string;
    onboarding?: { completed?: boolean; skipped?: boolean };
  }
): Promise<IUser> {
  const user = await userRepository.findByClerkId(clerkId);
  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  const updated = await userRepository.updateByClerkId(clerkId, data);
  if (!updated) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }
  return updated;
}

export async function deleteMe(clerkId: string): Promise<void> {
  const user = await userRepository.findByClerkId(clerkId);
  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  // Fase 14: This is a legacy function. Use accountService.deleteAccountData() for full cascade deletion.
  // This function only deletes the User document without cascade. It is kept for backward compatibility.
  await userRepository.deleteByClerkId(clerkId);
}

export function toUserResponse(user: IUser): {
  id: string;
  clerkId: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
  onboarding: {
    completed: boolean;
    skipped: boolean;
  };
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: String(user._id),
    clerkId: user.clerkId,
    email: user.email ?? null,
    name: user.name ?? null,
    imageUrl: user.imageUrl ?? null,
    onboarding: {
      completed: user.onboarding?.completed ?? false,
      skipped: user.onboarding?.skipped ?? false,
    },
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
