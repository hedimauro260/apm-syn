import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import * as userApi from "@/features/user/api/user-api";
import type { UpdateUserInput, User } from "@/features/user/types/user.types";

export const userKeys = {
  all: ["user"] as const,
  me: ["user", "me"] as const,
} as const;

async function getAuthToken(getToken: () => Promise<string | null>): Promise<string> {
  const token = await getToken();
  if (!token) {
    throw new Error("Authentication token not available");
  }
  return token;
}

export function useUserQuery(enabled = true) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: userKeys.me,
    queryFn: () => getAuthToken(getToken).then(token => userApi.getMe(token)),
    enabled,
  });
}

export function useUpdateUserMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserInput) =>
      getAuthToken(getToken).then(token => userApi.updateMe(token, data)),
    onSuccess: (user: User) => {
      queryClient.setQueryData(userKeys.me, user);
    },
  });
}