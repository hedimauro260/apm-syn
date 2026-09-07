import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import * as websiteApi from "@/features/websites/api/website-api";
import { transactionKeys } from "@/features/transactions/api/transaction-queries";
import type {
  CreateWebsiteInput,
  UpdateWebsiteInput,
  Website,
  WebsiteListParams,
} from "@/features/websites/types/website.types";

/**
 * Query keys padronizadas para a feature Website.
 *
 * `all` (`["websites"]`) age como prefixo: invalidar com ele atinge tanto a
 * lista quanto os detalhes (TanStack Query faz match por prefixo).
 */
export const websiteKeys = {
  all: ["websites"] as const,
  list: (params?: WebsiteListParams) => ["websites", "list", params] as const,
  detail: (websiteId: string) => ["websites", "detail", websiteId] as const,
} as const;

/**
 * Resolve o Clerk session token. Lança se não houver sessão ativa — o
 * TanStack Query captura o erro e expõe via `isError`/`error` no hook.
 */
async function getAuthToken(
  getToken: () => Promise<string | null>,
): Promise<string> {
  const token = await getToken();
  if (!token) {
    throw new Error("Authentication token not available");
  }
  return token;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useWebsitesQuery(params?: WebsiteListParams) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: websiteKeys.list(params),
    queryFn: () =>
      getAuthToken(getToken).then((token) =>
        websiteApi.getWebsites(token, params),
      ),
  });
}

export function useWebsiteQuery(websiteId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: websiteKeys.detail(websiteId),
    queryFn: () =>
      getAuthToken(getToken).then((token) =>
        websiteApi.getWebsite(token, websiteId),
      ),
    enabled: Boolean(websiteId),
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateWebsiteMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWebsiteInput) =>
      getAuthToken(getToken).then((token) =>
        websiteApi.createWebsite(token, data),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websiteKeys.all });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

export function useUpdateWebsiteMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      websiteId,
      data,
    }: {
      websiteId: string;
      data: UpdateWebsiteInput;
    }) =>
      getAuthToken(getToken).then((token) =>
        websiteApi.updateWebsite(token, websiteId, data),
      ),
    onSuccess: (website: Website) => {
      queryClient.invalidateQueries({
        queryKey: websiteKeys.detail(website.id),
      });
      queryClient.invalidateQueries({ queryKey: websiteKeys.all });
    },
  });
}

export function useArchiveWebsiteMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (websiteId: string) =>
      getAuthToken(getToken).then((token) =>
        websiteApi.archiveWebsite(token, websiteId),
      ),
    onSuccess: (website: Website) => {
      queryClient.invalidateQueries({
        queryKey: websiteKeys.detail(website.id),
      });
      queryClient.invalidateQueries({ queryKey: websiteKeys.all });
    },
  });
}

export function useDeleteWebsiteMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (websiteId: string) =>
      getAuthToken(getToken).then((token) =>
        websiteApi.deleteWebsite(token, websiteId),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websiteKeys.all });
    },
  });
}
