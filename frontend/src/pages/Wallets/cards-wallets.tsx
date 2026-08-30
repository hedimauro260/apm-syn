import { useMemo, useState } from "react";
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
} from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from "recharts";
import { useWalletList } from "@/hooks/useWalletList";
import { useWalletBalances } from "@/hooks/useWalletBalances";
import { formatUSD } from "@/lib/formats";
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
import type { Wallet } from "@/features/wallets/types/wallet.types";

type StatusFilter = "all" | "active" | "inactive" | "archived";
type ViewMode = "grid" | "table";

const ICON_SIZE = 14;
const ICON_STROKE = 1;

const BLUE_PALETTE = ["#1e40af", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

function StatusBadge({ status }: { status: string }) {
  const variant = status === "active" ? "success" : status === "inactive" ? "warning" : "default";
  return (
    <Badge variant={variant} size="sm">
      {status}
    </Badge>
  );
}

function ActionButtons({ onStop, size = "xs" as const }: { onStop?: (e: React.MouseEvent) => void; size?: "xs" | "sm" }) {
  const handler = (label: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onStop?.(e);
    console.log(`${label} clicked`);
  };
  return (
    <div className="flex items-center gap-1">
      <SimpleTooltip label="Deposit" side="top">
        <IconButton variant="ghost" size={size} aria-label="Deposit" onClick={handler("Deposit")}>
          <ArrowDownRight size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </IconButton>
      </SimpleTooltip>
      <SimpleTooltip label="Withdraw" side="top">
        <IconButton variant="ghost" size={size} aria-label="Withdraw" onClick={handler("Withdraw")}>
          <ArrowUpRight size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </IconButton>
      </SimpleTooltip>
      <SimpleTooltip label="Transfer" side="top">
        <IconButton variant="ghost" size={size} aria-label="Transfer" onClick={handler("Transfer")}>
          <ArrowLeftRight size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </IconButton>
      </SimpleTooltip>
      <SimpleTooltip label="Adjust" side="top">
        <IconButton variant="ghost" size={size} aria-label="Adjust" onClick={handler("Adjust")}>
          <SlidersHorizontal size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </IconButton>
      </SimpleTooltip>
    </div>
  );
}

function AssetExpandContent() {
  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="grid grid-cols-5 gap-2 px-2 py-2 text-[10px] font-medium text-foreground-muted uppercase tracking-wide">
        <span>Asset</span>
        <span className="text-right">Quantity</span>
        <span className="text-right">Purchase</span>
        <span className="text-right">Current Value</span>
        <span className="text-right">PNL</span>
      </div>
      <div className="flex flex-col items-center justify-center py-6 text-xs text-foreground-muted">No assets</div>
    </div>
  );
}

function WalletCard({
  row,
  isExpanded,
  onToggle,
  chartData,
  maxChartValue,
}: {
  row: { id: string; name: string; type: string; status: string; balance: number; participation: number; color: string };
  isExpanded: boolean;
  onToggle: () => void;
  chartData: { value: number; color: string }[];
  maxChartValue: number;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className="flex flex-col rounded-xl border border-border bg-surface p-4 gap-3 cursor-pointer hover:border-border/80 transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border shrink-0">
            <WalletIcon size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-foreground-muted" />
          </span>
          <span className="truncate text-sm font-medium text-foreground" title={row.name}>
            {row.name}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <StatusBadge status={row.status} />
          <ChevronDown
            size={14}
            className={`text-foreground-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-xs text-foreground-muted">Total Balance</span>
        <span className="text-lg font-semibold tabular-nums tracking-tight text-foreground">{formatUSD(row.balance)}</span>
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

      <div className="h-1.5 w-full rounded-full bg-border-subtle overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, row.participation)}%`, background: row.color }} />
      </div>

      <div className="flex items-center justify-between gap-2 pt-1" onClick={e => e.stopPropagation()}>
        <ActionButtons />
        <span className="text-[10px] text-foreground-muted tabular-nums">{row.participation.toFixed(1)}%</span>
      </div>

      {isExpanded && <AssetExpandContent />}
    </div>
  );
}

export function CardsWallets() {
  const { isLoading, isError, wallets, transactions, refetchAll, walletsQuery } = useWalletList();
  const { rows, hasNegative, totalBalance } = useWalletBalances(wallets, transactions);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editWallet, setEditWallet] = useState<Wallet | null>(null);
  const [deleteWallet, setDeleteWallet] = useState<Wallet | null>(null);
  const [archiveWallet, setArchiveWallet] = useState<Wallet | null>(null);

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
        return { ...r, status: w?.status ?? "active" };
      })
      .filter(r => statusFilter === "all" || r.status === statusFilter);
    return enriched;
  }, [rows, wallets, statusFilter]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRows.map(row => {
            const chartData = chartById.get(row.id) ?? [];
            const maxChartValue = Math.max(...chartData.map(c => c.value), 1);
            const isExpanded = expandedIds.has(row.id);
            return (
              <WalletCard
                key={row.id}
                row={row}
                isExpanded={isExpanded}
                onToggle={() => toggleExpanded(row.id)}
                chartData={chartData}
                maxChartValue={maxChartValue}
              />
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="hidden md:grid grid-cols-[1.4fr_0.9fr_0.6fr_0.8fr_0.9fr_140px_80px_32px] gap-2 px-4 py-2 bg-surface-elevated border-b border-border text-[10px] font-medium text-foreground-muted uppercase tracking-wide">
            <span>Wallet</span>
            <span className="text-right">Saldo</span>
            <span className="text-center">Assets</span>
            <span className="text-center">Status</span>
            <span>Participação</span>
            <span className="text-center">Actions</span>
            <span className="text-center">Option</span>
            <span />
          </div>

          <ul className="flex flex-col divide-y divide-border-subtle">
            {filteredRows.map(row => {
              const isExpanded = expandedIds.has(row.id);
              return (
                <li key={row.id} className="flex flex-col">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleExpanded(row.id)}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleExpanded(row.id);
                      }
                    }}
                    className="grid grid-cols-1 md:grid-cols-[1.4fr_0.9fr_0.6fr_0.8fr_0.9fr_140px_80px_32px] gap-2 md:gap-2 px-4 py-3 items-center cursor-pointer hover:bg-surface-elevated/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border shrink-0">
                        <WalletIcon size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-foreground-muted" />
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-xs font-medium text-foreground" title={row.name}>
                          {row.name}
                        </span>
                        <span className="text-[10px] text-foreground-muted truncate">{row.type}</span>
                      </div>
                    </div>

                    <span className="text-xs font-semibold tabular-nums text-foreground md:text-right">{formatUSD(row.balance)}</span>

                    <span className="text-xs text-foreground-muted md:text-center">0</span>

                    <div className="flex md:justify-center">
                      <StatusBadge status={row.status} />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="h-1.5 w-full rounded-full bg-border-subtle overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, row.participation)}%`, background: row.color }} />
                      </div>
                    </div>

                    <div className="flex justify-center" onClick={e => e.stopPropagation()}>
                      <ActionButtons />
                    </div>

                    <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                      <SimpleTooltip label="Edit" side="top">
                        <IconButton
                          variant="ghost"
                          size="xs"
                          aria-label="Edit"
                          onClick={() => {
                            const w = wallets.find(x => x.id === row.id) ?? null;
                            if (w) setEditWallet(w);
                          }}
                        >
                          <Pencil size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                        </IconButton>
                      </SimpleTooltip>
                      <SimpleTooltip label="Archive" side="top">
                        <IconButton
                          variant="ghost"
                          size="xs"
                          aria-label="Archive"
                          onClick={() => {
                            const w = wallets.find(x => x.id === row.id) ?? null;
                            if (w) setArchiveWallet(w);
                          }}
                        >
                          <Archive size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                        </IconButton>
                      </SimpleTooltip>
                      <SimpleTooltip label="Delete" side="top">
                        <IconButton
                          variant="ghost"
                          size="xs"
                          aria-label="Delete"
                          onClick={() => {
                            const w = wallets.find(x => x.id === row.id) ?? null;
                            if (w) setDeleteWallet(w);
                          }}
                        >
                          <Trash2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                        </IconButton>
                      </SimpleTooltip>
                    </div>

                    <div className="flex justify-end">
                      <ChevronDown size={14} className={`text-foreground-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-3 bg-surface-elevated/30 border-t border-border-subtle">
                      <div className="grid grid-cols-5 gap-2 px-2 py-2 text-[10px] font-medium text-foreground-muted uppercase tracking-wide">
                        <span>Asset</span>
                        <span className="text-right">Quantity</span>
                        <span className="text-right">Purchase</span>
                        <span className="text-right">Current Value</span>
                        <span className="text-right">PNL</span>
                      </div>
                      <div className="flex items-center justify-center py-6 text-xs text-foreground-muted">No assets</div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <EditWalletModal open={!!editWallet} wallet={editWallet} onClose={() => setEditWallet(null)} />
      <DeleteWalletModal open={!!deleteWallet} wallet={deleteWallet} onClose={() => setDeleteWallet(null)} />
      <ArchiveWalletModal
        open={!!archiveWallet}
        wallet={archiveWallet}
        onClose={() => setArchiveWallet(null)}
        onArchived={() => setStatusFilter("archived")}
      />
    </div>
  );
}
