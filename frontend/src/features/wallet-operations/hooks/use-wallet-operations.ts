/**
 * Barrel export da feature wallet-operations.
 *
 * Expõe os mutations hooks prontos para uso nos componentes (6B+), sem
 * exigir que importem dos caminhos internos de `api/` ou `types/`.
 *
 *   import { useDepositMutation } from "@/features/wallet-operations/hooks/use-wallet-operations";
 */

export {
  useDepositMutation,
  useWithdrawMutation,
  useTransferMutation,
  useAdjustMutation,
} from "@/features/wallet-operations/api/wallet-operations-queries";
