import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/layout/Header/app-header";
import { AppFooter } from "@/components/layout/Footer/app-footer";
import { formatUSD } from "@/lib/formats";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowRightLeft,
  ArrowUpRight,
  CalendarRange,
  ChartNoAxesCombined,
  Check,
  CheckCircle2,
  Coins,
  Flame,
  Globe,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  WalletCards,
  WalletMinimal,
  XCircle,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const VIEWS = [
  {
    key: "portfolio",
    label: "Portfolio",
    icon: ChartNoAxesCombined,
    accent: "#3b82f6",
    items: [
      { name: "Bitcoin", sub: "BTC", value: 473.82, color: "#f7931a" },
      { name: "Ethereum", sub: "ETH", value: 289.14, color: "#627eea" },
      { name: "Tether", sub: "USDT", value: 212.0, color: "#26a17b" },
      { name: "Litecoin", sub: "LTC", value: 158.05, color: "#345d9d" },
      { name: "Dogecoin", sub: "DOGE", value: 114.82, color: "#c2a633" },
    ],
  },
  {
    key: "wallets",
    label: "Wallets",
    icon: WalletCards,
    accent: "#8b5cf6",
    items: [
      { name: "MetaMask", sub: "Crypto Wallet", value: 342.5, color: "#f6851b" },
      { name: "Payeer", sub: "Digital Wallet", value: 287.2, color: "#06b6d4" },
      { name: "Trust Wallet", sub: "Crypto Wallet", value: 266.83, color: "#8b5cf6" },
      { name: "FaucetPay", sub: "Microwallet", value: 196.4, color: "#3b82f6" },
      { name: "Binance", sub: "Exchange", value: 154.9, color: "#f0b90b" },
    ],
  },
  {
    key: "websites",
    label: "Websites",
    icon: Globe,
    accent: "#22c55e",
    items: [
      { name: "Timebucks", sub: "Microtasks", value: 124.5, color: "#22c55e" },
      { name: "FreeCash", sub: "Offers", value: 98.2, color: "#f59e0b" },
      { name: "ySense", sub: "Surveys", value: 76.9, color: "#ec4899" },
      { name: "CoinPayU", sub: "Faucet", value: 58.4, color: "#0284c7" },
      { name: "FreeBitcoin", sub: "Faucet (BTC)", value: 42.1, color: "#f7931a" },
    ],
  },
];

const TREND = [
  { label: "Mon", value: 208 },
  { label: "Tue", value: 236 },
  { label: "Wed", value: 224 },
  { label: "Thu", value: 268 },
  { label: "Fri", value: 297 },
  { label: "Sat", value: 283 },
  { label: "Sun", value: 334 },
];

const ECOSYSTEM = [
  { label: "FaucetPay", color: "#3b82f6" },
  { label: "MetaMask", color: "#f6851b" },
  { label: "Payeer", color: "#06b6d4" },
  { label: "Binance", color: "#f0b90b" },
  { label: "Timebucks", color: "#22c55e" },
  { label: "Trust Wallet", color: "#8b5cf6" },
  { label: "CoinPayU", color: "#0284c7" },
  { label: "ySense", color: "#ec4899" },
  { label: "Coinbase", color: "#2563eb" },
  { label: "FreeCash", color: "#f59e0b" },
];

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    const from = currentRef.current;
    if (from === target) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (target - from) * eased;
      currentRef.current = next;
      setValue(next);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      currentRef.current = target;
    };
  }, [target, duration]);

  return value;
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={clsx(
        "transition-all duration-700 ease-out will-change-transform",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
      )}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number } }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground">{payload[0]!.payload.name}</p>
      <p className="text-xs tabular-nums text-foreground-secondary">
        {formatUSD(payload[0]!.payload.value)}
      </p>
    </div>
  );
}

function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { label: string; value: number } }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground">{payload[0]!.payload.label}</p>
      <p className="text-xs tabular-nums text-foreground-secondary">
        {formatUSD(payload[0]!.payload.value)}
      </p>
    </div>
  );
}

function HeroDashboard() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const view = VIEWS[active];
  const items = view.items;

  const total = useMemo(() => items.reduce((sum, item) => sum + item.value, 0), [items]);
  const animatedTotal = useCountUp(total);
  const trendDelta = TREND[TREND.length - 1]!.value - TREND[0]!.value;

  useEffect(() => {
    if (hovered) return;
    const id = setInterval(() => setActive(i => (i + 1) % VIEWS.length), 4200);
    return () => clearInterval(id);
  }, [hovered]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        aria-hidden="true"
        className="absolute -inset-2 rounded-4xl bg-linear-to-tr from-primary via-info to-success opacity-20 blur-2xl"
      />

      <div className="relative rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden">
        <div className="bg-surface-elevated px-4 py-3 flex items-center gap-2 border-b border-border">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-danger/80" />
            <span className="h-3 w-3 rounded-full bg-warning/80" />
            <span className="h-3 w-3 rounded-full bg-success/80" />
          </div>
          <div className="flex-1 mx-4 bg-background border border-border rounded-md px-3 py-1 text-xs text-foreground-muted truncate font-mono text-center">
            app.apmsyn.com
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-success">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            Live
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-elevated border border-border w-fit">
              {VIEWS.map((v, i) => (
                <button
                  key={v.key}
                  onClick={() => setActive(i)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    active === i
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground-secondary hover:text-foreground",
                  )}
                >
                  <v.icon className="h-3.5 w-3.5" />
                  {v.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-foreground-muted flex items-center gap-1.5">
              Updated now
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-6">
            <div key={view.key} className="min-w-0">
              <div className="relative h-44 w-full max-w-55 mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={items}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="64%"
                      outerRadius="90%"
                      paddingAngle={2}
                      cornerRadius={5}
                      stroke="var(--color-surface)"
                      strokeWidth={2}
                    >
                      {items.map(item => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-elevated border border-border">
                    <view.icon className="h-3.5 w-3.5 text-foreground-muted" />
                  </span>
                  <span className="text-[10px] font-medium text-foreground-muted">
                    Total {view.label.toLowerCase()}
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-foreground tracking-tight">
                    {formatUSD(animatedTotal)}
                  </span>
                </div>
              </div>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-4">
                {items.map(item => (
                  <li key={item.name} className="flex items-center gap-1.5 min-w-0" title={item.name}>
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: item.color }}
                    />
                    <span className="truncate text-xs text-foreground-secondary">{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0 sm:border-l sm:border-border sm:pl-5">
              <p className="text-[10px] font-medium text-foreground-muted uppercase tracking-wide mb-1">
                Distribution
              </p>
              <ul className="flex flex-col divide-y divide-border-subtle">
                {items.map(item => {
                  const participation = (item.value / total) * 100;
                  return (
                    <li
                      key={item.name}
                      className="grid grid-cols-[1fr_1fr_80px] gap-3 items-center py-2.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ background: item.color }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate text-xs font-medium text-foreground">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-foreground-muted truncate">
                            {item.sub}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <span className="text-[10px] tabular-nums text-foreground-secondary text-right">
                          {participation.toFixed(1)}%
                        </span>
                        <div className="h-1.5 w-full rounded-full bg-border-subtle overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, participation)}%`,
                              background: item.color,
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-end min-w-0">
                        <span className="text-xs font-semibold tabular-nums text-foreground text-right">
                          {formatUSD(item.value)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-3 mt-6">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] font-medium text-foreground-muted">
                Value evolution
              </span>
              <span className="text-[10px] tabular-nums text-success">
                +{formatUSD(trendDelta)} this week
              </span>
            </div>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
                  <defs>
                    <linearGradient id="heroTrendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" hide />
                  <YAxis hide domain={["dataMin", "dataMax"]} />
                  <Tooltip content={<TrendTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#heroTrendFill)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="hidden sm:flex absolute -left-6 top-20 bg-surface border border-border rounded-xl px-3.5 py-2.5 shadow-lg items-center gap-2.5 animate-float"
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
        className="hidden sm:flex absolute -right-6 bottom-28 bg-surface border border-border rounded-xl px-3.5 py-2.5 shadow-lg items-center gap-2.5 animate-float-delayed"
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
  );
}

export function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <AppHeader isLandingPage={true} />

      <main className="flex-1 flex flex-col pt-16">
        <HeroSection />

        <MarqueeSection />

        <FeaturesSection />

        <GoalsSection />

        <ComparisonSection />

        <HowItWorksSection />

        <CTASection />
      </main>

      <AppFooter isLandingPage={true} />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out 1.2s infinite; }
      ` }}
      />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-4 overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-130 h-130 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-24 right-0 w-105 h-105 bg-info/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-95 h-95 bg-success/10 rounded-full blur-[110px]" />
      </div>

      <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-12 items-center">
        <Reveal className="text-left space-y-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground-secondary">
              From pennies to dollars
            </span>
          </div>

          <h1 className="font-space-grotesk text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
            All your microtask money,{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-info to-success">
              on one screen.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-foreground-secondary leading-relaxed max-w-xl">
            Track earnings, wallets and withdrawal goals from every microtask site in a single dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link to="/sign-up" className="w-full sm:w-auto">
              <Button size="lg" className="rounded-full h-14 px-8 text-base gap-2 w-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                Get started free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base w-full">
                See how it works
              </Button>
            </a>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2.5 pt-2">
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
        </Reveal>

        <Reveal delay={150} className="relative">
          <HeroDashboard />
        </Reveal>
      </div>
    </section>
  );
}

function MarqueeSection() {
  return (
    <section className="border-y border-border/60 bg-surface/30 py-10 overflow-hidden flex flex-col items-center">
      <p className="text-sm font-medium text-foreground-secondary mb-6 tracking-wider uppercase">
        Built for the ecosystem you already use
      </p>
      <div className="w-full relative flex items-center">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-background to-transparent z-10" />

        <div className="flex animate-marquee whitespace-nowrap gap-4 items-center py-2 pr-4">
          {[...ECOSYSTEM, ...ECOSYSTEM].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background border border-border/80 font-semibold text-foreground-secondary shadow-sm"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: typeof Target;
  iconClass: string;
  title: string;
  description: string;
  children: ReactNode;
}

function FeatureCard({ icon: Icon, iconClass, title, description, children }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center gap-3">
        <span
          className={clsx(
            "flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-elevated",
            iconClass,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
        <ArrowUpRight className="ml-auto h-4 w-4 text-foreground-muted" />
      </div>
      <p className="text-sm text-foreground-secondary leading-relaxed">{description}</p>
      <div className="mt-auto pt-2 border-t border-border/60">{children}</div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <Reveal className="text-center mb-16">
          <Badge variant="primary" size="sm" className="mb-4">
            One dashboard for everything
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            From tab chaos to total control
          </h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto mt-4">
            Every income source becomes an organized item with balance, history and goals — just
            like a professional portfolio view.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Reveal delay={0}>
            <FeatureCard
              icon={ChartNoAxesCombined}
              iconClass="text-primary"
              title="Unified Portfolio"
              description="Consolidate BTC, DOGE, LTC, USDT and any asset into one USD value. Watch the distribution and evolution of your holdings."
            >
              {[
                { name: "BTC", value: 473.82, color: "#f7931a", pct: 38 },
                { name: "ETH", value: 289.14, color: "#627eea", pct: 23 },
                { name: "USDT", value: 212.0, color: "#26a17b", pct: 17 },
              ].map(asset => (
                <div key={asset.name} className="flex items-center gap-3 py-1.5 text-xs">
                  <span className="w-8 truncate font-medium text-foreground">{asset.name}</span>
                  <div className="h-1.5 flex-1 rounded-full bg-border-subtle overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${asset.pct}%`, background: asset.color }}
                    />
                  </div>
                  <span className="tabular-nums text-foreground-secondary">
                    {formatUSD(asset.value)}
                  </span>
                  <span className="tabular-nums text-foreground-muted w-8 text-right">
                    {asset.pct}%
                  </span>
                </div>
              ))}
            </FeatureCard>
          </Reveal>

          <Reveal delay={80}>
            <FeatureCard
              icon={WalletCards}
              iconClass="text-info"
              title="Centralized Wallets"
              description="Faucets, microwallets, exchanges and digital wallets — all with updated balances and share-of-total, in one place."
            >
              {[
                { name: "MetaMask", value: 342.5, color: "#f6851b", pct: 30 },
                { name: "Payeer", value: 287.2, color: "#06b6d4", pct: 25 },
                { name: "FaucetPay", value: 196.4, color: "#3b82f6", pct: 17 },
              ].map(wallet => (
                <div key={wallet.name} className="flex items-center gap-3 py-1.5 text-xs">
                  <span className="w-20 truncate font-medium text-foreground">{wallet.name}</span>
                  <div className="h-1.5 flex-1 rounded-full bg-border-subtle overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${wallet.pct}%`, background: wallet.color }}
                    />
                  </div>
                  <span className="tabular-nums text-foreground-secondary">
                    {formatUSD(wallet.value)}
                  </span>
                  <span className="tabular-nums text-foreground-muted w-8 text-right">
                    {wallet.pct}%
                  </span>
                </div>
              ))}
            </FeatureCard>
          </Reveal>

          <Reveal delay={160}>
            <FeatureCard
              icon={Globe}
              iconClass="text-success"
              title="Microtask Sites"
              description="Track weekly earnings, withdrawals and pending balances per platform. Never lose money sleeping in old accounts again."
            >
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="rounded-lg border border-border bg-surface-elevated p-3">
                  <TrendingUp className="h-4 w-4 text-success mb-1.5" />
                  <p className="text-[10px] text-foreground-muted">Earnings</p>
                  <p className="text-xs font-semibold tabular-nums text-foreground">
                    {formatUSD(104.2)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-surface-elevated p-3">
                  <TrendingDown className="h-4 w-4 text-danger mb-1.5" />
                  <p className="text-[10px] text-foreground-muted">Withdrawn</p>
                  <p className="text-xs font-semibold tabular-nums text-foreground">
                    {formatUSD(46.3)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-surface-elevated p-3">
                  <Wallet className="h-4 w-4 text-primary mb-1.5" />
                  <p className="text-[10px] text-foreground-muted">Pending</p>
                  <p className="text-xs font-semibold tabular-nums text-foreground">
                    {formatUSD(392.1)}
                  </p>
                </div>
              </div>
            </FeatureCard>
          </Reveal>

          <Reveal delay={240}>
            <FeatureCard
              icon={Target}
              iconClass="text-warning"
              title="Weekly Goals"
              description="Set how much you want to save each week and watch day-by-day progress toward achievable targets."
            >
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-foreground-secondary">Weekly progress</span>
                  <span className="font-semibold tabular-nums text-foreground">78%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-border-subtle overflow-hidden">
                  <div className="h-full rounded-full bg-success/70" style={{ width: "78%" }} />
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  {[0, 1, 2, 3, 4, 5, 6].map(i => (
                    <span
                      key={i}
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-border"
                    >
                      {i < 5 ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-border" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </FeatureCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function GoalWidget() {
  const [earned, setEarned] = useState(4.5);
  const weeklyGoal = 20;
  const percentage = Math.min(100, (earned / weeklyGoal) * 100);
  const achieved = earned >= weeklyGoal;
  const filledDays = Math.min(7, Math.max(1, Math.round((earned / weeklyGoal) * 7)));

  const addEarning = () => {
    if (achieved) return;
    setEarned(current =>
      Math.min(weeklyGoal, current + Math.round((2 + Math.random() * 4) * 100) / 100),
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xl relative overflow-hidden">
      <div aria-hidden="true" className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

      <div className="flex items-center gap-3 mb-5 relative">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated border border-border">
          <Target className="h-5 w-5 text-primary" />
        </span>
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-foreground">Weekly Goal</p>
          <p className="text-[10px] text-foreground-muted flex items-center gap-1">
            <WalletMinimal className="h-3 w-3" /> 2 wallets · 7 days
          </p>
        </div>
        {achieved ? (
          <Badge variant="success" size="sm" className="ml-auto">Goal reached!</Badge>
        ) : (
          <Badge size="sm" className="ml-auto">In progress</Badge>
        )}
      </div>

      <div className="flex flex-col gap-2 mb-5 relative">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground-secondary">Progress</span>
          <span className="font-semibold tabular-nums text-foreground">{percentage.toFixed(1)}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-border-subtle overflow-hidden">
          <div
            className="h-full rounded-full bg-success/70 transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] pt-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-foreground-muted">Weekly goal</span>
            <span className="font-medium tabular-nums text-foreground">{formatUSD(weeklyGoal)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-foreground-muted">Progress</span>
            <span className="font-medium tabular-nums text-success">{formatUSD(earned)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-foreground-muted">Remaining</span>
            <span className={clsx("font-medium tabular-nums", achieved ? "text-success" : "text-warning")}>
              {formatUSD(Math.max(0, weeklyGoal - earned))}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] border-t border-border pt-3 mb-4 relative">
        <div className="flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-foreground-muted" />
          <span className="text-foreground-secondary">Days done</span>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 7 }, (_, i) => (
            <span
              key={i}
              className={clsx(
                "flex h-4.5 w-4.5 items-center justify-center rounded-full border transition-colors",
                i < filledDays ? "border-success/40 bg-success/10" : "border-border",
              )}
            >
              {i < filledDays ? (
                <Check className="h-2.5 w-2.5 text-success" />
              ) : (
                <span className="h-1 w-1 rounded-full bg-border" />
              )}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={addEarning}
        disabled={achieved}
        className={clsx(
          "w-full inline-flex items-center justify-center gap-2 rounded-lg h-10 text-sm font-medium transition-all",
          achieved
            ? "bg-success/10 text-success border border-success/20 cursor-default"
            : "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm active:scale-[0.98]",
        )}
      >
        {achieved ? (
          <>
            <CheckCircle2 className="h-4 w-4" /> Goal reached this week
          </>
        ) : (
          <>
            <TrendingUp className="h-4 w-4" /> Add earning (+${(2 + earned % 4).toFixed(2)})
          </>
        )}
      </button>
    </div>
  );
}

function GoalsSection() {
  return (
    <section className="py-24 px-4 bg-surface/30 border-y border-border/50">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Reveal className="order-2 lg:order-1">
            <GoalWidget />
          </Reveal>

          <Reveal delay={80} className="space-y-6 order-1 lg:order-2">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/15 border border-warning/30">
                <Target className="h-6 w-6 text-warning" />
              </span>
              <Badge variant="warning" size="sm">Weekly goals</Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Turn routine into results
            </h2>
            <p className="text-lg text-foreground-secondary leading-relaxed">
              One goal a week, one wallet at a time. APM Syn tells you exactly how much to deposit
              each day and shows, in real time, whether you are on track or need to pick up the pace.
            </p>

            <ul className="space-y-4 pt-2">
              <li className="flex gap-3 text-foreground-secondary">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Daily and weekly goals</strong> for every
                  linked wallet.
                </span>
              </li>
              <li className="flex gap-3 text-foreground-secondary">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Automatic deposits</strong> of microtask
                  earnings, with zero manual entry.
                </span>
              </li>
              <li className="flex gap-3 text-foreground-secondary">
                <CalendarRange className="h-5 w-5 text-info shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Full history</strong> of every completed goal —
                  and exactly where you stand.
                </span>
              </li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  const withoutItems = [
    "15 open tabs to check the balance of each site.",
    "No idea whether you hit minimum withdrawal limits.",
    "Coins scattered across Sats, DOGE, LTC, USDT with no sense of total.",
    "Money forgotten in faucets and old accounts.",
  ];

  const withItems = [
    "One screen with up-to-date balances for all sites and wallets.",
    "Visual monitoring that flags the moment you can withdraw.",
    "Automatic conversion of your entire portfolio into your base currency.",
    "Complete withdrawal and earnings history for each site.",
  ];

  return (
    <section className="py-24 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <Reveal className="text-center mb-16">
          <Badge variant="info" size="sm" className="mb-4">
            Real difference
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Life with and without APM Syn
          </h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto mt-4">
            See how organization transforms the chaos of earning money online.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Reveal delay={0}>
            <div className="rounded-2xl border border-danger/20 bg-danger/5 p-6 md:p-8 relative h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center border border-danger/20">
                  <XCircle className="text-danger w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-danger">Without APM Syn (chaos)</h3>
              </div>
              <ul className="space-y-5">
                {withoutItems.map(item => (
                  <li key={item} className="flex gap-3 text-foreground-secondary">
                    <XCircle className="text-danger shrink-0 w-5 h-5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl border border-success/30 bg-success/5 p-6 md:p-8 relative h-full overflow-hidden shadow-lg shadow-success/5">
              <div aria-hidden="true" className="absolute top-0 right-0 p-8 opacity-5">
                <LayoutDashboard className="w-32 h-32 text-success" />
              </div>
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center border border-success/30">
                  <CheckCircle2 className="text-success w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-success">With APM Syn (control)</h3>
              </div>
              <ul className="space-y-5 relative">
                {withItems.map(item => (
                  <li key={item} className="flex gap-3 text-foreground-secondary">
                    <CheckCircle2 className="text-success shrink-0 w-5 h-5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: Zap,
    title: "Add your sources",
    description:
      "Add your microtask sites and wallets in minutes. No spreadsheets, no complicated setup.",
  },
  {
    icon: ArrowRightLeft,
    title: "Log your transactions",
    description:
      "Every earning, deposit and withdrawal becomes a record. Balances, history and goals update themselves.",
  },
  {
    icon: ArrowDownToLine,
    title: "Withdraw on time",
    description:
      "See when each platform unlocks payments and cash out without leaving money behind.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-surface/30 border-y border-border/50">
      <div className="container mx-auto max-w-6xl">
        <Reveal className="text-center mb-16">
          <Badge variant="success" size="sm" className="mb-4">
            How it works
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Start small, end in control
          </h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto mt-4">
            Three simple steps to a complete view of your extra income.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 100}>
              <div className="relative h-full rounded-2xl border border-border bg-surface p-6">
                <span className="absolute top-5 right-6 text-4xl font-bold text-border select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-elevated border border-border mb-5">
                  <step.icon className="h-5 w-5 text-primary" />
                </span>
                <h3 className="text-lg font-semibold text-foreground tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-foreground-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="pt-12 pb-0 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary via-primary-hover to-info px-6 py-16 md:py-24 text-center shadow-2xl">
            <div aria-hidden="true" className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div aria-hidden="true" className="absolute -bottom-32 -right-32 w-96 h-96 bg-success/20 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <Badge size="sm" className="bg-white/15 text-white border-white/25 mb-6">
                Free to start
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
                Stop leaving money behind.
              </h2>
              <p className="text-lg md:text-xl text-white/85 mb-10 leading-relaxed">
                Unify your wallets, hit withdrawal minimums and watch pennies turn into dollars —
                all in one dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/sign-up" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="rounded-full h-14 px-10 text-lg w-full shadow-xl hover:scale-105 transition-transform duration-200" style={{ backgroundColor: "var(--color-background)", color: "var(--color-primary)" }}>
                    Create free account <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/sign-in" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-lg w-full border-white/40 text-white hover:bg-white/10">
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}