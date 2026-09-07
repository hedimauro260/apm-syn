import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import * as marketDataApi from "../api/market-data-api";

export function useAssetPrices(assetIds: string[]) {
  const { getToken } = useAuth();

  const queries = useQueries({
    queries: assetIds.map(id => ({
      queryKey: ["market-data", "price", id],
      queryFn: () => getAuthToken(getToken).then(token => marketDataApi.convertToUsd(token, id, 1)),
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      enabled: Boolean(id),
    })),
  });

  return useMemo(() => {
    const map = new Map<string, number | undefined>();
    for (let i = 0; i < queries.length; i++) {
      const q = queries[i]!;
      const id = assetIds[i]!;
      if (q.data?.data?.priceUsd != null) {
        map.set(id, q.data.data.priceUsd);
      } else {
        map.set(id, undefined);
      }
    }
    return map;
  }, [queries, assetIds]);
}

async function getAuthToken(getToken: () => Promise<string | null>): Promise<string> {
  const token = await getToken();
  if (!token) throw new Error("Authentication token not available");
  return token;
}
