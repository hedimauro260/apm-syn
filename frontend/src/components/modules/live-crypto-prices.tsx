import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useMarketTickerQuery } from "@/features/market-data/api/market-data-queries";

interface CryptoData {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    price_change_percentage_24h: number | null;
}

const TICKER_IDS = [
    "bitcoin",
    "litecoin",
    "ethereum",
    "tether",
    "binancecoin",
    "solana",
    "ripple",
    "dogecoin",
    "cardano",
];

const defaultCryptos: CryptoData[] = [
    { id: "bitcoin", name: "Bitcoin", symbol: "btc", current_price: 94250, price_change_percentage_24h: 2.45 },
    { id: "ethereum", name: "Ethereum", symbol: "eth", current_price: 3120, price_change_percentage_24h: -1.2 },
    { id: "solana", name: "Solana", symbol: "sol", current_price: 184.5, price_change_percentage_24h: 5.82 },
    { id: "binancecoin", name: "BNB", symbol: "bnb", current_price: 592.1, price_change_percentage_24h: 0.15 },
    { id: "ripple", name: "Ripple", symbol: "xrp", current_price: 1.12, price_change_percentage_24h: -3.4 },
];

export function LiveCryptoPrices() {
    const { data } = useMarketTickerQuery(TICKER_IDS);

    const liveCryptos: CryptoData[] = (data?.data ?? []).map(quote => ({
        id: quote.externalId,
        name: quote.name,
        symbol: quote.symbol,
        current_price: quote.currentPrice,
        price_change_percentage_24h: quote.changePercentage24h,
    }));

    const cryptos = liveCryptos.length > 0 ? liveCryptos : defaultCryptos;
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
                            const change = crypto.price_change_percentage_24h;
                            const hasChange = typeof change === "number";
                            const isPositive = hasChange && change >= 0;
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
                                    {hasChange ? (
                                        <span className={cn("flex items-center text-xs font-medium", isPositive ? "text-success" : "text-danger")}>
                                            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                                            {Math.abs(change).toFixed(2)}%
                                        </span>
                                    ) : (
                                        <span className="text-foreground-secondary">--</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}