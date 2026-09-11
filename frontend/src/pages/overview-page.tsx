import { useState } from "react";
import {
  OverviewKPIs,
  PortfolioOverview,
  WalletOverview,
  GoalsOverview,
  WebsitesOverview,
  RecentActivityOverview,
} from "./overview";
import { OverviewPageHeader } from "./overview/overview-page-header";
import { SetupOnboarding } from "@/features/onboarding/components/setup-onboarding";
import { AddWalletModal } from "@/components/modals/add-wallets";
import { AddWebsiteModal } from "@/components/modals/add-websites";
import { NewGoalModal } from "./goals/new-goal-modal";

export function OverviewPage() {
  const [walletOpen, setWalletOpen] = useState(false);
  const [websiteOpen, setWebsiteOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-4">
      <OverviewPageHeader />

      <SetupOnboarding
        onOpenWallet={() => setWalletOpen(true)}
        onOpenWebsite={() => setWebsiteOpen(true)}
        onOpenGoal={() => setGoalOpen(true)}
      />

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

      <AddWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
      <AddWebsiteModal open={websiteOpen} onClose={() => setWebsiteOpen(false)} />
      <NewGoalModal
        open={goalOpen}
        onClose={() => setGoalOpen(false)}
      />
    </div>
  );
}