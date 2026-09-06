import { Label } from "@/components/ui/label";
import { getCoinLogoUrl } from "@/features/assets/logo";
import type { WalletHeldAsset } from "@/lib/wallet-utils";
import type { AssetInput } from "@/features/wallet-operations/types/wallet-operation.types";
import { cn } from "@/lib/utils";

interface WalletAssetGridProps {
  assets: WalletHeldAsset[];
  selectedAsset: AssetInput | null;
  onSelect: (asset: AssetInput) => void;
}

export function WalletAssetGrid({ assets, selectedAsset, onSelect }: WalletAssetGridProps) {
  if (assets.length === 0) {
    return (
      <div className="flex flex-col gap-1.5">
        <Label>Assets in this wallet</Label>
        <p className="rounded-lg border border-dashed border-border bg-surface-elevated px-3 py-3 text-xs text-foreground-muted">
          No assets detected yet. Search for one below.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Assets in this wallet</Label>
      <div className="grid grid-cols-2 gap-2">
        {assets.map(a => {
          const active = selectedAsset?.externalId === a.externalId;
          return (
            <button
              key={a.externalId}
              type="button"
              onClick={() => onSelect({ externalId: a.externalId, symbol: a.symbol, name: a.name })}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-surface-elevated hover:bg-surface-elevated/70",
              )}
            >
              <img
                src={getCoinLogoUrl(a.externalId, "thumb")}
                alt={a.symbol}
                className="h-5 w-5 rounded-full bg-surface-elevated"
                loading="lazy"
                onError={e => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-medium">{a.symbol}</span>
                <span className={cn("text-[10px] truncate", active ? "text-primary-foreground/80" : "text-foreground-muted")}>
                  {a.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
