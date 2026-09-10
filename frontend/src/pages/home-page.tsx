import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Coins,
  Target,
  ArrowDownToLine,
  LayoutDashboard
} from "lucide-react";
import { AppHeader } from "@/components/layout/Header/app-header";
import { AppFooter } from "@/components/layout/Footer/app-footer";
import { clsx } from "clsx";

export function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <AppHeader isLandingPage={true} />

      <main className="flex-1 flex flex-col pt-16">

        {/* HERO SECTION */}
        <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-4 overflow-hidden">
          {/* Subtle Background Gradients */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />

          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Left Copy */}
              <div className="text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border shadow-sm">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  <span className="text-xs font-medium text-foreground-secondary">O Rastreador de Centavos a Dólares</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                  Pare de perder dinheiro em <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-info">abas abertas.</span>
                </h1>

                <p className="text-lg md:text-xl text-foreground-secondary leading-relaxed">
                  Todos os seus ganhos de microtarefas e carteiras em um só painel. Saiba exatamente quanto você já ganhou, quanto falta para sacar em cada site e o valor real em dólares de todas as suas criptomoedas reunidas.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link to="/sign-up" className="w-full sm:w-auto">
                    <Button size="lg" className="rounded-full h-14 px-8 text-base gap-2 w-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                      Começar Gratuitamente <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Interactive Widget */}
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-info rounded-2xl blur opacity-30 animate-pulse pointer-events-none" />
                <HeroWidget />
              </div>
            </div>
          </div>
        </section>

        {/* LOGO MARQUEE */}
        <section className="py-10 border-y border-border/50 bg-surface/20 overflow-hidden flex flex-col items-center">
          <p className="text-sm font-medium text-foreground-secondary mb-6 tracking-wider uppercase">Suporta o ecossistema que você usa</p>
          <div className="w-full relative flex items-center">
            {/* Gradient masks for smooth edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-surface/20 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-surface/20 to-transparent z-10" />

            <div className="flex animate-marquee whitespace-nowrap gap-8 items-center py-2 px-4">
              {marqueeItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background border border-border/80 font-semibold text-foreground-secondary shadow-sm">
                  {item}
                </div>
              ))}
              {/* Duplicate for infinite effect */}
              {marqueeItems.map((item, i) => (
                <div key={i + 100} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background border border-border/80 font-semibold text-foreground-secondary shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURE: PROGRESS BARS (SAQUE MÍNIMO) */}
        <section className="py-24 px-4 bg-background">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 order-2 md:order-1">
                <div className="w-12 h-12 rounded-2xl bg-warning/20 flex items-center justify-center border border-warning/30">
                  <Target className="h-6 w-6 text-warning" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Controle de Saques Pendentes</h2>
                <p className="text-lg text-foreground-secondary">
                  Sites de renda extra exigem limites mínimos. Acompanhe visualmente o seu progresso rumo ao saque em cada plataforma. Saiba a hora exata de pedir seu pagamento sem precisar entrar de uma por uma.
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex gap-3 text-foreground-secondary">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span>Progresso visual de alcance do saque mínimo.</span>
                  </li>
                  <li className="flex gap-3 text-foreground-secondary">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span>Fim do dinheiro "esquecido" em plataformas antigas.</span>
                  </li>
                </ul>
              </div>

              {/* Visual Component */}
              <div className="order-1 md:order-2 rounded-2xl border border-border bg-surface/30 p-6 shadow-xl relative">
                <h3 className="font-semibold mb-6 flex items-center gap-2"><ArrowDownToLine className="w-5 h-5 text-foreground-muted" /> Metas de Saque (Withdraw)</h3>

                <div className="space-y-6">
                  {/* Site A */}
                  <div className="space-y-2 bg-background p-4 rounded-xl border border-border">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Timebucks</span>
                      <span className="text-foreground-secondary font-mono">$4.50 / $5.00</span>
                    </div>
                    <div className="h-2.5 w-full bg-surface-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-warning rounded-full w-[90%]" />
                    </div>
                    <p className="text-xs text-warning font-medium">🟡 Falta apenas $0.50 para sacar!</p>
                  </div>

                  {/* Site B */}
                  <div className="space-y-2 bg-background p-4 rounded-xl border border-success/30 relative overflow-hidden shadow-sm shadow-success/10">
                    <div className="absolute inset-0 bg-success/5 pointer-events-none" />
                    <div className="flex justify-between text-sm relative z-10">
                      <span className="font-medium">FreeCash</span>
                      <span className="text-foreground-secondary font-mono">$10.00 / $10.00</span>
                    </div>
                    <div className="h-2.5 w-full bg-surface-elevated rounded-full overflow-hidden relative z-10">
                      <div className="h-full bg-success rounded-full w-[100%]" />
                    </div>
                    <p className="text-xs text-success font-bold flex items-center gap-1 relative z-10">
                      🟢 Pronto para saque! Retirar fundos.
                    </p>
                  </div>

                  {/* Site C */}
                  <div className="space-y-2 bg-background p-4 rounded-xl border border-border opacity-70">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">CoinPayU</span>
                      <span className="text-foreground-secondary font-mono">1500 / 3000 Sats</span>
                    </div>
                    <div className="h-2.5 w-full bg-surface-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-info rounded-full w-[50%]" />
                    </div>
                    <p className="text-xs text-foreground-muted font-medium">No caminho certo.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON SECTION */}
        <section className="py-24 px-4 bg-surface/20 border-y border-border/50">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">O Dia a Dia com e sem APM Syn</h2>
              <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
                Compare como a organização correta transforma o caos de quem ganha dinheiro na internet.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Without APM Syn */}
              <div className="rounded-2xl border border-danger/20 bg-danger/5 p-6 md:p-8 relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center border border-danger/20">
                    <XCircle className="text-danger w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-danger">Sem o Sistema (Caos)</h3>
                </div>
                <ul className="space-y-5">
                  <li className="flex gap-3 text-foreground-secondary">
                    <span className="text-danger shrink-0 font-bold mt-0.5">❌</span>
                    <span><strong>15 abas abertas</strong> para checar o saldo de cada site.</span>
                  </li>
                  <li className="flex gap-3 text-foreground-secondary">
                    <span className="text-danger shrink-0 font-bold mt-0.5">❌</span>
                    <span>Não saber se já <strong>atingiu o limite mínimo</strong> de saque.</span>
                  </li>
                  <li className="flex gap-3 text-foreground-secondary">
                    <span className="text-danger shrink-0 font-bold mt-0.5">❌</span>
                    <span>Múltiplas moedas (Sats, DOGE, LTC, USDT) e <strong>nenhuma noção do total</strong> em Dólar/Real.</span>
                  </li>
                  <li className="flex gap-3 text-foreground-secondary">
                    <span className="text-danger shrink-0 font-bold mt-0.5">❌</span>
                    <span><strong>Esquecer dinheiro</strong> parado em faucets e contas antigas.</span>
                  </li>
                </ul>
              </div>

              {/* With APM Syn */}
              <div className="rounded-2xl border border-success/30 bg-success/5 p-6 md:p-8 relative overflow-hidden shadow-lg shadow-success/5">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <LayoutDashboard className="w-32 h-32 text-success" />
                </div>
                <div className="flex items-center gap-3 mb-6 relative">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center border border-success/30">
                    <CheckCircle2 className="text-success w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-success">Com o APM Syn (Controle)</h3>
                </div>
                <ul className="space-y-5 relative">
                  <li className="flex gap-3 text-foreground-secondary">
                    <span className="text-success shrink-0 font-bold mt-0.5">✅</span>
                    <span><strong>1 tela única</strong> com todos os saldos atualizados de sites e carteiras.</span>
                  </li>
                  <li className="flex gap-3 text-foreground-secondary">
                    <span className="text-success shrink-0 font-bold mt-0.5">✅</span>
                    <span><strong>Monitoramento visual</strong> mostrando quando o saque for atingido.</span>
                  </li>
                  <li className="flex gap-3 text-foreground-secondary">
                    <span className="text-success shrink-0 font-bold mt-0.5">✅</span>
                    <span><strong>Conversão automática:</strong> veja todo o portfólio unificado na sua moeda base.</span>
                  </li>
                  <li className="flex gap-3 text-foreground-secondary">
                    <span className="text-success shrink-0 font-bold mt-0.5">✅</span>
                    <span><strong>Histórico completo</strong> de saques e rendimentos por cada site.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden flex-1 flex flex-col justify-center bg-background">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />

          <div className="container mx-auto px-4 text-center relative z-10 max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Chega de deixar dinheiro para trás.</h2>
            <p className="text-xl text-foreground-secondary mb-10">
              Junte-se a usuários que organizam sua renda extra com inteligência. Unifique suas carteiras, alcance os mínimos de saque e veja seus centavos virarem dólares.
            </p>
            <Link to="/sign-up">
              <Button size="lg" className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform duration-200">
                Criar conta gratuita
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <AppFooter isLandingPage={true} />

      {/* Global styles for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
}

// Interactive Hero Widget Component
function HeroWidget() {
  const [selected, setSelected] = useState<number[]>([0, 2]);

  const sites = [
    { id: 0, name: "FaucetPay", value: 12.50, type: "Microwallet", color: "text-blue-500" },
    { id: 1, name: "Timebucks", value: 4.80, type: "Microtarefas", color: "text-green-500" },
    { id: 2, name: "FreeBitcoin", value: 1.25, type: "Faucet (BTC)", color: "text-orange-500" },
    { id: 3, name: "MetaMask", value: 8.90, type: "Crypto Wallet", color: "text-orange-400" },
    { id: 4, name: "Payeer", value: 21.00, type: "Carteira Digital", color: "text-cyan-500" },
  ];

  const toggleSite = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const total = selected.reduce((sum, id) => {
    return sum + sites.find(s => s.id === id)!.value;
  }, 0);

  return (
    <div className="rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden relative z-10">
      {/* Browser mockup header */}
      <div className="bg-surface-elevated px-4 py-3 flex items-center gap-2 border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-danger/80"></div>
          <div className="w-3 h-3 rounded-full bg-warning/80"></div>
          <div className="w-3 h-3 rounded-full bg-success/80"></div>
        </div>
        <div className="flex-1 ml-4 bg-background border border-border rounded-md px-3 py-1 text-xs text-foreground-muted truncate font-mono text-center">
          Calculadora de Caos vs. Controle
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-end mb-6 border-b border-border/50 pb-6">
          <div>
            <p className="text-sm font-medium text-foreground-secondary mb-1 uppercase tracking-wider flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-primary" /> APM Syn Dashboard
            </p>
            <p className="text-4xl font-bold text-foreground transition-all duration-500 text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground-muted">
              ${total.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 bg-success/10 border border-success/20 text-success text-xs font-semibold px-2.5 py-1 rounded-full">
              <Coins className="w-3.5 h-3.5" /> {selected.length} abas viraram 1
            </span>
          </div>
        </div>

        <p className="text-sm text-foreground-secondary mb-4 font-medium flex justify-between">
          <span>Selecione onde seu dinheiro está espalhado:</span>
        </p>

        <div className="space-y-2.5">
          {sites.map(site => {
            const isChecked = selected.includes(site.id);
            return (
              <div
                key={site.id}
                onClick={() => toggleSite(site.id)}
                className={clsx(
                  "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none",
                  isChecked
                    ? "border-primary/50 bg-primary/5 shadow-sm"
                    : "border-border bg-background hover:border-border/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-5 h-5 rounded flex items-center justify-center border transition-colors",
                    isChecked ? "bg-primary border-primary" : "border-border bg-surface"
                  )}>
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm leading-tight text-foreground">{site.name}</p>
                    <p className="text-xs text-foreground-muted">{site.type}</p>
                  </div>
                </div>
                <p className="font-mono text-sm font-semibold">
                  +${site.value.toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {selected.length < 5 && (
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-surface via-surface/90 to-transparent pointer-events-none flex items-end justify-center h-24">
          <p className="text-xs text-primary font-medium pb-2 animate-bounce flex items-center gap-1">
            Conecte mais plataformas! 👇
          </p>
        </div>
      )}
    </div>
  );
}

const marqueeItems = [
  "💧 FaucetPay",
  "🦊 MetaMask",
  "💸 Payeer",
  "🔶 Binance",
  "⏱️ Timebucks",
  "🛡️ Trust Wallet",
  "🎰 FreeBitcoin",
  "💳 Cwallet",
  "🪙 CoinPayU",
  "📈 Coinbase",
  "📝 ySense",
  "⚡ FreeCash"
];
