import { useMemo, useState, useRef } from "react";
import {
  addMonths,
  subMonths,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight, Flame, Calendar } from "lucide-react";
import { useTransactionsQuery } from "@/features/transactions/api/transaction-queries";

const WEEK_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function dateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Convert UTC ISO date string to a local Date at noon (avoids DST edge issues). */
function toLocalDate(iso: string): Date {
  const d = parseISO(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
}

interface DepositCalendarProps {
  variant?: "card" | "icon";
}

export function DepositCalendar({ variant = "card" }: DepositCalendarProps) {
  const [hovered, setHovered] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const closeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transactionsQuery = useTransactionsQuery({
    limit: 100,
    sort: "-date",
  });

  const depositDates = useMemo(() => {
    const txs = transactionsQuery.data?.data ?? [];
    const dates = new Set<string>();
    for (const tx of txs) {
      if (tx.type === "WALLET_DEPOSIT") {
        dates.add(dateKey(toLocalDate(tx.date)));
      }
    }
    return dates;
  }, [transactionsQuery.data]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [month]);

  const monthLabel = format(month, "MMMM yyyy");

  const activeDaysInMonth = useMemo(() => {
    let count = 0;
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    for (const d of daysInMonth) {
      if (depositDates.has(dateKey(d))) count++;
    }
    return count;
  }, [month, depositDates]);

  function open() {
    if (closeRef.current) clearTimeout(closeRef.current);
    setHovered(true);
  }

  function scheduleClose() {
    closeRef.current = setTimeout(() => setHovered(false), 200);
  }

  const now = new Date();
  const yesterday = subDays(now, 1);
  const tomorrow = addDays(now, 1);

  return (
    <div
      className="relative"
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
    >
      {variant === "icon" ? (
        <button
          type="button"
          aria-label="Calendar"
          className="p-0 rounded-lg hover:bg-foreground/5 transition-colors"
        >
          <Calendar className="text-foreground-muted hover:text-foreground transition-colors" />
        </button>
      ) : hovered ? (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5">
          <button
            type="button"
            onClick={() => setMonth(m => subMonths(m, 1))}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-border-subtle transition-colors"
          >
            <ChevronLeft className="h-3 w-3 text-foreground-muted" />
          </button>
          <span className="text-xs font-medium text-foreground tabular-nums">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() => setMonth(m => addMonths(m, 1))}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-border-subtle transition-colors"
          >
            <ChevronRight className="h-3 w-3 text-foreground-muted" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-elevated px-3.5 py-2 cursor-default">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <div className="flex items-center gap-2 text-[11px]">
            <span className="tabular-nums text-foreground-muted">{format(yesterday, "MMM d")}</span>
            <span className="text-foreground-muted/40">·</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary tabular-nums">
              {format(now, "EEE, MMM d")}
            </span>
            <span className="text-foreground-muted/40">·</span>
            <span className="tabular-nums text-foreground-muted">{format(tomorrow, "MMM d")}</span>
          </div>
        </div>
      )}

      {hovered && (
        <div
          className={`absolute top-full z-50 mt-3 w-64 rounded-xl border border-border bg-surface shadow-lg p-3 ${
            variant === "icon" ? "left-0" : "right-0"
          }`}
        >
          {variant === "icon" && (
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setMonth(m => subMonths(m, 1))}
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-border-subtle transition-colors"
              >
                <ChevronLeft className="h-3 w-3 text-foreground-muted" />
              </button>
              <span className="text-xs font-medium text-foreground tabular-nums">
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={() => setMonth(m => addMonths(m, 1))}
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-border-subtle transition-colors"
              >
                <ChevronRight className="h-3 w-3 text-foreground-muted" />
              </button>
            </div>
          )}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEK_LABELS.map(w => (
              <span key={w} className="text-[9px] font-medium text-foreground-muted py-1">
                {w}
              </span>
            ))}
            {days.map(day => {
              const key = dateKey(day);
              const inMonth = isSameMonth(day, month);
              const today = isToday(day);
              const hasDeposit = depositDates.has(key);

              return (
                <div
                  key={key}
                  className="relative flex flex-col items-center justify-center h-7"
                >
                  <span
                    className={`text-[10px] leading-none ${
                      !inMonth
                        ? "text-foreground-muted/30"
                        : today
                          ? "font-bold text-foreground"
                          : "text-foreground-secondary"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {hasDeposit && inMonth && (
                    <span className="mt-0.5 h-1 w-1 rounded-full bg-success" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-border flex items-center gap-1.5 text-[10px] text-foreground-secondary">
            <Flame className="h-3 w-3 text-success" />
            <span>
              <span className="font-medium tabular-nums text-foreground">{activeDaysInMonth}</span>
              {" "}active day{activeDaysInMonth !== 1 ? "s" : ""} in {format(month, "MMM")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
