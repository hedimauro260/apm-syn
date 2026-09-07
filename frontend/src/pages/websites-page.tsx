import { useState } from "react";
import { WebsitesPageHeader } from "./websites/websites-page-header";
import { WebsitesSummary } from "./websites/websites-summary";
import { DailyEarnings } from "./websites/daily-earnings";
import { WebsitesTable } from "./websites/websites-table";
import { WebsitesAnalysis } from "./websites/websites-analysis";
import { WebsitesList } from "./websites/websites-list";
import { WebsiteTransactionsModal } from "./websites/website-transactions-modal";
import { AddWebsiteModal } from "@/components/modals/add-websites";

type WsTab = "earnings" | "withdrawn";

interface TxModalState {
  open: boolean;
  tab: WsTab;
  websiteId?: string;
}

export function WebsitesPage() {
  const [txModal, setTxModal] = useState<TxModalState>({ open: false, tab: "earnings" });
  const [siteOpen, setSiteOpen] = useState(false);

  const openTxModal = (tab: WsTab, websiteId?: string) =>
    setTxModal({ open: true, tab, websiteId });

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-4 p-4">
        <div className="flex-1">
          <WebsitesPageHeader
            onAddTransaction={() => openTxModal("earnings")}
            onNewSite={() => setSiteOpen(true)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WebsitesSummary />
            <WebsitesAnalysis />
          </div>

        </div>
        <WebsitesList />
      </div>
      <div className="px-4 mt-4">
        <DailyEarnings />
      </div>
      <div className="px-4 mt-4">
        <WebsitesTable onTransaction={openTxModal} />
      </div>
      <WebsiteTransactionsModal
        open={txModal.open}
        onClose={() => setTxModal(prev => ({ ...prev, open: false }))}
        initialTab={txModal.tab}
        initialWebsiteId={txModal.websiteId}
      />
      <AddWebsiteModal
        open={siteOpen}
        onClose={() => setSiteOpen(false)}
      />
    </div>
  );
}
