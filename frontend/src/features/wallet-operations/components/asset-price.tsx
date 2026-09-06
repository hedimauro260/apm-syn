interface AssetPriceProps {
  usdDisplay: string;
}

export function AssetPrice({ usdDisplay }: AssetPriceProps) {
  return <p className="text-[10px] text-foreground-muted">Max 8 decimals · USD {usdDisplay}</p>;
}
