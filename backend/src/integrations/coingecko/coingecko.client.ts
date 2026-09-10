import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

function getApiKey(): string {
  const key = env.COINGECKO_API_KEY;
  if (!key) {
    logger.warn("COINGECKO_API_KEY not configured in environment");
  }
  return key || "";
}

function isDemoKey(key: string): boolean {
  return key.startsWith("CG-");
}

function getBaseUrl(key: string): string {
  return isDemoKey(key)
    ? "https://api.coingecko.com/api/v3"
    : "https://pro-api.coingecko.com/api/v3";
}

function getApiKeyHeader(key: string): string {
  return isDemoKey(key) ? "x-cg-demo-api-key" : "x-cg-pro-api-key";
}

function buildUrl(key: string, endpoint: string, params: Record<string, string> = {}): string {
  const url = new URL(`${getBaseUrl(key)}${endpoint}`);
  if (Object.keys(params).length > 0) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  }
  return url.toString();
}

export class CoinGeckoClientError extends Error {
  public readonly statusCode?: number;
  public readonly isRetryable: boolean;

  constructor(message: string, statusCode?: number, isRetryable = false) {
    super(message);
    this.name = "CoinGeckoClientError";
    this.statusCode = statusCode;
    this.isRetryable = isRetryable;
    Object.setPrototypeOf(this, CoinGeckoClientError.prototype);
  }
}

export async function coinGeckoGet<T>(
  endpoint: string,
  params: Record<string, string> = {},
  options: { timeoutMs?: number; retries?: number; retryDelayMs?: number } = {}
): Promise<T> {
  const { timeoutMs = 10000, retries = 2, retryDelayMs = 1000 } = options;
  const key = getApiKey();
  const url = buildUrl(key, endpoint, params);
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "apm-syn-backend",
          [getApiKeyHeader(key)]: key,
        },
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        const waitTime = (attempt + 1) * retryDelayMs;
        logger.warn({ url, waitTime, attempt }, "Rate limited by CoinGecko");
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw new CoinGeckoClientError(
          `CoinGecko rate limit exceeded after ${attempt + 1} attempts`,
          429,
          false
        );
      }

      if (!response.ok) {
        const errorBody = await response.text();
        const isRetryable = response.status >= 500;
        const message = `CoinGecko API error ${response.status}: ${response.statusText} - ${errorBody}`;
        if (isRetryable && attempt < retries) {
          logger.warn({ url, status: response.status, attempt }, "CoinGecko 5xx, retrying...");
          await new Promise(resolve => setTimeout(resolve, retryDelayMs));
          continue;
        }
        throw new CoinGeckoClientError(message, response.status, isRetryable);
      }

      return (await response.json()) as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (lastError instanceof CoinGeckoClientError) {
        if (!lastError.isRetryable || attempt >= retries) {
          throw lastError;
        }
      } else if (attempt >= retries) {
        throw new CoinGeckoClientError(
          lastError.message || "Unknown CoinGecko error",
          lastError instanceof Error ? undefined : undefined
        );
      }
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }

  throw lastError ?? new CoinGeckoClientError("CoinGecko request failed after retries");
}
