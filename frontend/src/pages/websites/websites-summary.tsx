import { useMemo } from "react";
import { Globe, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { startOfWeek, isWithinInterval, parseISO, startOfDay } from "date-fns";
import { BarChart, Bar, Cell, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from "recharts";
import { useWebsitesQuery } from "@/features/websites/api/website-queries";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";
import type { Website } from "@/features/websites/types/website.types";
import type { Transaction } from "@/features/transactions/types/transaction.types";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { formatUSD } from "@/lib/formats";

const BAR_COLORS = ["#1e40af", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

const EMPTY_WEBSITES: Website[] = [];
const EMPTY_TRANSACTIONS: Transaction[] = [];

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  secondaryText: string;
  chartData: { value: number; color: string }[];
  maxChartValue: number;
}

function SummaryCard({ icon: Icon, label, value, secondaryText, chartData, maxChartValue }: SummaryCardProps) {
  return (
    <div className="flex justify-between gap-2 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated border border-border">
            <Icon className="h-4 w-4 text-foreground-muted" />
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-foreground-muted">{label}</span>
            <span className="text-base font-semibold tabular-nums text-foreground tracking-tight">{value}</span>
          </div>
        </div>
        <div className="mt-0">
          <span className="text-[10px] text-foreground-secondary">{secondaryText}</span>
        </div>
      </div>
      <div className="w-40 h-16">
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
    </div>
  );
}

function buildChartData(source: { date: string; value: number }[]): { chartData: { value: number; color: string }[]; maxChartValue: number } {
  const chartData = source
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-12)
    .map((t, index) => ({
      value: t.value,
      color: BAR_COLORS[index % BAR_COLORS.length],
    }));
  const maxChartValue = chartData.length === 0 ? 100 : Math.max(...chartData.map(d => d.value)) * 1.2;
  return { chartData, maxChartValue };
}

export function WebsitesSummary() {
  const websitesQuery = useWebsitesQuery({ limit: 100 });
  const transactionsQuery = useTransactionsQuery({ limit: 100, sort: "-date" });

  const websites = websitesQuery.data?.data ?? EMPTY_WEBSITES;
  const transactions = transactionsQuery.data?.data ?? EMPTY_TRANSACTIONS;

  const isLoading = websitesQuery.isLoading || transactionsQuery.isLoading;
  const isError = websitesQuery.isError || transactionsQuery.isError;

  const websiteBalances = useMemo(() => {
    const balances = new Map<string, number>();
    for (const w of websites) balances.set(w.id, 0);

    for (const tx of transactions) {
      if (tx.destination.type === "WEBSITE" && tx.destination.id) {
        balances.set(tx.destination.id, (balances.get(tx.destination.id) ?? 0) + tx.usdValue);
      }
      if (tx.source.type === "WEBSITE" && tx.source.id) {
        balances.set(tx.source.id, (balances.get(tx.source.id) ?? 0) - tx.usdValue);
      }
    }

    return balances;
  }, [websites, transactions]);

  const totalBalance = useMemo(() => {
    let total = 0;
    for (const v of websiteBalances.values()) {
      if (v > 0) total += v;
    }
    return total;
  }, [websiteBalances]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-2">
        <LoadingState>Loading summary...</LoadingState>
      </div>
    );
  }

  if (isError) {
    const handleRetry = () => {
      if (websitesQuery.isError) websitesQuery.refetch();
      if (transactionsQuery.isError) transactionsQuery.refetch();
    };
    return (
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState
          title="Unable to load summary"
          description="Something went wrong while loading websites summary."
          action={
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const totalSites = websitesQuery.data?.pagination?.total ?? websites.length;
  const activeSites = websites.filter(w => w.status === "active").length;

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  let todayEarnings = 0;
  let weeklyEarnings = 0;
  let weeklyWithdrawals = 0;

  const earningTxs: { date: string; value: number }[] = [];
  const withdrawalTxs: { date: string; value: number }[] = [];
  const balanceTxs: { date: string; value: number }[] = [];

  for (const tx of transactions) {
    const isWebsiteEarning = tx.type === "WEBSITE_EARNING" && tx.destination.type === "WEBSITE";
    const isWebsiteWithdrawal = tx.type === "WEBSITE_WITHDRAWAL" && tx.source.type === "WEBSITE";

    if (isWebsiteEarning) {
      const d = parseISO(tx.date);
      if (d >= todayStart) todayEarnings += tx.usdValue;
      if (isWithinInterval(d, { start: weekStart, end: now })) weeklyEarnings += tx.usdValue;
      earningTxs.push({ date: tx.date, value: tx.usdValue });
    }

    if (isWebsiteWithdrawal) {
      const d = parseISO(tx.date);
      if (isWithinInterval(d, { start: weekStart, end: now })) weeklyWithdrawals += tx.usdValue;
      withdrawalTxs.push({ date: tx.date, value: -tx.usdValue });
    }

    let balValue = 0;
    if (tx.destination.type === "WEBSITE") balValue += tx.usdValue;
    if (tx.source.type === "WEBSITE") balValue -= tx.usdValue;
    if (balValue !== 0) {
      balanceTxs.push({ date: tx.date, value: balValue });
    }
  }

  const balanceChart = buildChartData(balanceTxs);
  const earningChart = buildChartData(earningTxs);
  const withdrawalChart = buildChartData(withdrawalTxs);

  return (
    <div className="flex flex-col gap-3">
      <SummaryCard
        icon={Globe}
        label="Total Balance"
        value={formatUSD(totalBalance)}
        secondaryText={`Across ${totalSites} ${totalSites === 1 ? "site" : "sites"}`}
        chartData={balanceChart.chartData}
        maxChartValue={balanceChart.maxChartValue}
      />
      <SummaryCard
        icon={TrendingUp}
        label="Earnings Today"
        value={formatUSD(todayEarnings)}
        secondaryText={`${formatUSD(weeklyEarnings)}\nThis week`}
        chartData={earningChart.chartData}
        maxChartValue={earningChart.maxChartValue}
      />
      <SummaryCard
        icon={TrendingDown}
        label="Withdrawn"
        value={formatUSD(weeklyWithdrawals)}
        secondaryText={`${formatUSD(weeklyWithdrawals)}\nThis week`}
        chartData={withdrawalChart.chartData}
        maxChartValue={withdrawalChart.maxChartValue}
      />
      <SummaryCard
        icon={Activity}
        label="Active Sites"
        value={`${activeSites}`}
        secondaryText={`of ${totalSites} registered sites`}
        chartData={[]}
        maxChartValue={100}
      />
    </div>
  );
}
