/**
 * Tipos do domínio Wallet (frontend).
 *
 * Refletem o contrato HTTP real do backend APM SYN (ver `toWalletResponse`
 * em `backend/src/services/wallet.service.ts`), não uma versão inventada.
 *
 * O backend converte o `_id` do MongoDB para `id` antes de expor aWallet,
 * então o frontend nunca precisa conhecer `_id`.
 */

export type WalletType =
  | "exchange"
  | "crypto"
  | "microwallet"
  | "hardware"
  | "banking"
  | "other";

export type WalletStatus = "active" | "inactive" | "archived";

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: WalletType;
  status: WalletStatus;
  color?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const WALLET_TYPES: WalletType[] = [
  "exchange",
  "crypto",
  "microwallet",
  "hardware",
  "banking",
  "other",
];

export const WALLET_STATUSES: WalletStatus[] = [
  "active",
  "inactive",
  "archived",
];

export interface CreateWalletInput {
  name: string;
  type: WalletType;
  color?: string;
  description?: string;
}

export interface UpdateWalletInput {
  name?: string;
  type?: WalletType;
  color?: string;
  description?: string;
}

export interface WalletListParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: WalletStatus;
  type?: WalletType;
}
