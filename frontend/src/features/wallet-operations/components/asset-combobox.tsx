import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAssetCatalogSearch } from "@/features/assets/hooks/use-asset-catalog";
import { getCoinLogoUrl } from "@/features/assets/logo";
import { useDebounce } from "@/hooks/use-debounce";
import type { AssetInput } from "@/features/wallet-operations/types/wallet-operation.types";

interface AssetComboboxProps {
  selectedAsset: AssetInput | null;
  setSelectedAsset: (asset: AssetInput | null) => void;
  usdDisplay: string;
}

export function AssetCombobox({ selectedAsset, setSelectedAsset, usdDisplay }: AssetComboboxProps) {
  const [assetSearchTerm, setAssetSearchTerm] = useState("");
  const debouncedTerm = useDebounce(assetSearchTerm, 300);
  const catalogResults = useAssetCatalogSearch(selectedAsset ? "" : debouncedTerm);

  return (
    <div className="flex flex-col gap-1.5">
      <Label required>Asset</Label>
      {!selectedAsset ? (
        <>
          <Input
            placeholder="Search BTC, ETH..."
            value={assetSearchTerm}
            onChange={e => setAssetSearchTerm(e.target.value)}
            className="h-10"
          />
          {debouncedTerm.length >= 2 && (
            <div className="max-h-40 overflow-auto rounded-lg border border-border bg-surface shadow-sm">
              {catalogResults.length === 0 ? (
                <p className="p-2 text-xs text-foreground-muted">No results</p>
              ) : (
                catalogResults.map(a => (
                  <button
                    key={a.externalId}
                    type="button"
                    onClick={() => {
                      setSelectedAsset({ externalId: a.externalId, symbol: a.symbol, name: a.name });
                      setAssetSearchTerm("");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-elevated"
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
                    <span className="font-medium">{a.symbol}</span>
                    <span className="text-foreground-muted truncate">{a.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-elevated px-3 py-2">
            <div className="flex items-center gap-2">
              <img
                src={getCoinLogoUrl(selectedAsset.externalId, "thumb")}
                alt={selectedAsset.symbol}
                className="h-6 w-6 rounded-full bg-surface-elevated"
                loading="lazy"
                onError={e => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">
                  {selectedAsset.symbol} · {selectedAsset.name}
                </span>
                <span className="text-[10px] text-foreground-muted">{selectedAsset.externalId}</span>
              </div>
            </div>
            <span className="text-xs text-success">✓</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-foreground-muted">USD {usdDisplay}</p>
            <button
              type="button"
              onClick={() => {
                setSelectedAsset(null);
                setAssetSearchTerm("");
              }}
              className="text-[11px] text-primary hover:underline"
            >
              Change asset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
