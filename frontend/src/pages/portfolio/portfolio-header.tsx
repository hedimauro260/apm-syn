import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PortfolioHeader() {
  const navigate = useNavigate();

  return (
    <PageHeader
      title="Portfolio"
      subtitle="View your portfolio overview and asset distribution."
      actions={
        <Button variant="ghost" size="sm" className="text-xs h-7 px-2 gap-1" onClick={() => navigate("/app/wallets")}>
          View Wallets
          <ArrowUpRight className="h-3 w-3" />
        </Button>
      }
    />
  );
}
