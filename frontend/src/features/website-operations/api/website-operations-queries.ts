import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import * as websiteOperationsApi from "@/features/website-operations/api/website-operations-api";
import type {
  RecordEarningInput,
  WithdrawFromWebsiteInput,
} from "@/features/website-operations/types/website-operation.types";
import { websiteKeys } from "@/features/websites/api/website-queries";
import { walletKeys } from "@/features/wallets/api/wallet-queries";
import { transactionKeys } from "@/features/transactions/api/transaction-queries";

/**
 * Query keys da feature Website Operations.
 *
 * As operações não possuem queries próprias (são mutations puras). A chave
 * `all` existe apenas para manter consistência com as demais features.
 */
export const websiteOperationKeys = {
  all: ["website-operations"] as const,
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
// Record Earning
// ---------------------------------------------------------------------------

export function useRecordEarningMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecordEarningInput) =>
      getAuthToken(getToken).then((token) =>
        websiteOperationsApi.recordEarning(token, input),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websiteKeys.all });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Withdraw from Website
// ---------------------------------------------------------------------------

export function useWithdrawFromWebsiteMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WithdrawFromWebsiteInput) =>
      getAuthToken(getToken).then((token) =>
        websiteOperationsApi.withdrawFromWebsite(token, input),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websiteKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}
