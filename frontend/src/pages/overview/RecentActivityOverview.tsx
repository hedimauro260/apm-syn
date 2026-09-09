import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  CircleDollarSign,
  Wallet,
  Globe,
  ArrowRightLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";
import { useWalletsQuery } from "@/features/wallets/api/wallet-queries";
import { useWebsitesQuery } from "@/features/websites/api/website-queries";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatUSD } from "@/lib/formats";
import { getCoinLogoUrl } from "@/features/assets/logo";
import type { Transaction, TransactionType } from "@/features/transactions/types/transaction.types";

const ICON_SIZE = 12;
const ICON_STROKE = 1;
const RECENT_COUNT = 20;

const GRID_COLS =
  "grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)_minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]";

const TYPE_OPTIONS: { value: TransactionType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "WALLET_DEPOSIT", label: "Deposit" },
  { value: "WALLET_WITHDRAWAL", label: "Withdrawal" },
  { value: "WALLET_TRANSFER", label: "Transfer" },
  { value: "WALLET_ADJUSTMENT", label: "Adjustment" },
  { value: "WEBSITE_EARNING", label: "Earning" },
  { value: "WEBSITE_WITHDRAWAL", label: "Site withdrawal" },
];

const ACTIVITY_TYPE_LABELS: Record<Transaction["type"], string> = {
  WALLET_DEPOSIT: "Deposit",
  WALLET_WITHDRAWAL: "Withdrawal",
  WALLET_TRANSFER: "Transfer",
  WALLET_ADJUSTMENT: "Adjustment",
  WEBSITE_EARNING: "Earning",
  WEBSITE_WITHDRAWAL: "Site withdrawal",
};

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  const isCurrentYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(
    "en-US",
    isCurrentYear
      ? { month: "short", day: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" },
  );
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isTxInbound(tx: Transaction): boolean {
  if (tx.type === "WALLET_DEPOSIT" || tx.type === "WEBSITE_EARNING") return true;
  if (tx.type === "WALLET_WITHDRAWAL") return false;
  if (tx.type === "WEBSITE_WITHDRAWAL") return tx.destination.type === "WALLET";
  if (tx.type === "WALLET_TRANSFER") return tx.destination.type === "WALLET";
  if (tx.type === "WALLET_ADJUSTMENT") return tx.usdValue > 0;
  return false;
}

function isTxOutbound(tx: Transaction): boolean {
  if (tx.type === "WALLET_WITHDRAWAL") return true;
  if (tx.type === "WALLET_DEPOSIT" || tx.type === "WEBSITE_EARNING") return false;
  if (tx.type === "WEBSITE_WITHDRAWAL") return tx.source.type === "WEBSITE";
  if (tx.type === "WALLET_TRANSFER") return tx.source.type === "WALLET";
  if (tx.type === "WALLET_ADJUSTMENT") return tx.usdValue < 0;
  return false;
}

function ActivityIcon({ tx }: { tx: Transaction }) {
  switch (tx.type) {
    case "WALLET_DEPOSIT":
    case "WEBSITE_EARNING":
      return <ArrowDownToLine size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-success" />;
    case "WALLET_WITHDRAWAL":
      return <ArrowUpFromLine size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-danger" />;
    case "WEBSITE_WITHDRAWAL":
      return isTxInbound(tx) ? (
        <ArrowDownToLine size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-success" />
      ) : (
        <ArrowUpFromLine size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-danger" />
      );
    case "WALLET_TRANSFER":
      return <ArrowLeftRight size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-info" />;
    case "WALLET_ADJUSTMENT":
      return <CircleDollarSign size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-warning" />;
    default:
      return <CircleDollarSign size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-foreground-muted" />;
  }
}

function PartnerLabel({
  tx,
  walletNames,
  websiteNames,
}: {
  tx: Transaction;
  walletNames: Map<string, string>;
  websiteNames: Map<string, string>;
}) {
  const getName = (p: { type: string; id?: string }) => {
    if (p.type === "WALLET") return walletNames.get(p.id ?? "") ?? "Wallet";
    if (p.type === "WEBSITE") return websiteNames.get(p.id ?? "") ?? "Website";
    return null;
  };

  const isBothSide = tx.type === "WALLET_TRANSFER" || tx.type === "WEBSITE_WITHDRAWAL";

  if (isBothSide) {
    const src = getName(tx.source);
    const dst = getName(tx.destination);
    return (
      <div className="flex items-center gap-1 min-w-0 text-[10px] text-foreground-secondary">
        <span className="truncate">{src ?? tx.source.type}</span>
        <ArrowRightLeft size={9} strokeWidth={1.5} className="text-foreground-muted shrink-0" />
        <span className="truncate">{dst ?? tx.destination.type}</span>
      </div>
    );
  }

  const src = getName(tx.source);
  const dst = getName(tx.destination);
  const partner = src ?? dst ?? "—";
  return (
    <span className="truncate text-[10px] text-foreground-secondary">{partner}</span>
  );
}

export function RecentActivityOverview() {
  const navigate = useNavigate();
  const transactionsQuery = useTransactionsQuery({ limit: 100, sort: "-date" });
  const walletsQuery = useWalletsQuery({ limit: 100 });
  const websitesQuery = useWebsitesQuery({ limit: 100 });

  const isLoading = transactionsQuery.isLoading || walletsQuery.isLoading || websitesQuery.isLoading;
  const isError = transactionsQuery.isError;

  const transactions = useMemo(() => transactionsQuery.data?.data ?? [], [transactionsQuery.data]);

  const walletNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const w of walletsQuery.data?.data ?? []) map.set(w.id, w.name);
    return map;
  }, [walletsQuery.data]);

  const websiteNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const w of websitesQuery.data?.data ?? []) map.set(w.id, w.name);
    return map;
  }, [websitesQuery.data]);

  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");

  const recent = useMemo(() => {
    return [...transactions]
      .filter(tx => {
        if (typeFilter !== "all" && tx.type !== typeFilter) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, RECENT_COUNT);
  }, [transactions, typeFilter]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <LoadingState>Loading recent activity...</LoadingState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState
          title="Unable to load recent activity"
          description="Something went wrong while loading recent activity."
          action={
            <Button variant="outline" size="sm" onClick={() => transactionsQuery.refetch()}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Recent Activity</h2>
        <span className="text-[10px] text-foreground-muted tabular-nums">
          {recent.length} {recent.length === 1 ? "activity" : "activities"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as TransactionType | "all")}
          className="h-8 w-full lg:w-40 text-xs"
          aria-label="Filter by transaction type"
        >
          {TYPE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          title="No recent activity"
          description="Your latest transactions will appear here."
          className="py-8"
        />
      ) : (
        <>
          <div
            className={`grid ${GRID_COLS} gap-2 px-3 py-1.5 bg-surface-elevated border border-border rounded-lg text-[9px] font-medium text-foreground-muted uppercase tracking-wide items-center`}
          >
            <span>Activity</span>
            <span>Partners</span>
            <span>Asset</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Date</span>
          </div>

          <ul className="flex flex-col divide-y divide-border-subtle">
            {recent.map(tx => {
              const inbound = isTxInbound(tx);
              const outbound = isTxOutbound(tx);
              const signed = inbound && !outbound ? "+" : outbound && !inbound ? "-" : "";
              const amountClass =
                inbound && !outbound
                  ? "text-success"
                  : outbound && !inbound
                    ? "text-danger"
                    : "text-foreground";

              return (
                <li
                  key={tx.id}
                  className={`grid ${GRID_COLS} gap-2 items-center py-2 px-1 min-w-0`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-elevated border border-border shrink-0">
                      <ActivityIcon tx={tx} />
                    </span>
                    <span className="truncate text-xs font-medium text-foreground">
                      {ACTIVITY_TYPE_LABELS[tx.type]}
                    </span>
                  </div>

                  <PartnerLabel tx={tx} walletNames={walletNames} websiteNames={websiteNames} />

                  <div className="flex items-center gap-1.5 min-w-0">
                    <img
                      src={getCoinLogoUrl(tx.asset.externalId, "thumb")}
                      alt={tx.asset.symbol}
                      className="h-4 w-4 rounded-full shrink-0"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="text-[10px] font-medium tabular-nums text-foreground truncate">
                      {tx.quantity.toLocaleString()}
                    </span>
                  </div>

                  <span className={`text-xs font-semibold tabular-nums text-right ${amountClass}`}>
                    {signed}
                    {formatUSD(tx.usdValue)}
                  </span>

                  <div className="flex flex-col items-end min-w-0">
                    <span className="text-[10px] font-medium text-foreground tabular-nums">
                      {formatShortDate(tx.date)}
                    </span>
                    <span className="text-[9px] text-foreground-muted tabular-nums">
                      {formatTime(tx.date)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => navigate("/app/wallets")}
        >
          <Wallet className="h-3.5 w-3.5" />
          Wallets
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => navigate("/app/websites")}
        >
          <Globe className="h-3.5 w-3.5" />
          Websites
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => navigate("/app/activities")}
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          All Activity
        </Button>
      </div>
    </div>
  );
}
