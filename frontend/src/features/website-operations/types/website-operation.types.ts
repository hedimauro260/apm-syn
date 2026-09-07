/**
 * Tipos das operações financeiras sobre Websites (frontend).
 *
 * Refletem EXATAMENTE o contrato HTTP do backend APM SYN
 * (ver `backend/src/schemas/website-operations.schema.ts`).
 *
 * Cada tipo representa o que a API layer envia: path params + body JSON.
 * A API layer é responsável por separar websiteId do body ao montar a request.
 */

export interface AssetInput {
  externalId: string;
  symbol: string;
  name: string;
}

export interface RecordEarningInput {
  websiteId: string;
  asset: AssetInput;
  quantity: number;
  usdValue: number;
  date?: string;
  description?: string;
}

export interface WithdrawFromWebsiteInput {
  websiteId: string;
  walletId: string;
  asset: AssetInput;
  quantity: number;
  usdValue: number;
  date?: string;
  countsTowardGoal?: boolean;
  description?: string;
}
