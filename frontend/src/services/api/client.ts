import { env } from "@/config/env";
import { ApiError } from "@/services/api/errors";
import type { ApiErrorResponse } from "@/services/api/types";

type ApiRequestOptions = RequestInit & {
  token?: string | null;
};

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, headers, ...init } = options;

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json();

  if (!response.ok) {
    const errorBody = body as ApiErrorResponse;
    throw new ApiError(response.status, errorBody.error);
  }

  return body as T;
}
