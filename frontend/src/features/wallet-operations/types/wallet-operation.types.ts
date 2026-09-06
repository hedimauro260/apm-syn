/**
 * Tipos das operações financeiras sobre Wallets (frontend).
 *
 * Refletem EXATAMENTE o contrato HTTP do backend APM SYN
 * (ver `backend/src/schemas/wallet-operations.schema.ts`).
 *
 * Cada tipo representa o que a API layer envia: path params + body JSON.
 * A API layer é responsável por separar walletId do body ao montar a request.
 */

export interface AssetInput {
  externalId: string;
  symbol: string;
  name: string;
}

export interface DepositWalletInput {
  walletId: string;
  asset: AssetInput;
  quantity: number;
  usdValue: number;
  date?: string;
  countsTowardGoal?: boolean;
  description?: string;
}

export interface WithdrawWalletInput {
  walletId: string;
  asset: AssetInput;
  quantity: number;
  usdValue: number;
  date?: string;
  description?: string;
}

export interface AdjustWalletInput {
  walletId: string;
  asset: AssetInput;
  quantity: number;
  usdValue: number;
  direction: "increase" | "decrease";
  date?: string;
  countsTowardGoal?: boolean;
  description?: string;
}

export interface TransferWalletInput {
  sourceWalletId: string;
  destinationWalletId: string;
  asset: AssetInput;
  quantity: number;
  usdValue: number;
  date?: string;
  description?: string;
}
