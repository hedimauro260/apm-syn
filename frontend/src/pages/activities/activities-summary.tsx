import type { ElementType } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Scale, Receipt } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from "recharts";
import { startOfWeek, isWithinInterval, parseISO } from "date-fns";
import { useActivities } from "./use-activities";
import { isTxInbound, isTxOutbound, type ActivitiesScope } from "./activities-utils";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { formatUSD } from "@/lib/formats";

const BAR_COLORS: Record<string, string> = {
  inflow: "#22c55e",
  outflow: "#ef4444",
  net: "#3b82f6",
  count: "#60a5fa",
};

interface SummaryCardProps {
  icon: ElementType;
  iconClassName?: string;
  label: string;
  value: string;
  valueClassName?: string;
  secondaryText: string;
  chartData: { value: number; color: string }[];
  maxChartValue: number;
}

function SummaryCard({
  icon: Icon,
  iconClassName,
  label,
  value,
  valueClassName,
  secondaryText,
  chartData,
  maxChartValue,
}: SummaryCardProps) {
  return (
    <div className="flex justify-between gap-2 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated border border-border">
            <Icon className={`h-4 w-4 ${iconClassName ?? "text-foreground-muted"}`} />
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-foreground-muted">{label}</span>
            <span className={`text-base font-semibold tabular-nums text-foreground tracking-tight ${valueClassName ?? ""}`}>
              {value}
            </span>
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

function buildChartData(
  bars: string[],
  source: { date: string; value: number }[],
): { chartData: { value: number; color: string }[]; maxChartValue: number } {
  const chartData = source
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-12)
    .map((t, index) => ({
      value: t.value,
      color: BAR_COLORS[bars[index % bars.length]!] ?? "#3b82f6",
    }));
  const maxChartValue = chartData.length === 0 ? 100 : Math.max(...chartData.map(d => d.value)) * 1.2;
  return { chartData, maxChartValue };
}

export function ActivitiesSummary({ scope }: { scope: ActivitiesScope }) {
  const { scopedTransactions, isLoading, isError, refetchAll } = useActivities(scope);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-2">
        <LoadingState>Loading summary...</LoadingState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState
          title="Unable to load activity summary"
          description="Something went wrong while loading the activity summary."
          action={
            <Button variant="outline" size="sm" onClick={refetchAll}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const inflowTxs: { date: string; value: number }[] = [];
  const outflowTxs: { date: string; value: number }[] = [];
  const netTxs: { date: string; value: number }[] = [];

  let totalInflows = 0;
  let totalOutflows = 0;
  const outflowByDate = new Map<string, number>();
  const inflowByDate = new Map<string, number>();

  for (const tx of scopedTransactions) {
    const key = parseISO(tx.date).toDateString();
    if (isTxInbound(tx, scope)) {
      totalInflows += tx.usdValue;
      inflowTxs.push({ date: tx.date, value: tx.usdValue });
      inflowByDate.set(key, (inflowByDate.get(key) ?? 0) + tx.usdValue);
    }
    if (isTxOutbound(tx, scope)) {
      totalOutflows += tx.usdValue;
      outflowTxs.push({ date: tx.date, value: -tx.usdValue });
      outflowByDate.set(key, (outflowByDate.get(key) ?? 0) + tx.usdValue);
    }
  }

  const allDayKeys = new Set([...inflowByDate.keys(), ...outflowByDate.keys()]);
  for (const key of allDayKeys) {
    const value = (inflowByDate.get(key) ?? 0) - (outflowByDate.get(key) ?? 0);
    netTxs.push({ date: new Date(key).toISOString(), value });
  }

  const netTotal = totalInflows - totalOutflows;

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const now = new Date();
  let weeklyInflows = 0;
  let weeklyOutflows = 0;
  let weeklyCount = 0;

  for (const tx of scopedTransactions) {
    const d = parseISO(tx.date);
    if (!isWithinInterval(d, { start: weekStart, end: now })) continue;
    weeklyCount += 1;
    if (isTxInbound(tx, scope)) weeklyInflows += tx.usdValue;
    if (isTxOutbound(tx, scope)) weeklyOutflows += tx.usdValue;
  }

  const inflowChart = buildChartData(["inflow"], inflowTxs);
  const outflowChart = buildChartData(["outflow"], outflowTxs);
  const netChart = buildChartData(["net"], netTxs);
  const txnChart = buildChartData(["count"], scopedTransactions.map(tx => ({ date: tx.date, value: tx.usdValue })));

  const scopeLabel =
    scope === "all" ? "across all" : scope === "wallets" ? "wallet activity" : "website activity";

  return (
    <div className="flex w-96 flex-col gap-3">
      <SummaryCard
        icon={ArrowDownToLine}
        iconClassName="text-success"
        label="Total Inflows"
        value={formatUSD(totalInflows)}
        secondaryText={`${formatUSD(weeklyInflows)} this week`}
        chartData={inflowChart.chartData}
        maxChartValue={inflowChart.maxChartValue}
      />
      <SummaryCard
        icon={ArrowUpFromLine}
        iconClassName="text-danger"
        label="Total Outflows"
        value={formatUSD(totalOutflows)}
        secondaryText={`${formatUSD(weeklyOutflows)} this week`}
        chartData={outflowChart.chartData}
        maxChartValue={outflowChart.maxChartValue}
      />
      <SummaryCard
        icon={Scale}
        iconClassName={netTotal >= 0 ? "text-success" : "text-danger"}
        label="Net Movement"
        value={`${netTotal >= 0 ? "+" : "-"}${formatUSD(Math.abs(netTotal))}`}
        valueClassName={netTotal >= 0 ? "text-success" : "text-danger"}
        secondaryText={`${scopeLabel} · last 12 movements`}
        chartData={netChart.chartData}
        maxChartValue={netChart.maxChartValue}
      />
      <SummaryCard
        icon={Receipt}
        label="Transactions"
        value={String(scopedTransactions.length)}
        secondaryText={`${weeklyCount} this week`}
        chartData={txnChart.chartData}
        maxChartValue={txnChart.maxChartValue}
      />
    </div>
  );
}