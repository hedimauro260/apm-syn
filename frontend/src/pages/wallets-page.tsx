import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Ellipsis } from "lucide-react";

export function WalletsPage() {
  return (
    <div className="space-y-2 border border-border">
      <div className="flex">
        <div className="flex-1 p-4">
          <PageHeader
            title="Wallets"
            subtitle="Manage your wallets and track balances."
            actions={
              <>
                <Button
                  variant="secondary"
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
                  onClick={() => console.log("Add Wallet clicked")}
                >
                  <Plus className="h-4 w-4" />
                  Add Wallet
                </Button>
              </>
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="p-0 border border-border/50 rounded-lg"> Summary </div>
            <div className="p-0 border border-border/50 rounded-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-base">Wallets by participation</h2>
                <Button variant="ghost" size="sm" className="text-xs">
                  <Ellipsis className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2">
                <p className="text-sm text-foreground-muted">
                  This section shows the distribution of wallets based on their participation in various activities.
                </p>
              </div>
            </div>

          </div>
        </div>
        <div className="flex flex-col gap-4 p-4 w-120 border border-border/50 rounded-lg">
          <h2 className="text-lg font-semibold">All Wallets</h2>
          {/* Wallets List */}
        </div>
      </div>
      <div className="p-4 w-full border border-border">Card Wallets: list of cards with search, filters</div>
      <div className="p-4 w-full border border-border">All Activities: table with pagination and filters</div>
    </div>
  );
}
