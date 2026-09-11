import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SupportPage() {
  return (
    <div className="p-4">
      <PageHeader title="Support" subtitle="Find answers to common questions." />

      <div className="mt-4 max-w-3xl space-y-4">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground">Frequently Asked Questions</h2>

          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Do you store my wallet keys?
              </h3>
              <p className="mt-1 text-sm text-foreground-secondary">
                No. We never request, store, or handle your public or private
                wallet keys. All wallet data is generated from your transaction
                history.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground">
                Where does my data come from?
              </h3>
              <p className="mt-1 text-sm text-foreground-secondary">
                All information displayed is derived from your transaction
                data. We do not access external balances or external accounts.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground">
                Is my data private?
              </h3>
              <p className="mt-1 text-sm text-foreground-secondary">
                Yes. Your data stays local and is not shared with third parties.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground">
                How do I report an issue?
              </h3>
              <p className="mt-1 text-sm text-foreground-secondary">
                Contact our support team through the help section or open an
                issue on our repository.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground">Contact</h2>
          <p className="mt-2 text-sm text-foreground-secondary">
            Need help? Reach out and we will get back to you as soon as
            possible.
          </p>
          <div className="mt-3">
            <Badge variant="default">support@example.com</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}