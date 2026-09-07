import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface WebsitesPageHeaderProps {
  onAddTransaction: () => void;
  onNewSite: () => void;
}

export function WebsitesPageHeader({ onAddTransaction, onNewSite }: WebsitesPageHeaderProps) {
  return (
    <PageHeader
      title="Websites"
      subtitle="Manage your websites and track earnings."
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={onAddTransaction}
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="text-xs"
            onClick={onNewSite}
          >
            <Plus className="h-4 w-4" />
            New Site
          </Button>
        </>
      }
    />
  );
}
