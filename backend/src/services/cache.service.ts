const MAX_ENTRIES = 10_000;

class CacheEntry<T> {
  value: T;
  expiresAt: Date;

  constructor(value: T, ttlMs: number) {
    this.value = value;
    this.expiresAt = new Date(Date.now() + ttlMs);
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}

type CacheKey = string;

const TTL_MS = {
  ASSET: 24 * 60 * 60 * 1000,
  SEARCH: 5 * 60 * 1000,
  PRICE: 60 * 1000,
} as const;

class InMemoryCache {
  private cache = new Map<CacheKey, CacheEntry<unknown>>();
  private hits = 0;
  private misses = 0;

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    if (entry.isExpired()) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    this.hits++;
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number = TTL_MS.ASSET): void {
    if (this.cache.size >= MAX_ENTRIES) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, new CacheEntry(value, ttlMs));
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (entry.isExpired()) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats(): { size: number; keys: string[]; hits: number; misses: number; hitRate: number } {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? Math.round((this.hits / total) * 100) : 0,
    };
  }
}

export const cache = new InMemoryCache();

export { TTL_MS };
