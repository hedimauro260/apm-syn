import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/services/api/types";
import type { UpdateUserInput, User } from "@/features/user/types/user.types";

const USER_BASE = "/users";

export async function getMe(token: string): Promise<User> {
  const response = await apiClient<ApiResponse<User>>(`${USER_BASE}/me`, { token });
  return response.data;
}

export async function updateMe(token: string, body: UpdateUserInput): Promise<User> {
  const response = await apiClient<ApiResponse<User>>(`${USER_BASE}/me`, {
    token,
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return response.data;
}