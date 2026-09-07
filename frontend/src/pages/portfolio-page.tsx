import { PortfolioHeader } from "./portfolio/portfolio-header";
import { PortfolioSummary } from "./portfolio/portfolio-summary";
import { AnalysisParticipation } from "./portfolio/analysis-participation";
import { AssetDistribution } from "./portfolio/asset-distribution";
import { LiveCryptoPrices } from "@/components/modules/live-crypto-prices";
import { ConsolidatedHoldings } from "./portfolio/consolidated-holdings";

export function PortfolioPage() {
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 p-4">
        <div className="flex-1">
          <PortfolioHeader />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PortfolioSummary />
            <AnalysisParticipation />
          </div>
        </div>
        <AssetDistribution />
      </div>
      <LiveCryptoPrices />
      <div className="p-4">
        <ConsolidatedHoldings />
      </div>
    </>
  );
}
