import { z } from "zod";

const coinDetailSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
});

const searchResponseSchema = z.object({
  coins: z.array(
    z.object({
      id: z.string(),
      symbol: z.string(),
      name: z.string(),
    })
  ),
});

const priceResponseSchema = z.record(
  z.string(),
  z.object({
    usd: z.number(),
  })
);

export const searchAssetsSchema = searchResponseSchema;
export const assetDetailSchema = coinDetailSchema;
export const priceDetailSchema = priceResponseSchema;