/**
 * Tipos do domínio Website (frontend).
 *
 * Refletem o contrato HTTP real do backend APM SYN (ver `toWebsiteResponse`
 * em `backend/src/services/website.service.ts`), não uma versão inventada.
 *
 * O backend converte o `_id` do MongoDB para `id` antes de expor o Website,
 * então o frontend nunca precisa conhecer `_id`.
 */

export type WebsiteStatus = "active" | "archived";

export interface Website {
  id: string;
  userId: string;
  name: string;
  url?: string;
  description?: string;
  status: WebsiteStatus;
  createdAt: string;
  updatedAt: string;
}

export const WEBSITE_STATUSES: WebsiteStatus[] = ["active", "archived"];

export interface CreateWebsiteInput {
  name: string;
  url?: string;
  description?: string;
  initialBalance?: number;
}

export interface UpdateWebsiteInput {
  name?: string;
  url?: string;
  description?: string;
}

export interface WebsiteListParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: WebsiteStatus;
}
