export const FALLBACK_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f97316",
];

export function normalizeColor(
  color: string | undefined,
  index: number,
): string {
  if (color && /^#([0-9A-Fa-f]{3}){1,2}$/.test(color.trim())) {
    return color.trim().toLowerCase();
  }
  if (color && color.trim().length > 0) return color.trim();
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length]!;
}

export function getTransactionImpact(tx: any, walletId: string): number {
  const destId =
    tx.destination.type === "WALLET" ? tx.destination.id : undefined;
  const srcId = tx.source.type === "WALLET" ? tx.source.id : undefined;

  if (destId === walletId) return tx.usdValue;
  if (srcId === walletId) return -tx.usdValue;
  return 0;
}

export interface WalletHeldAsset {
  externalId: string;
  symbol: string;
  name: string;
  quantity: number;
}

/**
 * Aggregates the quantities of each asset held by a wallet based on its
 * transactions. Inbound amounts (deposits / transfers-in) increase the total;
 * outbound amounts (withdrawals / transfers-out) decrease it (clamped at 0).
 */
export function getWalletAssets(walletId: string, transactions: any[]): WalletHeldAsset[] {
  const map = new Map<string, WalletHeldAsset>();

  const apply = (tx: any, delta: number) => {
    const asset = tx.asset;
    if (!asset || !asset.externalId) return;
    const existing = map.get(asset.externalId);
    if (existing) {
      existing.quantity = Math.max(0, existing.quantity + delta);
    } else {
      map.set(asset.externalId, {
        externalId: asset.externalId,
        symbol: asset.symbol,
        name: asset.name,
        quantity: Math.max(0, delta),
      });
    }
  };

  for (const tx of transactions) {
    const destId = tx.destination?.type === "WALLET" ? tx.destination.id : undefined;
    const srcId = tx.source?.type === "WALLET" ? tx.source.id : undefined;
    if (destId === walletId) apply(tx, tx.quantity);
    if (srcId === walletId) apply(tx, -tx.quantity);
  }

  return Array.from(map.values())
    .filter(a => a.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity);
}
