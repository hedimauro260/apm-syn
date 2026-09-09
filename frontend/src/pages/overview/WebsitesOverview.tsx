import { useMemo } from "react";
import { ArrowUpRight, Globe, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWebsitesQuery } from "@/features/websites/api/website-queries";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatUSD } from "@/lib/formats";
import { startOfWeek, isWithinInterval, parseISO } from "date-fns";

interface WebsiteSummary {
  id: string;
  name: string;
  balance: number;
  weeklyEarnings: number;
  weeklyWithdrawals: number;
}

export function WebsitesOverview() {
  const navigate = useNavigate();
  const websitesQuery = useWebsitesQuery({ limit: 100 });
  const transactionsQuery = useTransactionsQuery({ limit: 100, sort: "-date" });

  const isLoading = websitesQuery.isLoading || transactionsQuery.isLoading;
  const isError = websitesQuery.isError || transactionsQuery.isError;

  const websites = useMemo(() => websitesQuery.data?.data ?? [], [websitesQuery.data]);
  const transactions = useMemo(() => transactionsQuery.data?.data ?? [], [transactionsQuery.data]);

  const websiteSummaries: WebsiteSummary[] = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const balances = new Map<string, number>();
    const weeklyEarnings = new Map<string, number>();
    const weeklyWithdrawals = new Map<string, number>();

    for (const w of websites) {
      balances.set(w.id, 0);
      weeklyEarnings.set(w.id, 0);
      weeklyWithdrawals.set(w.id, 0);
    }

    for (const tx of transactions) {
      const d = parseISO(tx.date);

      if (tx.destination.type === "WEBSITE" && tx.destination.id) {
        balances.set(tx.destination.id, (balances.get(tx.destination.id) ?? 0) + tx.usdValue);
        if (tx.type === "WEBSITE_EARNING" && isWithinInterval(d, { start: weekStart, end: now })) {
          weeklyEarnings.set(tx.destination.id, (weeklyEarnings.get(tx.destination.id) ?? 0) + tx.usdValue);
        }
      }
      if (tx.source.type === "WEBSITE" && tx.source.id) {
        balances.set(tx.source.id, (balances.get(tx.source.id) ?? 0) - tx.usdValue);
        if (tx.type === "WEBSITE_WITHDRAWAL" && isWithinInterval(d, { start: weekStart, end: now })) {
          weeklyWithdrawals.set(tx.source.id, (weeklyWithdrawals.get(tx.source.id) ?? 0) + tx.usdValue);
        }
      }
    }

    return websites
      .map(w => ({
        id: w.id,
        name: w.name,
        balance: Math.max(0, balances.get(w.id) ?? 0),
        weeklyEarnings: weeklyEarnings.get(w.id) ?? 0,
        weeklyWithdrawals: weeklyWithdrawals.get(w.id) ?? 0,
      }))
      .filter(w => w.balance > 0 || w.weeklyEarnings > 0 || w.weeklyWithdrawals > 0)
      .sort((a, b) => b.balance - a.balance);
  }, [websites, transactions]);

  const totalBalance = useMemo(() => websiteSummaries.reduce((sum, w) => sum + w.balance, 0), [websiteSummaries]);
  const totalWeeklyEarnings = useMemo(() => websiteSummaries.reduce((sum, w) => sum + w.weeklyEarnings, 0), [websiteSummaries]);
  const totalWeeklyWithdrawals = useMemo(() => websiteSummaries.reduce((sum, w) => sum + w.weeklyWithdrawals, 0), [websiteSummaries]);
  const activeSites = websites.filter(w => w.status === "active").length;
  const totalSites = websites.length;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Websites Overview</h2>
        <LoadingState>Loading websites...</LoadingState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Websites Overview</h2>
        <ErrorState
          title="Unable to load websites"
          description={`${websitesQuery.error?.message ?? transactionsQuery.error?.message ?? "Something went wrong while loading websites overview."}`}
          action={
            <Button variant="outline" size="sm" onClick={() => { websitesQuery.refetch(); transactionsQuery.refetch(); }}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (websiteSummaries.length === 0 && totalSites === 0) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Websites Overview</h2>
          <Button variant="ghost" size="sm" className="text-xs h-7 px-2 gap-1" onClick={() => navigate("/app/websites")}>
            View Websites
            <ArrowUpRight className="h-3 w-3" />
          </Button>
        </div>
        <EmptyState
          icon={<Globe className="h-12 w-12" />}
          title="No websites yet"
          description="Add a website to track earnings and withdrawals."
          action={
            <Button variant="primary" size="sm" className="text-xs" onClick={() => navigate("/app/websites")}>
              Add Website
            </Button>
          }
        />
      </div>
    );
  }

  const topSites = websiteSummaries.slice(0, 5);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Websites Overview</h2>
        <Button variant="ghost" size="sm" className="text-xs h-7 px-2 gap-1" onClick={() => navigate("/app/websites")}>
          View Websites
          <ArrowUpRight className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-elevated p-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border shrink-0">
              <Globe className="h-4 w-4 text-primary" />
            </span>
            <span className="text-[10px] font-medium text-foreground-muted">Total Balance</span>
          </div>
          <div className="flex flex-col items-end min-w-0">
            <span className="text-base font-semibold tabular-nums text-foreground tracking-tight">{formatUSD(totalBalance)}</span>
            <span className="text-[10px] text-foreground-secondary">Across {totalSites} {totalSites === 1 ? "site" : "sites"}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-elevated p-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border shrink-0">
              <TrendingUp className="h-4 w-4 text-success" />
            </span>
            <span className="text-[10px] font-medium text-foreground-muted">Earnings This Week</span>
          </div>
          <div className="flex flex-col items-end min-w-0">
            <span className="text-base font-semibold tabular-nums text-success tracking-tight">{formatUSD(totalWeeklyEarnings)}</span>
            <span className="text-[10px] text-foreground-secondary">Website earnings</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-elevated p-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border shrink-0">
              <TrendingDown className="h-4 w-4 text-danger" />
            </span>
            <span className="text-[10px] font-medium text-foreground-muted">Withdrawn This Week</span>
          </div>
          <div className="flex flex-col items-end min-w-0">
            <span className="text-base font-semibold tabular-nums text-danger tracking-tight">{formatUSD(totalWeeklyWithdrawals)}</span>
            <span className="text-[10px] text-foreground-secondary">Website withdrawals</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-elevated p-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border shrink-0">
              <Globe className="h-4 w-4 text-info" />
            </span>
            <span className="text-[10px] font-medium text-foreground-muted">Active Sites</span>
          </div>
          <div className="flex flex-col items-end min-w-0">
            <span className="text-base font-semibold tabular-nums text-foreground tracking-tight">{activeSites}</span>
            <span className="text-[10px] text-foreground-secondary">of {totalSites} registered</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <h3 className="text-[10px] font-medium text-foreground-muted uppercase tracking-wide mb-2">Top Websites</h3>
        <ul className="flex flex-col divide-y divide-border-subtle">
          {topSites.map(site => (
            <li key={site.id} className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-3 items-center py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-elevated border border-border shrink-0">
                  <Globe className="h-3.5 w-3.5 text-foreground-muted" />
                </span>
                <span className="truncate text-xs font-medium text-foreground" title={site.name}>{site.name}</span>
              </div>
              <div className="flex items-end min-w-0">
                <span className="text-xs font-semibold tabular-nums text-foreground text-right">{formatUSD(site.balance)}</span>
              </div>
              <div className="flex items-end min-w-0">
                <span className="text-[10px] tabular-nums text-success text-right">+{formatUSD(site.weeklyEarnings)}</span>
              </div>
              <div className="flex items-end min-w-0">
                <span className="text-[10px] tabular-nums text-danger text-right">-{formatUSD(site.weeklyWithdrawals)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}