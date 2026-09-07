import { useMemo } from "react";
import { TrendingUp, CalendarDays, CalendarRange, CalendarCheck } from "lucide-react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, subDays, startOfDay, endOfDay } from "date-fns";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";
import type { TransactionListParams } from "@/features/transactions/types/transaction.types";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { formatUSD } from "@/lib/formats";

const EARNINGS_COLOR = "#3b82f6";
const WITHDRAWN_COLOR = "#f59e0b";

interface DailyChartEntry {
  date: string;
  label: string;
  earnings: number;
  withdrawn: number;
}

function compactUSD(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${Math.round(value)}`;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: DailyChartEntry }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]!.payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground">{format(parseISO(data.date), "MMM d, yyyy")}</p>
      <p className="text-xs tabular-nums text-foreground-secondary">Earnings: {formatUSD(data.earnings)}</p>
      <p className="text-xs tabular-nums text-foreground-secondary">Withdrawn: {formatUSD(data.withdrawn)}</p>
    </div>
  );
}

interface PeriodCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  period: string;
}

function PeriodCard({ icon: Icon, title, value, period }: PeriodCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-elevated border border-border">
        <Icon className="h-4 w-4 text-foreground-muted" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[10px] font-medium text-foreground-muted">{title}</span>
        <span className="text-base font-semibold tabular-nums text-foreground tracking-tight">{value}</span>
        <span className="truncate text-[10px] text-foreground-secondary">{period}</span>
      </div>
    </div>
  );
}

export function DailyEarnings() {
  const query = useMemo<TransactionListParams>(
    () => {
      const now = new Date();
      return {
        limit: 100,
        sort: "-date",
        from: startOfDay(subDays(now, 29)).toISOString(),
        to: endOfDay(now).toISOString(),
      };
    },
    []
  );
  const transactionsQuery = useTransactionsQuery(query);
  const transactions = useMemo(() => transactionsQuery.data?.data ?? [], [transactionsQuery.data]);

  const { chartData, periods } = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const yesterdayStart = startOfDay(subDays(now, 1));
    const weekStart = startOfDay(subDays(now, 6));
    const monthStart = startOfDay(subDays(now, 29));
    const rangeEnd = endOfDay(now);

    const map = new Map<string, { earnings: number; withdrawn: number }>();
    const dayList: { date: string }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(now, i), "yyyy-MM-dd");
      map.set(date, { earnings: 0, withdrawn: 0 });
      dayList.push({ date });
    }

    let today = 0;
    let yesterday = 0;
    let last7 = 0;
    let last30 = 0;

    for (const tx of transactions) {
      const d = parseISO(tx.date);

      if (tx.type === "WEBSITE_EARNING" && tx.destination.type === "WEBSITE") {
        if (d >= monthStart) last30 += tx.usdValue;
        if (d >= weekStart) last7 += tx.usdValue;
        if (d >= yesterdayStart && d < todayStart) yesterday += tx.usdValue;
        if (d >= todayStart) today += tx.usdValue;
        if (d >= monthStart && d <= rangeEnd) {
          const entry = map.get(format(d, "yyyy-MM-dd"));
          if (entry) entry.earnings += tx.usdValue;
        }
      }

      if (tx.type === "WEBSITE_WITHDRAWAL" && tx.source.type === "WEBSITE") {
        if (d >= monthStart && d <= rangeEnd) {
          const entry = map.get(format(d, "yyyy-MM-dd"));
          if (entry) entry.withdrawn += tx.usdValue;
        }
      }
    }

    const chartData: DailyChartEntry[] = dayList.map(({ date }) => {
      const v = map.get(date)!;
      return {
        date,
        label: format(parseISO(date), "MMM d"),
        earnings: v.earnings,
        withdrawn: v.withdrawn,
      };
    });

    const periods = [
      {
        key: "today",
        icon: TrendingUp,
        title: "Earning Today",
        value: today,
        period: `Today · ${format(now, "MMM d, yyyy")}`,
      },
      {
        key: "yesterday",
        icon: CalendarDays,
        title: "Earning Yesterday",
        value: yesterday,
        period: `Yesterday · ${format(subDays(now, 1), "MMM d, yyyy")}`,
      },
      {
        key: "7d",
        icon: CalendarRange,
        title: "Last 7 days",
        value: last7,
        period: `${format(subDays(now, 6), "MMM d")} – ${format(now, "MMM d, yyyy")}`,
      },
      {
        key: "30d",
        icon: CalendarCheck,
        title: "Last 30 days",
        value: last30,
        period: `${format(subDays(now, 29), "MMM d")} – ${format(now, "MMM d, yyyy")}`,
      },
    ];

    return { chartData, periods };
  }, [transactions]);

  if (transactionsQuery.isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <LoadingState>Loading daily earnings...</LoadingState>
      </div>
    );
  }

  if (transactionsQuery.isError) {
    return (
      <div className="rounded-xl border border-border bg-surface">
        <ErrorState
          title="Unable to load daily earnings"
          description="Something went wrong while loading daily earnings."
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 flex flex-col rounded-xl border border-border bg-surface p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-foreground tracking-tight">Daily Earnings</h2>
            <p className="text-xs text-foreground-muted leading-snug">Last 30 days · sum across all sites</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] text-foreground-secondary">
              <span className="h-2 w-2 rounded-full" style={{ background: EARNINGS_COLOR }} />
              Earnings
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-foreground-secondary">
              <span className="h-2 w-2 rounded-sm" style={{ background: WITHDRAWN_COLOR }} />
              Withdrawn
            </span>
          </div>
        </div>
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={4}
                tick={{ fontSize: 10, fill: "var(--color-foreground-muted)" }}
                dy={6}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={compactUSD}
                tick={{ fontSize: 10, fill: "var(--color-foreground-muted)" }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-border-subtle)" }} />
              <Bar dataKey="withdrawn" fill={WITHDRAWN_COLOR} radius={[2, 2, 0, 0]} maxBarSize={10} />
              <Line
                dataKey="earnings"
                type="monotone"
                stroke={EARNINGS_COLOR}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {periods.map(p => (
          <PeriodCard key={p.key} icon={p.icon} title={p.title} value={formatUSD(p.value)} period={p.period} />
        ))}
      </div>
    </div>
  );
}