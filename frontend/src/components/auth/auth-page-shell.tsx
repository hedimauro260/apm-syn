import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowUpRight,
  CheckCircle2,
  Coins,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { HeaderLogo } from "@/components/layout/Header/header-logo";
import { Badge } from "@/components/ui/badge";
import { formatUSD } from "@/lib/formats";

const DISTRIBUTION = [
  { name: "Bitcoin", sub: "BTC", value: 473.82, color: "#f7931a", pct: 38 },
  { name: "Ethereum", sub: "ETH", value: 289.14, color: "#627eea", pct: 23 },
  { name: "Tether", sub: "USDT", value: 212.0, color: "#26a17b", pct: 17 },
  { name: "Litecoin", sub: "LTC", value: 158.05, color: "#345d9d", pct: 13 },
  { name: "Dogecoin", sub: "DOGE", value: 56.82, color: "#c2a633", pct: 5 },
];

const TOTAL_VALUE = DISTRIBUTION.reduce((sum, item) => sum + item.value, 0);

function DonutChart() {
  const ringSegment = DISTRIBUTION
    .map((item, i) => {
      const start = DISTRIBUTION.slice(0, i).reduce((acc, d) => acc + d.pct, 0);
      return `${item.color} ${start}% ${start + item.pct}%`;
    })
    .join(", ");

  return (
    <div
      aria-hidden="true"
      className="relative h-36 w-36 rounded-full"
      style={{
        background: `conic-gradient(${ringSegment})`,
      }}
    >
      <div className="absolute inset-2.5 flex flex-col items-center justify-center rounded-full bg-surface border border-border">
        <WalletCards className="h-4 w-4 text-foreground-muted" />
        <span className="text-[10px] font-medium text-foreground-muted mt-1">Total</span>
        <span className="text-base font-semibold tabular-nums text-foreground tracking-tight">
          {formatUSD(TOTAL_VALUE)}
        </span>
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden lg:flex flex-col overflow-hidden border-r border-border bg-background p-10 xl:p-14">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-24 w-100 h-100 bg-primary/15 rounded-full blur-[110px]" />
        <div className="absolute top-1/2 -right-24 w-90 h-90 bg-info/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-90 h-90 bg-success/10 rounded-full blur-[110px]" />
      </div>

      <div className="relative flex items-center gap-1.5">
        <HeaderLogo />
      </div>

      <div className="relative flex-1 flex flex-col justify-center py-10 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border shadow-sm w-fit">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground-secondary">
            From pennies to dollars
          </span>
        </div>

        <h1 className="mt-6 font-space-grotesk text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.08]">
          All your microtask money,{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-info to-success">
            on one screen.
          </span>
        </h1>

        <p className="mt-5 text-base xl:text-lg text-foreground-secondary leading-relaxed max-w-md">
          Track earnings, wallets and withdrawal goals from every microtask site in a single
          dashboard.
        </p>

        <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
          <li className="flex items-center gap-2 text-sm text-foreground-secondary">
            <CheckCircle2 className="h-4 w-4 text-success" /> Unified balances
          </li>
          <li className="flex items-center gap-2 text-sm text-foreground-secondary">
            <Coins className="h-4 w-4 text-warning" /> Multi-currency (Sats, DOGE, LTC, USDT)
          </li>
          <li className="flex items-center gap-2 text-sm text-foreground-secondary">
            <ShieldCheck className="h-4 w-4 text-info" /> Your data, your rules
          </li>
        </ul>

        <div className="relative mt-12 max-w-lg">
          <div
            aria-hidden="true"
            className="absolute -inset-3 rounded-3xl bg-linear-to-tr from-primary via-info to-success opacity-15 blur-2xl"
          />

          <div className="relative rounded-2xl bg-surface border border-border shadow-2xl p-5 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <WalletCards className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Asset distribution</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-success">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
                Live
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <DonutChart />

              <ul className="flex-1 w-full flex flex-col divide-y divide-border-subtle">
                {DISTRIBUTION.map(item => (
                  <li
                    key={item.name}
                    className="grid grid-cols-[1fr_64px] gap-x-3 gap-y-1 items-center py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ background: item.color }}
                      />
                      <span className="truncate text-xs font-medium text-foreground">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-foreground-muted truncate">{item.sub}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 min-w-0">
                      <span className="text-xs font-semibold tabular-nums text-foreground">
                        {formatUSD(item.value)}
                      </span>
                      <span className="text-[10px] tabular-nums text-foreground-muted w-9 text-right">
                        {item.pct}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 text-[10px] text-foreground-muted flex items-center justify-between border-t border-border pt-3">
              <span>Auto-converted to your base currency</span>
              <span className="flex items-center gap-1 text-foreground-secondary font-medium">
                Updated now <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="hidden sm:flex absolute -left-5 -top-5 bg-surface border border-border rounded-xl px-3.5 py-2.5 shadow-lg items-center gap-2.5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 border border-success/20">
              <TrendingUp className="h-4 w-4 text-success" />
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] text-foreground-muted">Today's earnings</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">+$0.87</span>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="hidden sm:flex absolute -right-4 -bottom-5 bg-surface border border-border rounded-xl px-3.5 py-2.5 shadow-lg items-center gap-2.5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 border border-warning/20">
              <ArrowDownToLine className="h-4 w-4 text-warning" />
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] text-foreground-muted">$0.50 from withdrawal</span>
              <span className="text-sm font-semibold text-warning">Withdrawal ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col gap-3">
        <p className="text-xs text-foreground-muted">
          © 2026 APM Syn · Asset Portfolio Manager Sync
        </p>
      </div>
    </aside>
  );
}

export function AuthPageShell({ children }: PropsWithChildren) {
  return (
    <div className="grid min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 lg:grid-cols-2">
      <BrandPanel />

      <main className="relative flex flex-col min-h-screen">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 -left-24 w-80 h-80 bg-info/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative flex items-center px-6 pt-6 lg:justify-end">
          <div className="lg:hidden">
            <Link to="/" aria-label="APM Syn home">
              <HeaderLogo />
            </Link>
          </div>
          <Link
            to="/"
            className="ml-auto text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors hidden lg:inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-1.5 shadow-sm"
          >
            Back to home
          </Link>
        </div>

        <div className="relative flex-1 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md sm:max-w-sm xl:max-w-md">{children}</div>
        </div>

        <div className="relative flex flex-col items-center gap-3 pb-6 px-6">
          <Badge size="sm" className="gap-1.5">
            <ShieldCheck className="h-3 w-3 text-info" />
            Secured by Clerk · 256-bit SSL encryption
          </Badge>
          <p className="text-xs text-foreground-muted">
            © 2026 APM Syn · Asset Portfolio Manager Sync
          </p>
        </div>
      </main>
    </div>
  );
}