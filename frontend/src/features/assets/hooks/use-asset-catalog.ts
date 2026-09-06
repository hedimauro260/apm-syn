import { useMemo } from "react";
import { ASSET_CATALOG } from "../catalog";

export function useAssetCatalogSearch(query: string) {
  const normalized = query.trim().toLowerCase();
  return useMemo(() => {
    if (normalized.length < 2) return [];
    return ASSET_CATALOG.filter(
      a =>
        a.symbol.toLowerCase().includes(normalized) ||
        a.name.toLowerCase().includes(normalized) ||
        a.externalId.toLowerCase().includes(normalized),
    ).slice(0, 20);
  }, [normalized]);
}
