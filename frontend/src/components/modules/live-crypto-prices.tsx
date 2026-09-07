import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface CryptoData {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    price_change_percentage_24h: number;
}

const defaultCryptos: CryptoData[] = [
    { id: "bitcoin", name: "Bitcoin", symbol: "btc", current_price: 94250, price_change_percentage_24h: 2.45 },
    { id: "ethereum", name: "Ethereum", symbol: "eth", current_price: 3120, price_change_percentage_24h: -1.2 },
    { id: "solana", name: "Solana", symbol: "sol", current_price: 184.5, price_change_percentage_24h: 5.82 },
    { id: "binancecoin", name: "BNB", symbol: "bnb", current_price: 592.1, price_change_percentage_24h: 0.15 },
    { id: "ripple", name: "Ripple", symbol: "xrp", current_price: 1.12, price_change_percentage_24h: -3.4 },
];

export function LiveCryptoPrices() {
    const [cryptos, setCryptos] = useState<CryptoData[]>(defaultCryptos);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch(
                    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,litecoin,ethereum,tether,binancecoin,solana,ripple,dogecoin,cardano&order=market_cap_desc&per_page=10&page=1&sparkline=false"
                );
                if (res.ok) {
                    const data = await res.json();
                    setCryptos(data);
                }
            } catch (error) {
                console.error("Erro ao buscar preços de cripto:", error);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 60000);
        return () => clearInterval(interval);
    }, []);

    const marqueeItems = [...cryptos, ...cryptos];

    return (
        <div className="px-4 py-2">
            <div className="w-full max-w-full min-w-0 bg-surface border-t border-border overflow-hidden">
                <div className="px-6 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">Live Crypto Prices</span>
                        <span className="flex items-center gap-1.5 text-xs text-success">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            Live
                        </span>
                    </div>
                </div>
                <div className="relative h-10 w-full max-w-full min-w-0 overflow-hidden bg-surface-elevated">
                    <div className="absolute inset-y-0 left-0 w-12 bg-linear-to-r from-surface to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-12 bg-linear-to-l from-surface to-transparent z-10 pointer-events-none" />
                    <div className="absolute left-0 top-1/2 flex w-max -translate-y-1/2 gap-8 animate-marquee hover:[animation-play-state:paused]">
                        {marqueeItems.map((crypto, index) => {
                            const isPositive = crypto.price_change_percentage_24h >= 0;
                            return (
                                <div
                                    key={`${crypto.id}-${index}`}
                                    className="flex items-center gap-2 text-xs border-r border-border/50 pr-8 font-mono"
                                >
                                    <span className="font-semibold text-foreground uppercase">
                                        {crypto.symbol}
                                    </span>
                                    <span className="text-foreground-secondary">
                                        ${crypto.current_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </span>
                                    <span className={cn("flex items-center text-xs font-medium", isPositive ? "text-success" : "text-danger")}>
                                        {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                                        {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
