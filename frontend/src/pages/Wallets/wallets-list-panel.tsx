import { useMemo } from "react";
import { Wallet } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useWalletList } from "@/hooks/use-wallet-list";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { useWalletAssets } from "@/hooks/use-wallet-assets";
import { formatUSD } from "@/lib/formats";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ActionButtons, MoreDropdown } from "./cards-wallets";
import type { Wallet as WalletType } from "@/features/wallets/types/wallet.types";

const ICON_SIZE = 14;
const ICON_STROKE = 1;

type TxTab = "deposit" | "withdraw" | "transfer" | "adjust";

interface ChartEntry {
  date: string;
  label: string;
  value: number;
}

function AreaTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-md">
      <p className="text-xs tabular-nums text-foreground-secondary">{formatUSD(payload[0]!.value)}</p>
    </div>
  );
}

function BalanceTrendChart({ data }: { data: ChartEntry[] }) {
  if (data.length === 0) {
    return <div className="flex h-full items-center justify-center text-[10px] text-foreground-muted">No balance data in this period</div>;
  }

  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const base = minValue >= 0 ? 0 : minValue * 1.1;
  const top = maxValue * 1.1;

  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" hide />
          <YAxis hide domain={[base, top]} />
          <ReferenceLine y={base} stroke="#374151" strokeDasharray="3 3" strokeWidth={1} />
          <Tooltip content={<AreaTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#balanceFill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WalletsListPanel({
  onTransaction,
  onEdit,
  onArchive,
  onDelete,
}: {
  onTransaction?: (tab: TxTab, wallet: WalletType) => void;
  onEdit?: (wallet: WalletType) => void;
  onArchive?: (wallet: WalletType) => void;
  onDelete?: (wallet: WalletType) => void;
}) {
  const { isLoading, isError, wallets, transactions, refetchAll } = useWalletList();
  const { rows, hasNegative, totalBalance } = useWalletBalances(wallets, transactions);
  const { getAssetCount } = useWalletAssets(transactions);

  const targetWallet = (rows.length > 0 ? wallets.find(w => w.id === rows[0]!.id) : undefined) ?? null;

  const topRows = rows.slice(0, 5);

  const trendData: ChartEntry[] = useMemo(() => {
    const sorted = [...transactions]
      .filter(tx => tx.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const points: ChartEntry[] = [];
    let running = 0;
    for (const tx of sorted) {
      if (tx.destination.type === "WALLET") running += tx.usdValue;
      if (tx.source.type === "WALLET") running -= tx.usdValue;
      points.push({
        date: tx.date,
        label: "",
        value: running,
      });
    }
    if (points.length === 0) return points;
    return points.slice(-12);
  }, [transactions]);

  const headerActions = (
    <div className="flex items-center gap-1">
      <ActionButtons
        onDeposit={onTransaction ? () => targetWallet && onTransaction("deposit", targetWallet) : undefined}
        onWithdraw={onTransaction ? () => targetWallet && onTransaction("withdraw", targetWallet) : undefined}
        onTransfer={onTransaction ? () => targetWallet && onTransaction("transfer", targetWallet) : undefined}
        onAdjust={onTransaction ? () => targetWallet && onTransaction("adjust", targetWallet) : undefined}
      />
      <MoreDropdown
        onEdit={onEdit && targetWallet ? () => onEdit(targetWallet) : undefined}
        onArchive={onArchive && targetWallet ? () => onArchive(targetWallet) : undefined}
        onDelete={onDelete && targetWallet ? () => onDelete(targetWallet) : undefined}
      />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 w-full lg:w-120 border border-border bg-surface rounded-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Wallets</h2>
        </div>
        <LoadingState>Loading wallets...</LoadingState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4 p-4 w-full lg:w-120 border border-border bg-surface rounded-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Wallets</h2>
        </div>
        <ErrorState
          title="Unable to load wallets"
          description="Something went wrong while loading wallets."
          action={
            <Button variant="outline" size="xs" onClick={refetchAll}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (hasNegative) {
    return (
      <div className="flex flex-col gap-4 p-4 w-full lg:w-120 border border-border bg-surface rounded-xl">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Wallets</h2>
        </div>
        <ErrorState
          title="Negative balance detected"
          description={`One or more wallets have negative balance (total ${formatUSD(totalBalance)}). This should not happen.`}
          action={
            <Button variant="outline" size="xs" onClick={refetchAll}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-4 w-full lg:w-120 border border-border bg-surface rounded-xl">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Wallets</h2>
        </div>
        <EmptyState title="No wallets yet" description="Create your first wallet to get started." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 w-full lg:w-120 border border-border bg-surface rounded-xl">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Wallets</h2>
        {headerActions}
      </div>

      <ul className="flex flex-col divide-y divide-border-subtle">
        {topRows.map(row => (
          <li key={row.id} className="grid grid-cols-[32px_1fr_1fr_1fr_96px] gap-3 items-center py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border shrink-0">
              <Wallet size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-foreground-muted" />
            </span>

            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-medium text-foreground" title={row.name}>
                {row.name}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-foreground-muted truncate">{row.type}</span>
            </div>

            <div className="flex items-end min-w-0">
              <span className="text-xs font-semibold tabular-nums text-foreground tracking-tight">{formatUSD(row.balance)}</span>
            </div>
            <div className="flex items-end min-w-0">
              <span className="text-[10px] text-foreground-muted">{getAssetCount(row.id)} assets</span>
            </div>

            <div className="flex flex-col gap-1 w-24">
              <span className="text-[10px] tabular-nums text-foreground-secondary text-right">
                {row.participation.toFixed(1)}%
              </span>
              <div className="h-1.5 w-full rounded-full bg-border-subtle overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, row.participation)}%`, background: row.color }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
      {/** Grafico */}
      <div className="flex-1 border-t border-border pt-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-medium text-foreground-muted">Balance evolution</span>
          <span className="text-[10px] tabular-nums text-foreground-secondary">
            {trendData.length > 0 ? formatUSD(trendData[trendData.length - 1]!.value) : "-"}
          </span>
        </div>
        <BalanceTrendChart data={trendData} />
      </div>
    </div>
  );
}
