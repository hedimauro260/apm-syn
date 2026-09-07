/**
 * Barrel export da feature website-operations.
 *
 * Expõe os mutations hooks prontos para uso nos componentes, sem
 * exigir que importem dos caminhos internos de `api/` ou `types/`.
 *
 *   import { useRecordEarningMutation } from "@/features/website-operations/hooks/use-website-operations";
 */

export {
  useRecordEarningMutation,
  useWithdrawFromWebsiteMutation,
} from "@/features/website-operations/api/website-operations-queries";
