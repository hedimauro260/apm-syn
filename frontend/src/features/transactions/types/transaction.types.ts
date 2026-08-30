/**
 * Tipos do domínio Transaction (frontend).
 *
 * Refletem o contrato HTTP real do backend APM SYN
 * (ver `toResponse` em `backend/src/services/transaction.service.ts`).
 */

export type TransactionType =
  | "WALLET_DEPOSIT"
  | "WALLET_WITHDRAWAL"
  | "WALLET_TRANSFER"
  | "WALLET_ADJUSTMENT"
  | "WEBSITE_EARNING"
  | "WEBSITE_WITHDRAWAL";

export type ParticipantType = "WALLET" | "WEBSITE" | "EXTERNAL";

export interface TransactionParticipant {
  type: ParticipantType;
  id?: string;
}

export interface TransactionAsset {
  externalId: string;
  symbol: string;
  name: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  source: TransactionParticipant;
  destination: TransactionParticipant;
  asset: TransactionAsset;
  quantity: number;
  usdValue: number;
  countsTowardGoal: boolean;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionListParams {
  page?: number;
  limit?: number;
  sort?: string;
  type?: TransactionType;
  walletId?: string;
  websiteId?: string;
  asset?: string;
  from?: string;
  to?: string;
  countsTowardGoal?: boolean;
}
