import { useMemo, useState } from "react";
import {
  X,
  Wallet as WalletIcon,
  Pencil,
  Archive,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Power,
  Calendar,
  Tag,
  CircleDollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Sheet } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IconButton } from "@/components/ui/icon-button";
import { formatUSD } from "@/lib/formats";
import { getCoinLogoUrl } from "@/features/assets/logo";
import type { Wallet, WalletType } from "@/features/wallets/types/wallet.types";
import type { Transaction } from "@/features/transactions/types/transaction.types";
import type { WalletAsset } from "@/hooks/use-wallet-assets";

type DetailTab = "overview" | "holdings" | "history" | "settings";

const TABS: { key: DetailTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "holdings", label: "Holdings" },
  { key: "history", label: "History" },
  { key: "settings", label: "Settings" },
];

const TYPE_LABELS: Record<WalletType, string> = {
  exchange: "Exchange",
  crypto: "Crypto",
  microwallet: "Microwallet",
  hardware: "Hardware",
  banking: "Banking",
  other: "Other",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTxLabel(type: Transaction["type"]): string {
  switch (type) {
    case "WALLET_DEPOSIT":
      return "Deposit";
    case "WALLET_WITHDRAWAL":
      return "Withdrawal";
    case "WALLET_TRANSFER":
      return "Transfer";
    case "WALLET_ADJUSTMENT":
      return "Adjustment";
    case "WEBSITE_EARNING":
      return "Earning";
    case "WEBSITE_WITHDRAWAL":
      return "Withdrawal";
    default:
      return type;
  }
}

function getTxIcon(type: Transaction["type"]) {
  switch (type) {
    case "WALLET_DEPOSIT":
    case "WEBSITE_EARNING":
      return <ArrowDownRight size={12} strokeWidth={1.5} className="text-success" />;
    case "WALLET_WITHDRAWAL":
    case "WEBSITE_WITHDRAWAL":
      return <ArrowUpRight size={12} strokeWidth={1.5} className="text-danger" />;
    case "WALLET_TRANSFER":
      return <ArrowLeftRight size={12} strokeWidth={1.5} className="text-info" />;
    case "WALLET_ADJUSTMENT":
      return <CircleDollarSign size={12} strokeWidth={1.5} className="text-warning" />;
    default:
      return <CircleDollarSign size={12} strokeWidth={1.5} className="text-foreground-muted" />;
  }
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-md">
      <p className="text-[10px] text-foreground-muted">{label}</p>
      <p className="text-xs font-medium tabular-nums text-foreground">{formatUSD(payload[0]!.value)}</p>
    </div>
  );
}

interface BalanceChartProps {
  transactions: Transaction[];
  walletId: string;
}

function BalanceChart({ transactions, walletId }: BalanceChartProps) {
  const [range, setRange] = useState<7 | 30>(7);

  const chartData = useMemo(() => {
    const limit = range === 7 ? 7 : 30;
    const relevant = [...transactions]
      .filter(tx => {
        const destId = tx.destination.type === "WALLET" ? tx.destination.id : undefined;
        const srcId = tx.source.type === "WALLET" ? tx.source.id : undefined;
        return destId === walletId || srcId === walletId;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-limit);

    let running = 0;
    const points: { date: string; label: string; value: number }[] = [];
    for (const tx of relevant) {
      const destId = tx.destination.type === "WALLET" ? tx.destination.id : undefined;
      const srcId = tx.source.type === "WALLET" ? tx.source.id : undefined;
      if (destId === walletId) running += tx.usdValue;
      if (srcId === walletId) running -= tx.usdValue;
      const d = new Date(tx.date);
      points.push({
        date: tx.date,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        value: running,
      });
    }
    return points;
  }, [transactions, walletId, range]);

  const minVal = chartData.length > 0 ? Math.min(...chartData.map(d => d.value)) : 0;
  const maxVal = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 100;
  const domain: [number, number] = [
    minVal >= 0 ? 0 : minVal * 1.1,
    maxVal * 1.1 || 100,
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">Balance History</span>
        <div className="flex items-center rounded-lg border border-border overflow-hidden divide-x divide-border">
          {([7, 30] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
                range === r
                  ? "bg-surface-elevated text-foreground"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {r}D
            </button>
          ))}
        </div>
      </div>
      {chartData.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-xs text-foreground-muted">
          No balance data in this period
        </div>
      ) : (
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="detailLineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" hide />
              <YAxis hide domain={domain} />
              <ReferenceLine y={domain[0]} stroke="#374151" strokeDasharray="3 3" strokeWidth={1} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

interface OverviewTabProps {
  wallet: Wallet;
  transactions: Transaction[];
  walletId: string;
  holdings: WalletAsset[];
}

function OverviewTab({ wallet, transactions, walletId, holdings }: OverviewTabProps) {
  return (
    <div className="flex flex-col gap-5">
      <BalanceChart transactions={transactions} walletId={walletId} />

      <Separator />

      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-foreground">Wallet Info</span>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between py-2 border-b border-border-subtle">
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <WalletIcon size={12} strokeWidth={1.5} />
              Name
            </div>
            <span className="text-xs font-medium text-foreground">{wallet.name}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border-subtle">
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <Tag size={12} strokeWidth={1.5} />
              Type
            </div>
            <span className="text-xs font-medium text-foreground capitalize">{TYPE_LABELS[wallet.type]}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border-subtle">
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <Calendar size={12} strokeWidth={1.5} />
              Created
            </div>
            <span className="text-xs font-medium text-foreground">{formatDate(wallet.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <CircleDollarSign size={12} strokeWidth={1.5} />
              Assets
            </div>
            <span className="text-xs font-medium text-foreground">{holdings.length}</span>
          </div>
        </div>
      </div>

      {wallet.description && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-foreground">Description</span>
            <p className="text-xs text-foreground-secondary leading-relaxed">{wallet.description}</p>
          </div>
        </>
      )}
    </div>
  );
}

function HoldingsTab({ holdings }: { holdings: WalletAsset[] }) {
  if (holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-xs text-foreground-muted">
        No assets in this wallet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {holdings.map(asset => (
        <div
          key={asset.symbol}
          className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-elevated"
        >
          <img
            src={getCoinLogoUrl(asset.externalId, "thumb")}
            alt={asset.symbol}
            className="h-7 w-7 rounded-full shrink-0"
            onError={e => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-medium text-foreground truncate">{asset.symbol}</span>
            <span className="text-[10px] text-foreground-muted truncate">{asset.name}</span>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-xs font-medium tabular-nums text-foreground">{formatUSD(asset.currentValueUSD)}</span>
            <span className="text-[10px] text-foreground-muted tabular-nums">{asset.quantity.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryTab({ transactions, walletId }: { transactions: Transaction[]; walletId: string }) {
  const recent = useMemo(() => {
    return transactions
      .filter(tx => {
        const destId = tx.destination.type === "WALLET" ? tx.destination.id : undefined;
        const srcId = tx.source.type === "WALLET" ? tx.source.id : undefined;
        return destId === walletId || srcId === walletId;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [transactions, walletId]);

  if (recent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-xs text-foreground-muted">
        No recent transactions
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {recent.map(tx => {
        const destId = tx.destination.type === "WALLET" ? tx.destination.id : undefined;
        const isInbound = destId === walletId;
        return (
          <div
            key={tx.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-elevated"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface border border-border shrink-0">
              {getTxIcon(tx.type)}
            </span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium text-foreground truncate">{getTxLabel(tx.type)}</span>
              <span className="text-[10px] text-foreground-muted truncate">
                {tx.asset.symbol} · {formatDateTime(tx.date)}
              </span>
            </div>
            <span
              className={`text-xs font-medium tabular-nums shrink-0 ${
                isInbound ? "text-success" : "text-danger"
              }`}
            >
              {isInbound ? "+" : "-"}{formatUSD(tx.usdValue)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface SettingsTabProps {
  wallet: Wallet;
  onEdit: (wallet: Wallet) => void;
  onArchive: (wallet: Wallet) => void;
  onDelete: (wallet: Wallet) => void;
  onToggleActive: () => Promise<void> | void;
}

function SettingsTab({ wallet, onEdit, onArchive, onDelete, onToggleActive }: SettingsTabProps) {
  const isArchived = wallet.status === "archived";
  const isActive = wallet.status === "active";
  const [toggling, setToggling] = useState(false);

  const handleToggleActive = async () => {
    setToggling(true);
    try {
      await onToggleActive();
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => onEdit(wallet)}
        disabled={isArchived}
        className="flex items-center gap-3 w-full p-3 rounded-lg border border-border bg-surface-elevated text-left transition-colors hover:bg-border-subtle disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border shrink-0">
          <Pencil size={12} strokeWidth={1.5} className="text-foreground-secondary" />
        </span>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-foreground">Edit</span>
          <span className="text-[10px] text-foreground-muted">Update wallet details</span>
        </div>
      </button>

      {!isArchived && (
        <button
          onClick={handleToggleActive}
          disabled={toggling}
          className="flex items-center gap-3 w-full p-3 rounded-lg border border-border bg-surface-elevated text-left transition-colors hover:bg-border-subtle disabled:opacity-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border shrink-0">
            <Power size={12} strokeWidth={1.5} className={isActive ? "text-warning" : "text-success"} />
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">
              {isActive ? "Deactivate" : "Activate"}
            </span>
            <span className="text-[10px] text-foreground-muted">
              {isActive ? "Disable this wallet" : "Enable this wallet"}
            </span>
          </div>
        </button>
      )}

      {!isArchived && (
        <button
          onClick={() => onArchive(wallet)}
          className="flex items-center gap-3 w-full p-3 rounded-lg border border-border bg-surface-elevated text-left transition-colors hover:bg-border-subtle"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border shrink-0">
            <Archive size={12} strokeWidth={1.5} className="text-foreground-secondary" />
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">Archive</span>
            <span className="text-[10px] text-foreground-muted">Move to archived wallets</span>
          </div>
        </button>
      )}

      <button
        onClick={() => onDelete(wallet)}
        className="flex items-center gap-3 w-full p-3 rounded-lg border border-danger/30 bg-surface-elevated text-left transition-colors hover:bg-danger/5"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-danger/20 shrink-0">
          <Trash2 size={12} strokeWidth={1.5} className="text-danger" />
        </span>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-danger">Delete</span>
          <span className="text-[10px] text-foreground-muted">Permanently remove this wallet</span>
        </div>
      </button>
    </div>
  );
}

export interface WalletDetailPanelProps {
  wallet: Wallet | null;
  balance: number;
  participation: number;
  totalBalance: number;
  transactions: Transaction[];
  holdings: WalletAsset[];
  onClose: () => void;
  onEdit: (wallet: Wallet) => void;
  onArchive: (wallet: Wallet) => void;
  onDelete: (wallet: Wallet) => void;
  onToggleActive?: (wallet: Wallet) => Promise<void> | void;
}

export function WalletDetailPanel({
  wallet,
  balance,
  participation,
  totalBalance,
  transactions,
  holdings,
  onClose,
  onEdit,
  onArchive,
  onDelete,
  onToggleActive,
}: WalletDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  if (!wallet) return null;

  const statusVariant = wallet.status === "active" ? "success" : wallet.status === "inactive" ? "warning" : "default";

  const handleToggleActive = () => {
    onToggleActive?.(wallet);
  };

  return (
    <Sheet open={!!wallet} onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 pb-3 shrink-0 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated border border-border shrink-0">
              <WalletIcon size={14} strokeWidth={1} className="text-foreground-muted" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">{wallet.name}</span>
              <Badge variant={statusVariant} size="sm" className="w-fit mt-0.5">{wallet.status}</Badge>
            </div>
          </div>
          <IconButton variant="ghost" size="sm" aria-label="Close details" onClick={onClose}>
            <X size={14} strokeWidth={1.5} />
          </IconButton>
        </div>

        {/* Balance */}
        <div className="flex flex-col gap-1 px-4 py-3 shrink-0 border-b border-border">
          <span className="text-[10px] text-foreground-muted uppercase tracking-wide">Total Balance</span>
          <span className="text-xl font-bold tabular-nums tracking-tight text-foreground">{formatUSD(balance)}</span>
          {totalBalance > 0 && (
            <span className="text-[10px] text-foreground-muted tabular-nums">
              {participation.toFixed(1)}% of total portfolio
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-border shrink-0 px-4 gap-0">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-3 py-2.5 text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-foreground"
                  : "text-foreground-muted hover:text-foreground-secondary"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-4 py-4">
          {activeTab === "overview" && (
            <OverviewTab
              wallet={wallet}
              transactions={transactions}
              walletId={wallet.id}
              holdings={holdings}
            />
          )}
          {activeTab === "holdings" && <HoldingsTab holdings={holdings} />}
          {activeTab === "history" && (
            <HistoryTab transactions={transactions} walletId={wallet.id} />
          )}
          {activeTab === "settings" && (
            <SettingsTab
              wallet={wallet}
              onEdit={w => { onEdit(w); onClose(); }}
              onArchive={w => { onArchive(w); onClose(); }}
              onDelete={w => { onDelete(w); onClose(); }}
              onToggleActive={handleToggleActive}
            />
          )}
        </div>
      </div>
    </Sheet>
  );
}
