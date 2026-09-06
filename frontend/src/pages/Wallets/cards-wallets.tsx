import { useMemo, useState, useRef, useEffect } from "react";
import {
  Wallet as WalletIcon,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Pencil,
  Trash2,
  LayoutGrid,
  Table2,
  ChevronDown,
  Archive,
  MoreHorizontal,
} from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from "recharts";
import { useWalletList } from "@/hooks/use-wallet-list";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { useWalletAssets } from "@/hooks/use-wallet-assets";
import { useActivateWalletMutation, useDeactivateWalletMutation } from "@/features/wallets/api/wallet-queries";
import { formatUSD } from "@/lib/formats";
import { getCoinLogoUrl } from "@/features/assets/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { EditWalletModal } from "./edit-modal-wallet";
import { DeleteWalletModal } from "./delete-modal-wallet";
import { ArchiveWalletModal } from "./archived-modal-wallet";
import { AddTransactionModal } from "@/components/modals/add-transaction";
import { ListWallets } from "./list-wallets";
import { WalletDetailPanel } from "./details-wallets";
import type { Wallet } from "@/features/wallets/types/wallet.types";
import type { WalletAsset } from "@/hooks/use-wallet-assets";

type StatusFilter = "all" | "active" | "inactive" | "archived";
type ViewMode = "grid" | "table";

const ICON_SIZE = 14;
const ICON_STROKE = 1;

const BLUE_PALETTE = ["#1e40af", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

export function StatusBadge({ status }: { status: string }) {
  const variant = status === "active" ? "success" : status === "inactive" ? "warning" : "default";
  return (
    <Badge variant={variant} size="sm">
      {status}
    </Badge>
  );
}

export function ActionButtons({
  onDeposit,
  onWithdraw,
  onTransfer,
  onAdjust,
  size = "xs" as const,
}: {
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onTransfer?: () => void;
  onAdjust?: () => void;
  size?: "xs" | "sm";
}) {
  return (
    <div className="flex items-center gap-1">
      <SimpleTooltip label="Deposit" side="top">
        <IconButton
          variant="ghost"
          size={size}
          aria-label="Deposit"
          onClick={e => {
            e.stopPropagation();
            onDeposit?.();
          }}
        >
          <ArrowDownRight size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </IconButton>
      </SimpleTooltip>
      <SimpleTooltip label="Withdraw" side="top">
        <IconButton
          variant="ghost"
          size={size}
          aria-label="Withdraw"
          onClick={e => {
            e.stopPropagation();
            onWithdraw?.();
          }}
        >
          <ArrowUpRight size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </IconButton>
      </SimpleTooltip>
      <SimpleTooltip label="Transfer" side="top">
        <IconButton
          variant="ghost"
          size={size}
          aria-label="Transfer"
          onClick={e => {
            e.stopPropagation();
            onTransfer?.();
          }}
        >
          <ArrowLeftRight size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </IconButton>
      </SimpleTooltip>
      <SimpleTooltip label="Adjust" side="top">
        <IconButton
          variant="ghost"
          size={size}
          aria-label="Adjust"
          onClick={e => {
            e.stopPropagation();
            onAdjust?.();
          }}
        >
          <SlidersHorizontal size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </IconButton>
      </SimpleTooltip>
    </div>
  );
}

export function MoreDropdown({ onEdit, onArchive, onDelete }: { onEdit?: () => void; onArchive?: () => void; onDelete?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <IconButton variant="ghost" size="xs" aria-label="More" onClick={() => setOpen(!open)}>
        <MoreHorizontal size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </IconButton>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 py-1 min-w-30">
          {onEdit && (
            <button
              onClick={() => { onEdit(); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-foreground hover:bg-surface-elevated transition-colors"
            >
              <Pencil size={ICON_SIZE} strokeWidth={ICON_STROKE} />
              Edit
            </button>
          )}
          {onArchive && (
            <button
              onClick={() => { onArchive(); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-foreground hover:bg-surface-elevated transition-colors"
            >
              <Archive size={ICON_SIZE} strokeWidth={ICON_STROKE} />
              Archive
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => { onDelete(); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-foreground hover:bg-surface-elevated transition-colors"
            >
              <Trash2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function GridAssetExpandContent({ assets }: { assets: WalletAsset[] }) {
  if (assets.length === 0) {
    return (
      <div className="mt-3 border-t border-border pt-3">
        <div className="flex flex-col items-center justify-center py-6 text-xs text-foreground-muted">No assets</div>
      </div>
    );
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex flex-col gap-2">
        {assets.map(asset => (
          <div key={asset.symbol} className="flex items-center gap-2 p-2 rounded-lg bg-surface-elevated border border-border">
            <img
              src={getCoinLogoUrl(asset.externalId, "thumb")}
              alt={asset.symbol}
              className="h-5 w-5 rounded-full shrink-0"
              onError={e => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-foreground truncate">{asset.symbol}</span>
              <span className="text-[10px] text-foreground-muted tabular-nums">{asset.quantity.toLocaleString()}</span>
            </div>
            <span className="text-xs font-medium tabular-nums text-foreground shrink-0 ml-auto">{formatUSD(asset.currentValueUSD)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GridWallets({
  row,
  isExpanded,
  onToggle,
  chartData,
  maxChartValue,
  assets,
  onDeposit,
  onWithdraw,
  onTransfer,
  onAdjust,
  onEdit,
  onArchive,
  onDelete,
  onSelectWallet,
}: {
  row: { id: string; name: string; type: string; status: string; balance: number; participation: number; color: string; assetCount: number };
  isExpanded: boolean;
  onToggle: () => void;
  chartData: { value: number; color: string }[];
  maxChartValue: number;
  assets: WalletAsset[];
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onTransfer?: () => void;
  onAdjust?: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onSelectWallet?: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelectWallet}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectWallet?.();
        }
      }}
      className="flex flex-col rounded-xl border border-border bg-surface p-4 gap-3 cursor-pointer hover:border-border/80 transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border shrink-0">
            <WalletIcon size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-foreground-muted" />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-medium text-foreground" title={row.name}>
              {row.name}
            </span>
            <span className="text-[10px] text-foreground-muted truncate">{row.type}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <StatusBadge status={row.status} />
          <ChevronDown
            size={14}
            onClick={e => {
              e.stopPropagation();
              onToggle();
            }}
            className={`text-foreground-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-foreground-muted">Total Balance</span>
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-semibold tabular-nums tracking-tight text-foreground">{formatUSD(row.balance)}</span>
          {assets.length > 0 && (
            <div className="flex items-center gap-1">
              {assets.slice(0, 5).map(asset => (
                <img
                  key={asset.symbol}
                  src={getCoinLogoUrl(asset.externalId, "thumb")}
                  alt={asset.symbol}
                  className="h-5 w-5 rounded-full shrink-0"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 h-16 min-w-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap="20%">
              <XAxis hide />
              <YAxis hide domain={[0, maxChartValue]} />
              <ReferenceLine y={0} stroke="#374151" strokeDasharray="3 3" strokeWidth={1} />
              <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={12}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center">
            <div className="w-full border-t border-dashed border-border" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="h-1.5 w-full rounded-full bg-border-subtle overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, row.participation)}%`, background: row.color }} />
        </div>
        <span className="text-[10px] text-foreground-muted tabular-nums">{row.participation.toFixed(1)}%</span>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1" onClick={e => e.stopPropagation()}>
        <ActionButtons onDeposit={onDeposit} onWithdraw={onWithdraw} onTransfer={onTransfer} onAdjust={onAdjust} />
        <MoreDropdown onEdit={onEdit} onArchive={onArchive} onDelete={onDelete} />
      </div>

      {isExpanded && <GridAssetExpandContent assets={assets} />}
    </div>
  );
}

export function CardsWallets() {
  const { isLoading, isError, wallets, transactions, refetchAll, walletsQuery } = useWalletList();
  const { rows, hasNegative, totalBalance } = useWalletBalances(wallets, transactions);
  const { getWalletAssets, getAssetCount } = useWalletAssets(transactions);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editWallet, setEditWallet] = useState<Wallet | null>(null);
  const [deleteWallet, setDeleteWallet] = useState<Wallet | null>(null);
  const [archiveWallet, setArchiveWallet] = useState<Wallet | null>(null);
  const [detailWallet, setDetailWallet] = useState<Wallet | null>(null);
  const activateMutation = useActivateWalletMutation();
  const deactivateMutation = useDeactivateWalletMutation();
  const [txModal, setTxModal] = useState<{ open: boolean; tab: "deposit" | "withdraw" | "transfer" | "adjust"; walletId?: string }>({
    open: false,
    tab: "deposit",
  });

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredRows = useMemo(() => {
    const enriched = rows
      .map(r => {
        const w = wallets.find(x => x.id === r.id);
        return { ...r, status: w?.status ?? "active", assetCount: getAssetCount(r.id) };
      })
      .filter(r => statusFilter === "all" || r.status === statusFilter);
    return enriched;
  }, [rows, wallets, statusFilter, getAssetCount]);

  const chartById = useMemo(() => {
    const map = new Map<string, { value: number; color: string }[]>();
    for (const row of filteredRows) {
      const base = Math.max(1, Math.abs(row.balance));
      const bars = Array.from({ length: 7 }, (_, i) => ({
        value: Math.round((Math.sin((i + row.balance) * 0.8) * 0.4 + 0.6) * base * 0.18),
        color: BLUE_PALETTE[i % BLUE_PALETTE.length]!,
      }));
      map.set(row.id, bars);
    }
    return map;
  }, [filteredRows]);

  if (isLoading) {
    return (
      <div className="w-full rounded-xl border border-border bg-surface p-4">
        <LoadingState>Loading wallets...</LoadingState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full rounded-xl border border-border bg-surface p-4">
        <ErrorState
          title="Unable to load wallets"
          description="Something went wrong while loading wallets."
          action={
            <Button variant="outline" size="sm" onClick={refetchAll}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (hasNegative) {
    return (
      <div className="w-full rounded-xl border border-border bg-surface p-4">
        <ErrorState
          title="Negative balance detected"
          description={`One or more wallets have negative balance (total ${formatUSD(totalBalance)}).`}
          action={
            <Button variant="outline" size="sm" onClick={refetchAll}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const isEmptyWallets = walletsQuery.data?.pagination.total === 0 || wallets.length === 0;

  return (
    <div className="w-full flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {(["all", "active", "inactive", "archived"] as StatusFilter[]).map(s => (
            <Button
              key={s}
              variant={statusFilter === s ? "secondary" : "ghost"}
              size="sm"
              className="text-xs capitalize h-7 px-3"
              onClick={() => setStatusFilter(s)}
            >
              {s === "inactive" ? "deactived" : s}
            </Button>
          ))}
        </div>

        <div className="flex items-center rounded-lg border border-border overflow-hidden divide-x divide-border">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-none h-7 px-3 gap-1.5 text-xs"
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
          >
            <LayoutGrid size={14} />
            Grid
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-none h-7 px-3 gap-1.5 text-xs"
            onClick={() => setViewMode("table")}
            aria-pressed={viewMode === "table"}
          >
            <Table2 size={14} />
            Table
          </Button>
        </div>
      </div>

      {isEmptyWallets ? (
        <EmptyState title="No wallets yet" description="Create your first wallet to get started." />
      ) : filteredRows.length === 0 ? (
        <EmptyState title="No wallets match filter" description="Try changing the status filter." />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredRows.map(row => {
            const chartData = chartById.get(row.id) ?? [];
            const maxChartValue = Math.max(...chartData.map(c => c.value), 1);
            const isExpanded = expandedIds.has(row.id);
            const assets = getWalletAssets(row.id);
            return (
              <GridWallets
                key={row.id}
                row={row}
                isExpanded={isExpanded}
                onToggle={() => toggleExpanded(row.id)}
                chartData={chartData}
                maxChartValue={maxChartValue}
                assets={assets}
                onSelectWallet={() => {
                  const w = wallets.find(x => x.id === row.id);
                  if (w) setDetailWallet(w);
                }}
                onDeposit={() => setTxModal({ open: true, tab: "deposit", walletId: row.id })}
                onWithdraw={() => setTxModal({ open: true, tab: "withdraw", walletId: row.id })}
                onTransfer={() => setTxModal({ open: true, tab: "transfer", walletId: row.id })}
                onAdjust={() => setTxModal({ open: true, tab: "adjust", walletId: row.id })}
                onEdit={() => {
                  const w = wallets.find(x => x.id === row.id) ?? null;
                  if (w) setEditWallet(w);
                }}
                onArchive={() => {
                  const w = wallets.find(x => x.id === row.id) ?? null;
                  if (w) setArchiveWallet(w);
                }}
                onDelete={() => {
                  const w = wallets.find(x => x.id === row.id) ?? null;
                  if (w) setDeleteWallet(w);
                }}
              />
            );
          })}
        </div>
      ) : (
        <ListWallets
          filteredRows={filteredRows}
          expandedIds={expandedIds}
          toggleExpanded={toggleExpanded}
          getWalletAssets={getWalletAssets}
          wallets={wallets}
          setTxModal={setTxModal}
          setEditWallet={setEditWallet}
          setArchiveWallet={setArchiveWallet}
          setDeleteWallet={setDeleteWallet}
          onSelectWallet={setDetailWallet}
        />
      )}
      <EditWalletModal open={!!editWallet} wallet={editWallet} onClose={() => setEditWallet(null)} />
      <DeleteWalletModal open={!!deleteWallet} wallet={deleteWallet} onClose={() => setDeleteWallet(null)} />
      <ArchiveWalletModal
        open={!!archiveWallet}
        wallet={archiveWallet}
        onClose={() => setArchiveWallet(null)}
        onArchived={() => setStatusFilter("archived")}
      />
      <AddTransactionModal
        open={txModal.open}
        onClose={() => setTxModal(prev => ({ ...prev, open: false }))}
        initialTab={txModal.tab}
        initialWalletId={txModal.walletId}
      />
      <WalletDetailPanel
        wallet={detailWallet}
        balance={detailWallet ? (rows.find(r => r.id === detailWallet.id)?.balance ?? 0) : 0}
        participation={detailWallet ? (rows.find(r => r.id === detailWallet.id)?.participation ?? 0) : 0}
        totalBalance={totalBalance}
        transactions={transactions}
        holdings={detailWallet ? getWalletAssets(detailWallet.id) : []}
        onClose={() => setDetailWallet(null)}
        onEdit={setEditWallet}
        onArchive={setArchiveWallet}
        onDelete={setDeleteWallet}
        onToggleActive={w =>
          w.status === "active"
            ? deactivateMutation.mutateAsync(w.id).then(() => setDetailWallet(null))
            : activateMutation.mutateAsync(w.id).then(() => setDetailWallet(null))
        }
      />
    </div>
  );
}