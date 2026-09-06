import type { LogoSize } from "./types";

const CDN_BASE = "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images";

export const LOGO_SIZE_PX: Record<LogoSize, number> = {
  thumb: 25,
  small: 50,
  standard: 64,
  large: 250,
};

export function getCoinLogoUrl(externalId: string, size: LogoSize = "standard"): string {
  const id = encodeURIComponent(externalId.trim());
  return `${CDN_BASE}/${id}/${size}.png`;
}
