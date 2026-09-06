import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SummaryWallets } from "./Wallets/summary-wallets";
import { AnalysisWallets } from "./Wallets/analysis-wallets";
import { CardsWallets } from "./Wallets/cards-wallets";
import { WalletsListPanel } from "./Wallets/wallets-list-panel";
import { EditWalletModal } from "./Wallets/edit-modal-wallet";
import { DeleteWalletModal } from "./Wallets/delete-modal-wallet";
import { ArchiveWalletModal } from "./Wallets/archived-modal-wallet";
import { AddWalletModal } from "@/components/modals/add-wallets";
import { AddTransactionModal } from "@/components/modals/add-transaction";
import type { Wallet } from "@/features/wallets/types/wallet.types";

export function WalletsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [txOpen, setTxOpen] = useState(false);
  const [txTab, setTxTab] = useState<"deposit" | "withdraw" | "transfer" | "adjust">("deposit");
  const [txWalletId, setTxWalletId] = useState<string | undefined>(undefined);
  const [editWallet, setEditWallet] = useState<Wallet | null>(null);
  const [deleteWallet, setDeleteWallet] = useState<Wallet | null>(null);
  const [archiveWallet, setArchiveWallet] = useState<Wallet | null>(null);
  return (
    <div>
      {/* Header, Summary, Analytics, All Wallets List*/}
      <div className="flex flex-col lg:flex-row gap-4 p-4">
        <div className="flex-1">
          <PageHeader
            title="Wallets"
            subtitle="Manage your wallets and track balances."
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setTxTab("deposit");
                    setTxWalletId(undefined);
                    setTxOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Transaction
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs"
                  onClick={() => setAddOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  New Wallet
                </Button>
              </>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryWallets />
            <AnalysisWallets />
          </div>
        </div>
        <WalletsListPanel
          onTransaction={(tab, wallet) => {
            setTxTab(tab);
            setTxWalletId(wallet.id);
            setTxOpen(true);
          }}
          onEdit={setEditWallet}
          onArchive={setArchiveWallet}
          onDelete={setDeleteWallet}
        />
      </div>
      <div className="p-4 w-full">
        <CardsWallets />
      </div>
      {/* All Activities */}
      <div className="p-4 w-full">All Activities: table with pagination and filters</div>
      <AddWalletModal open={addOpen} onClose={() => setAddOpen(false)} />
      <AddTransactionModal
        open={txOpen}
        onClose={() => setTxOpen(false)}
        initialTab={txTab}
        initialWalletId={txWalletId}
      />
      <EditWalletModal open={!!editWallet} wallet={editWallet} onClose={() => setEditWallet(null)} />
      <DeleteWalletModal open={!!deleteWallet} wallet={deleteWallet} onClose={() => setDeleteWallet(null)} />
      <ArchiveWalletModal
        open={!!archiveWallet}
        wallet={archiveWallet}
        onClose={() => setArchiveWallet(null)}
      />
    </div>
  );
}
