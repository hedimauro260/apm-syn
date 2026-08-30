import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import * as walletApi from "@/features/wallets/api/wallet-api";
import type {
  CreateWalletInput,
  UpdateWalletInput,
  Wallet,
  WalletListParams,
} from "@/features/wallets/types/wallet.types";

/**
 * Query keys padronizadas para a feature Wallet.
 *
 * `all` (`["wallets"]`) age como prefixo: invalidar com ele atinge tanto a
 * lista quanto os detalhes (TanStack Query faz match por prefixo).
 */
export const walletKeys = {
  all: ["wallets"] as const,
  list: (params?: WalletListParams) => ["wallets", "list", params] as const,
  detail: (walletId: string) => ["wallets", "detail", walletId] as const,
} as const;

/**
 * Resolve o Clerk session token. Lança se não houver sessão ativa — o
 * TanStack Query captura o erro e expõe via `isError`/`error` no hook.
 */
async function getAuthToken(getToken: () => Promise<string | null>): Promise<string> {
  const token = await getToken();
  if (!token) {
    throw new Error("Authentication token not available");
  }
  return token;
}

export function useWalletsQuery(params?: WalletListParams) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: walletKeys.list(params),
    queryFn: () =>
      getAuthToken(getToken).then(token => walletApi.getWallets(token, params)),
  });
}

export function useWalletQuery(walletId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: walletKeys.detail(walletId),
    queryFn: () =>
      getAuthToken(getToken).then(token => walletApi.getWallet(token, walletId)),
    enabled: Boolean(walletId),
  });
}

export function useCreateWalletMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWalletInput) =>
      getAuthToken(getToken).then(token => walletApi.createWallet(token, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useUpdateWalletMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ walletId, data }: { walletId: string; data: UpdateWalletInput }) =>
      getAuthToken(getToken).then(token => walletApi.updateWallet(token, walletId, data)),
    onSuccess: (wallet: Wallet) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.detail(wallet.id) });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useArchiveWalletMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (walletId: string) =>
      getAuthToken(getToken).then(token => walletApi.archiveWallet(token, walletId)),
    onSuccess: (wallet: Wallet) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.detail(wallet.id) });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useActivateWalletMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (walletId: string) =>
      getAuthToken(getToken).then(token => walletApi.activateWallet(token, walletId)),
    onSuccess: (wallet: Wallet) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.detail(wallet.id) });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useDeactivateWalletMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (walletId: string) =>
      getAuthToken(getToken).then(token => walletApi.deactivateWallet(token, walletId)),
    onSuccess: (wallet: Wallet) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.detail(wallet.id) });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useDeleteWalletMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (walletId: string) =>
      getAuthToken(getToken).then(token => walletApi.deleteWallet(token, walletId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}
