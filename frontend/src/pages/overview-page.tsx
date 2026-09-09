import {
  OverviewKPIs,
  PortfolioOverview,
  WalletOverview,
  GoalsOverview,
  WebsitesOverview,
  RecentActivityOverview,
} from "./overview";
import { OverviewPageHeader } from "./overview/overview-page-header";

export function OverviewPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <OverviewPageHeader />

      <OverviewKPIs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <PortfolioOverview />
          <WalletOverview />
        </div>
        <div className="space-y-4">
          <GoalsOverview />
          <WebsitesOverview />
        </div>
      </div>

      <RecentActivityOverview />
    </div>
  );
}