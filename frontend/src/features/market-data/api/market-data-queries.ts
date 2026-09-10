import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import * as marketDataApi from "./market-data-api";

async function getAuthToken(getToken: () => Promise<string | null>): Promise<string> {
  const token = await getToken();
  if (!token) throw new Error("Authentication token not available");
  return token;
}

export function useSearchAssetsQuery(q: string, enabled = true) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["market-data", "search", q],
    queryFn: () => getAuthToken(getToken).then(token => marketDataApi.searchAssets(token, q)),
    enabled: enabled && q.trim().length >= 2,
    staleTime: 60_000,
  });
}

export function useConvertQuery(assetId: string, quantity: number, enabled = true) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["market-data", "convert", assetId, quantity],
    queryFn: () => getAuthToken(getToken).then(token => marketDataApi.convertToUsd(token, assetId, quantity)),
    enabled: enabled && Boolean(assetId) && quantity > 0,
    staleTime: 30_000,
  });
}

export function useMarketTickerQuery(ids: string[], enabled = true) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["market-data", "ticker", ids],
    queryFn: () => getAuthToken(getToken).then(token => marketDataApi.getTicker(token, ids)),
    enabled: enabled && ids.length > 0,
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}
