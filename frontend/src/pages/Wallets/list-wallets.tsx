import {
  Wallet as WalletIcon,
  Pencil,
  Trash2,
  Archive,
  ChevronDown,
} from "lucide-react";
import { formatUSD } from "@/lib/formats";
import { getCoinLogoUrl } from "@/features/assets/logo";
import { IconButton } from "@/components/ui/icon-button";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { StatusBadge, ActionButtons } from "./cards-wallets";
import type { Wallet } from "@/features/wallets/types/wallet.types";
import type { WalletAsset } from "@/hooks/use-wallet-assets";

const ICON_SIZE = 14;
const ICON_STROKE = 1;

function AssetExpandContent({ assets }: { assets: WalletAsset[] }) {
  if (assets.length === 0) {
    return (
      <div className="px-4 pb-3 bg-surface-elevated/30 border-t border-border-subtle">
        <div className="flex items-center justify-center py-6 text-xs text-foreground-muted">No assets</div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-3 bg-surface-elevated/30 border-t border-border-subtle">
      <div className="mt-3">
        <div className="grid grid-cols-3 gap-2 px-2 py-2 text-[10px] font-medium text-foreground-muted uppercase tracking-wide">
          <span>Asset</span>
          <span className="text-right">Quantity</span>
          <span className="text-right">Current Value USD</span>
        </div>
        <div className="flex flex-col divide-y divide-border-subtle">
          {assets.map(asset => (
            <div key={asset.symbol} className="grid grid-cols-3 gap-2 items-center py-2 px-2">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={getCoinLogoUrl(asset.externalId, "thumb")}
                  alt={asset.symbol}
                  className="h-5 w-5 rounded-full shrink-0"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="text-xs font-medium text-foreground truncate">{asset.symbol}</span>
              </div>
              <span className="text-xs tabular-nums text-foreground text-right">{asset.quantity.toLocaleString()}</span>
              <span className="text-xs tabular-nums text-foreground text-right">{formatUSD(asset.currentValueUSD)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ListWalletsProps {
  filteredRows: { id: string; name: string; type: string; status: string; balance: number; participation: number; color: string; assetCount: number }[];
  expandedIds: Set<string>;
  toggleExpanded: (id: string) => void;
  getWalletAssets: (walletId: string) => WalletAsset[];
  wallets: Wallet[];
  setTxModal: (modal: { open: boolean; tab: "deposit" | "withdraw" | "transfer" | "adjust"; walletId?: string }) => void;
  setEditWallet: (wallet: Wallet | null) => void;
  setArchiveWallet: (wallet: Wallet | null) => void;
  setDeleteWallet: (wallet: Wallet | null) => void;
  onSelectWallet?: (wallet: Wallet) => void;
}

export function ListWallets({
  filteredRows,
  expandedIds,
  toggleExpanded,
  getWalletAssets,
  wallets,
  setTxModal,
  setEditWallet,
  setArchiveWallet,
  setDeleteWallet,
  onSelectWallet,
}: ListWalletsProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border inline-block max-w-full">
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
          const assets = getWalletAssets(row.id);
          return (
            <li key={row.id} className="flex flex-col">
              <div
                className="grid grid-cols-1 md:grid-cols-[1.4fr_0.9fr_0.6fr_0.8fr_0.9fr_140px_80px_32px] gap-2 md:gap-2 px-4 py-3 items-center cursor-pointer hover:bg-surface-elevated/50 transition-colors"
                onClick={() => {
                  const w = wallets.find(x => x.id === row.id);
                  if (w && onSelectWallet) onSelectWallet(w);
                }}
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

                <span className="text-xs text-foreground-muted md:text-center">{row.assetCount}</span>

                <div className="flex md:justify-center">
                  <StatusBadge status={row.status} />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="h-1.5 w-full rounded-full bg-border-subtle overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, row.participation)}%`, background: row.color }} />
                  </div>
                </div>

                <div className="flex justify-center" onClick={e => e.stopPropagation()}>
                  <ActionButtons
                    onDeposit={() => setTxModal({ open: true, tab: "deposit", walletId: row.id })}
                    onWithdraw={() => setTxModal({ open: true, tab: "withdraw", walletId: row.id })}
                    onTransfer={() => setTxModal({ open: true, tab: "transfer", walletId: row.id })}
                    onAdjust={() => setTxModal({ open: true, tab: "adjust", walletId: row.id })}
                  />
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
                  <ChevronDown
                    size={14}
                    onClick={e => {
                      e.stopPropagation();
                      toggleExpanded(row.id);
                    }}
                    className={`text-foreground-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {isExpanded && <AssetExpandContent assets={assets} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}