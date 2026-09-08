import { useMemo, useState } from "react";
import {
  Search,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  CircleDollarSign,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useActivities } from "./use-activities";
import {
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPE_ORDER,
  isTxInbound,
  isTxOutbound,
  participantLabel,
  type ActivitiesScope,
} from "./activities-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { formatUSD } from "@/lib/formats";
import { getCoinLogoUrl } from "@/features/assets/logo";
import type { Transaction, TransactionType } from "@/features/transactions/types/transaction.types";

const ICON_SIZE = 14;
const ICON_STROKE = 1;
const PAGE_SIZE = 15;

const GRID_COLS_CLASS =
  "grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1fr)]";

function formatDateOnly(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeOnly(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActivityIcon({ tx, scope }: { tx: Transaction; scope: ActivitiesScope }) {
  const inbound = isTxInbound(tx, scope);
  switch (tx.type) {
    case "WALLET_DEPOSIT":
    case "WEBSITE_EARNING":
      return <ArrowDownToLine size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-success" />;
    case "WALLET_WITHDRAWAL":
      return <ArrowUpFromLine size={ICON_SIZE} strokeWidth={ICON_STROKE} className="text-danger" />;
    case "WEBSITE_WITHDRAWAL":
      return inbound ? (
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

function GoalBadge() {
  return (
    <SimpleTooltip label="Counts toward a goal" side="top">
      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-elevated px-1.5 py-0.5 text-[9px] font-medium text-foreground-secondary">
        <Target size={9} strokeWidth={1.5} />
        Goal
      </span>
    </SimpleTooltip>
  );
}

export function ActivitiesHistory({ scope }: { scope: ActivitiesScope }) {
  const { scopedTransactions, wallets, websites, walletNames, websiteNames, isLoading, isError, refetchAll } =
    useActivities(scope);

  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 250);
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [walletFilter, setWalletFilter] = useState("all");
  const [websiteFilter, setWebsiteFilter] = useState("all");
  const [page, setPage] = useState(1);

  const handleSearch = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleTypeFilter = (value: "all" | TransactionType) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleWalletFilter = (value: string) => {
    setWalletFilter(value);
    setPage(1);
  };

  const handleWebsiteFilter = (value: string) => {
    setWebsiteFilter(value);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedTransactions
      .filter(tx => {
        if (typeFilter !== "all" && tx.type !== typeFilter) return false;

        if (walletFilter !== "all") {
          const matches =
            (tx.source.type === "WALLET" && tx.source.id === walletFilter) ||
            (tx.destination.type === "WALLET" && tx.destination.id === walletFilter);
          if (!matches) return false;
        }

        if (websiteFilter !== "all") {
          const matches =
            (tx.source.type === "WEBSITE" && tx.source.id === websiteFilter) ||
            (tx.destination.type === "WEBSITE" && tx.destination.id === websiteFilter);
          if (!matches) return false;
        }

        if (q) {
          const haystack = [
            ACTIVITY_TYPE_LABELS[tx.type],
            tx.description ?? "",
            tx.asset.symbol,
            tx.asset.name,
            participantLabel(tx.source, walletNames, websiteNames),
            participantLabel(tx.destination, walletNames, websiteNames),
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [scopedTransactions, typeFilter, walletFilter, websiteFilter, search, walletNames, websiteNames]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <LoadingState>Loading activity history...</LoadingState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState
          title="Unable to load activity history"
          description="Something went wrong while loading the activity history."
          action={
            <Button variant="outline" size="sm" onClick={refetchAll}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const showWalletFilter = scope !== "websites";
  const showWebsiteFilter = scope !== "wallets";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Activity History</h2>
        <span className="text-xs tabular-nums text-foreground-muted">
          {filtered.length} {filtered.length === 1 ? "activity" : "activities"}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        <div className="relative w-full lg:w-64">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none" />
          <Input
            placeholder="Search by asset, description or partner..."
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
            className="h-10 pl-8 text-xs"
            aria-label="Search activities"
          />
        </div>

        <Select
          value={typeFilter}
          onChange={e => handleTypeFilter(e.target.value as "all" | TransactionType)}
          className="lg:w-48 h-10 text-xs"
          aria-label="Filter by transaction type"
        >
          <option value="all">All types</option>
          {ACTIVITY_TYPE_ORDER.map(type => (
            <option key={type} value={type}>
              {ACTIVITY_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>

        {showWalletFilter && (
          <Select
            value={walletFilter}
            onChange={e => handleWalletFilter(e.target.value)}
            className="lg:w-48 h-10 text-xs"
            aria-label="Filter by wallet"
          >
            <option value="all">All wallets</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
        )}

        {showWebsiteFilter && (
          <Select
            value={websiteFilter}
            onChange={e => handleWebsiteFilter(e.target.value)}
            className="lg:w-48 h-10 text-xs"
            aria-label="Filter by website"
          >
            <option value="all">All websites</option>
            {websites.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      {scopedTransactions.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Financial history from your wallets and websites will show up here."
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="No activities match your filters" description="Try adjusting the search or filters above." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <div
            className={`grid ${GRID_COLS_CLASS} gap-3 px-4 py-2 bg-surface-elevated border-b border-border text-[10px] font-medium text-foreground-muted uppercase tracking-wide items-center min-w-max`}
          >
            <span>Activity</span>
            <span>Partners</span>
            <span>Asset</span>
            <span>Amount</span>
            <span className="text-right">Date</span>
          </div>

          <ul className="flex flex-col divide-y divide-border-subtle">
            {pageRows.map(tx => {
              const inbound = isTxInbound(tx, scope);
              const outbound = isTxOutbound(tx, scope);
              const signed = inbound && !outbound ? "+" : outbound && !inbound ? "-" : "";
              const amountClass =
                inbound && !outbound
                  ? "text-success"
                  : outbound && !inbound
                    ? "text-danger"
                    : "text-foreground";

              return (
                <li key={tx.id}>
                  <div
                    className={`grid ${GRID_COLS_CLASS} gap-3 px-4 py-3 min-w-max items-center hover:bg-surface-elevated/50 transition-colors`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border shrink-0">
                        <ActivityIcon tx={tx} scope={scope} />
                      </span>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="truncate text-xs font-medium text-foreground">
                            {ACTIVITY_TYPE_LABELS[tx.type]}
                          </span>
                          {tx.countsTowardGoal && <GoalBadge />}
                        </div>
                        <span className="truncate text-[10px] text-foreground-muted">
                          {tx.description || "—"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-foreground-secondary min-w-0">
                      <span className="truncate">{participantLabel(tx.source, walletNames, websiteNames)}</span>
                      <ArrowLeftRight size={10} strokeWidth={1.5} className="text-foreground-muted shrink-0" />
                      <span className="truncate">{participantLabel(tx.destination, walletNames, websiteNames)}</span>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={getCoinLogoUrl(tx.asset.externalId, "thumb")}
                        alt={tx.asset.symbol}
                        className="h-5 w-5 rounded-full shrink-0"
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="flex min-w-0">
                        {/* <span className="truncate text-xs font-medium text-foreground">{tx.asset.symbol}</span> */}
                        <span className="tabular-nums text-xs font-medium text-foreground">
                          {tx.quantity.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <span className={`text-xs font-semibold tabular-nums ${amountClass}`}>
                      {signed}
                      {formatUSD(tx.usdValue)}
                    </span>

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-foreground truncate text-right">{formatDateOnly(tx.date)}</span>
                      <span className="text-[10px] text-foreground-muted tabular-nums text-right truncate">
                        {formatTimeOnly(tx.date)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] text-foreground-muted tabular-nums">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs"
              disabled={safePage <= 1}
              aria-label="Previous page"
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-[10px] text-foreground-muted tabular-nums px-1">
              {safePage} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs"
              disabled={safePage >= pageCount}
              aria-label="Next page"
              onClick={() => setPage(p => Math.min(pageCount, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}