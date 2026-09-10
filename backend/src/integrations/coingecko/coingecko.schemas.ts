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

const marketsResponseSchema = z.array(
  z.object({
    id: z.string(),
    symbol: z.string(),
    name: z.string(),
    current_price: z.number().nullable(),
    price_change_percentage_24h: z.number().nullable(),
  })
);

export const searchAssetsSchema = searchResponseSchema;
export const assetDetailSchema = coinDetailSchema;
export const priceDetailSchema = priceResponseSchema;
export const marketsSchema = marketsResponseSchema;