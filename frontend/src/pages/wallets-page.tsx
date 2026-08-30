import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SummaryWallets } from "./Wallets/summary-wallets";
import { AnalysisWallets } from "./Wallets/analysis-wallets";
import { ListWallets } from "./Wallets/list-wallets";
import { CardsWallets } from "./Wallets/cards-wallets";
import { AddWalletModal } from "@/components/modals/add-wallets";

export function WalletsPage() {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div className="space-y-2">
      {/* Header, Summary, Analytics, All Wallets List*/}
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-4">
          <PageHeader
            title="Wallets"
            subtitle="Manage your wallets and track balances."
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => console.log("Add Transaction clicked")}
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
        <ListWallets />
      </div>
      <div className="p-4 w-full">
        <CardsWallets />
      </div>
      {/* All Activities */}
      <div className="p-4 w-full">All Activities: table with pagination and filters</div>
      <AddWalletModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
