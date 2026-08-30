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
