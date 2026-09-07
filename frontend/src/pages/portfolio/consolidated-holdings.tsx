import { Fragment, useMemo, useState } from "react";
import { ChevronDown, Wallet } from "lucide-react";
import { useWalletsQuery } from "@/features/wallets/api/wallet-queries";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";
import { useAssetPrices } from "@/features/market-data/hooks/use-asset-prices";
import { formatUSD } from "@/lib/formats";
import { getCoinLogoUrl } from "@/features/assets/logo";
import { Select } from "@/components/ui/select";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WalletHolding {
  walletId: string;
  walletName: string;
  quantity: number;
  purchaseUsd: number;
  currentValueUsd: number;
  pnlPercentage: number | undefined;
}

interface AssetHolding {
  externalId: string;
  name: string;
  symbol: string;
  totalQuantity: number;
  walletCount: number;
  currentValueUsd: number;
  participation: number;
  avgPurchasePrice: number | undefined;
  pnlPercentage: number | undefined;
  wallets: WalletHolding[];
}

const ALL_ASSETS = "__all__";

export function ConsolidatedHoldings() {
  const walletsQuery = useWalletsQuery({ limit: 100 });
  const transactionsQuery = useTransactionsQuery({ limit: 100, sort: "-date" });

  const isLoading = walletsQuery.isLoading || transactionsQuery.isLoading;
  const isError = walletsQuery.isError || transactionsQuery.isError;

  const wallets = useMemo(() => walletsQuery.data?.data ?? [], [walletsQuery.data]);
  const transactions = useMemo(() => transactionsQuery.data?.data ?? [], [transactionsQuery.data]);

  const assetIds = useMemo(() => {
    const ids = new Set<string>();
    for (const tx of transactions) {
      if (tx.asset?.externalId) ids.add(tx.asset.externalId);
    }
    return Array.from(ids);
  }, [transactions]);

  const priceMap = useAssetPrices(assetIds);

  const walletNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const w of wallets) {
      if (w.id) map.set(w.id, w.name);
    }
    return map;
  }, [wallets]);

  const holdings = useMemo(() => {
    const assetMap = new Map<string, {
      name: string;
      symbol: string;
      totalQuantity: number;
      walletQuantities: Map<string, number>;
      walletPurchase: Map<string, number>;
    }>();

    for (const tx of transactions) {
      const asset = tx.asset;
      if (!asset || !asset.externalId) continue;

      const destId = tx.destination?.type === "WALLET" ? tx.destination.id : undefined;
      const srcId = tx.source?.type === "WALLET" ? tx.source.id : undefined;

      let entry = assetMap.get(asset.externalId);
      if (!entry) {
        entry = {
          name: asset.name,
          symbol: asset.symbol,
          totalQuantity: 0,
          walletQuantities: new Map<string, number>(),
          walletPurchase: new Map<string, number>(),
        };
        assetMap.set(asset.externalId, entry);
      }

      if (destId) {
        entry.totalQuantity += tx.quantity;
        entry.walletQuantities.set(destId, (entry.walletQuantities.get(destId) ?? 0) + tx.quantity);
        entry.walletPurchase.set(destId, (entry.walletPurchase.get(destId) ?? 0) + tx.usdValue);
      }
      if (srcId) {
        entry.totalQuantity -= tx.quantity;
        entry.walletQuantities.set(srcId, (entry.walletQuantities.get(srcId) ?? 0) - tx.quantity);
      }
    }

    let totalValue = 0;
    const list: AssetHolding[] = [];

    for (const [externalId, data] of assetMap) {
      const quantity = Math.max(0, data.totalQuantity);
      if (quantity <= 0) continue;

      const currentPrice = priceMap.get(externalId);
      const currentValue = currentPrice != null ? quantity * currentPrice : 0;
      totalValue += currentValue;

      const avgPurchasePrice = data.totalQuantity > 0
        ? Array.from(data.walletPurchase.values()).reduce((sum, v) => sum + v, 0) / data.totalQuantity
        : undefined;
      const pnlPercentage = avgPurchasePrice != null && currentPrice != null && avgPurchasePrice > 0
        ? ((currentPrice - avgPurchasePrice) / avgPurchasePrice) * 100
        : undefined;

      const walletsArr: WalletHolding[] = [];
      for (const [walletId, walletQuantity] of data.walletQuantities) {
        const held = Math.max(0, walletQuantity);
        if (held <= 0) continue;
        const purchaseUsd = data.walletPurchase.get(walletId) ?? 0;
        const walletValue = currentPrice != null ? held * currentPrice : 0;
        const walletPnl = purchaseUsd > 0 ? ((walletValue - purchaseUsd) / purchaseUsd) * 100 : undefined;
        walletsArr.push({
          walletId,
          walletName: walletNameById.get(walletId) ?? "Wallet",
          quantity: held,
          purchaseUsd,
          currentValueUsd: walletValue,
          pnlPercentage: walletPnl,
        });
      }

      list.push({
        externalId,
        name: data.name,
        symbol: data.symbol,
        totalQuantity: quantity,
        walletCount: walletsArr.length,
        currentValueUsd: currentValue,
        participation: 0,
        avgPurchasePrice,
        pnlPercentage,
        wallets: walletsArr,
      });
    }

    return list.map(h => ({
      ...h,
      participation: totalValue > 0 ? (h.currentValueUsd / totalValue) * 100 : 0,
    })).sort((a, b) => b.currentValueUsd - a.currentValueUsd);
  }, [transactions, priceMap, walletNameById]);

  const [selectedAsset, setSelectedAsset] = useState<string>(ALL_ASSETS);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filteredHoldings = useMemo(() => {
    if (selectedAsset === ALL_ASSETS) return holdings;
    return holdings.filter(h => h.externalId === selectedAsset);
  }, [holdings, selectedAsset]);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const headerRow = (
    <Select value={selectedAsset} onChange={e => setSelectedAsset(e.target.value)} className="h-8 w-48 text-xs">
      <option value={ALL_ASSETS}>All Assets</option>
      {holdings.map(h => (
        <option key={h.externalId} value={h.externalId}>{h.symbol}</option>
      ))}
    </Select>
  );

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          {headerRow}
        </div>
        <LoadingState>Loading holdings...</LoadingState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          {headerRow}
        </div>
        <ErrorState
          title="Unable to load holdings"
          description="Something went wrong while loading consolidated holdings."
          action={
            <Button variant="outline" size="sm" onClick={() => { walletsQuery.refetch(); transactionsQuery.refetch(); }}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="w-full flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          {headerRow}
        </div>
        <EmptyState title="No holdings yet" description="Create transactions to see consolidated holdings." />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        {headerRow}
      </div>

      {filteredHoldings.length === 0 ? (
        <EmptyState title="No holdings for this asset" description="Select another asset to see its consolidated holdings." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-elevated/40 text-[10px] uppercase tracking-wide text-foreground-muted">
                <th className="px-3 py-2 font-medium">Asset</th>
                <th className="px-3 py-2 font-medium text-right">Quantity</th>
                <th className="px-3 py-2 font-medium text-right">Current Value</th>
                <th className="px-3 py-2 font-medium text-right">Average PNL</th>
                <th className="px-3 py-2 font-medium text-right">Wallets</th>
                <th className="px-3 py-2 font-medium text-right">Participation</th>
                <th className="px-3 py-2 font-medium w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredHoldings.map(asset => {
                const isExpanded = expandedIds.has(asset.externalId);

                return (
                  <Fragment key={asset.externalId}>
                    <ExpandedAssetRow
                      asset={asset}
                      isExpanded={isExpanded}
                      onToggle={() => toggleExpanded(asset.externalId)}
                    />
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ExpandedAssetRow({
  asset,
  isExpanded,
  onToggle,
}: {
  asset: AssetHolding;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const pnl = asset.pnlPercentage;

  return (
    <>
      <tr
        className="cursor-pointer transition-colors hover:bg-surface-elevated/50"
        onClick={onToggle}
      >
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <img
              src={getCoinLogoUrl(asset.externalId, "thumb")}
              alt={asset.symbol}
              className="h-5 w-5 rounded-full shrink-0"
              onError={e => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-medium text-foreground" title={asset.name}>
                {asset.name}
              </span>
              <span className="text-[10px] text-foreground-muted truncate">{asset.symbol}</span>
            </div>
          </div>
        </td>
        <td className="px-3 py-2.5 text-right">
          <span className="text-xs font-semibold tabular-nums text-foreground">{asset.totalQuantity.toLocaleString()}</span>
        </td>
        <td className="px-3 py-2.5 text-right">
          <span className="text-xs font-semibold tabular-nums text-foreground">{formatUSD(asset.currentValueUsd)}</span>
        </td>
        <td className="px-3 py-2.5 text-right">
          <span className={cn(
            "text-xs font-semibold tabular-nums",
            pnl == null ? "text-foreground-secondary" : pnl >= 0 ? "text-success" : "text-danger"
          )}>
            {pnl == null ? "-" : `${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}%`}
          </span>
        </td>
        <td className="px-3 py-2.5 text-right">
          <span className="text-xs font-medium tabular-nums text-foreground">{asset.walletCount}</span>
        </td>
        <td className="px-3 py-2.5">
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] tabular-nums text-foreground-secondary">
              {asset.participation.toFixed(1)}%
            </span>
            <div className="h-1.5 w-20 rounded-full bg-border-subtle overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, asset.participation)}%`, background: "#3b82f6" }} />
            </div>
          </div>
        </td>
        <td className="px-3 py-2.5 w-8">
          <div className="flex justify-end">
            <ChevronDown
              size={14}
              className={cn(
                "text-foreground-muted transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={7} className="px-4 pb-3 pt-1 bg-surface-elevated/30">
            <div className="mt-2 flex flex-col gap-3 rounded-lg border border-border bg-surface p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border">
                    <Wallet size={14} strokeWidth={1.5} className="text-foreground-muted" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-medium text-foreground-muted">
                      Average PNL - {asset.name}
                    </span>
                    <span className={cn(
                      "text-sm font-semibold tabular-nums",
                      pnl == null ? "text-foreground-secondary" : pnl >= 0 ? "text-success" : "text-danger"
                    )}>
                      {pnl == null ? "No purchase history" : `${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}%`}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-foreground-secondary tabular-nums">
                  Consolidated across {asset.walletCount} {asset.walletCount === 1 ? "wallet" : "wallets"}
                </span>
              </div>

              {asset.wallets.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border-subtle bg-surface-elevated/40 text-[10px] uppercase tracking-wide text-foreground-muted">
                        <th className="px-3 py-2 font-medium">Wallet</th>
                        <th className="px-3 py-2 font-medium text-right">Quantity</th>
                        <th className="px-3 py-2 font-medium text-right">Purchase</th>
                        <th className="px-3 py-2 font-medium text-right">Current Value</th>
                        <th className="px-3 py-2 font-medium text-right">PNL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {asset.wallets.map(w => (
                        <tr key={w.walletId} className="hover:bg-surface-elevated/30">
                          <td className="px-3 py-2">
                            <span className="text-xs font-medium text-foreground">{w.walletName}</span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span className="text-xs tabular-nums text-foreground">{w.quantity.toLocaleString()}</span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span className="text-xs tabular-nums text-foreground-secondary">{formatUSD(w.purchaseUsd)}</span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span className="text-xs tabular-nums text-foreground">{formatUSD(w.currentValueUsd)}</span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span className={cn(
                              "text-xs font-semibold tabular-nums",
                              w.pnlPercentage == null ? "text-foreground-secondary" : w.pnlPercentage >= 0 ? "text-success" : "text-danger"
                            )}>
                              {w.pnlPercentage == null ? "-" : `${w.pnlPercentage >= 0 ? "+" : ""}${w.pnlPercentage.toFixed(2)}%`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-foreground-muted">No wallet breakdown available.</p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
