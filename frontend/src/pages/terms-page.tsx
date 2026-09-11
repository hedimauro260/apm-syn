import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export function TermsPage() {
  return (
    <div className="p-4">
      <PageHeader
        title="Terms of Service"
        subtitle="Please read these terms carefully before using the service."
      />

      <div className="mt-4 max-w-3xl space-y-4">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground">1. Acceptance</h2>
          <p className="mt-2 text-sm text-foreground-secondary">
            By using this service you agree to these terms. If you do not
            agree, please do not use the application.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground">2. Use of the service</h2>
          <p className="mt-2 text-sm text-foreground-secondary">
            You agree to use the service only for lawful purposes and in
            accordance with these terms.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground">3. Data and privacy</h2>
          <p className="mt-2 text-sm text-foreground-secondary">
            We do not request or store wallet keys. Data used by the service
            is generated from your transactions and remains local.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground">4. Limitations</h2>
          <p className="mt-2 text-sm text-foreground-secondary">
            The service is provided as is, without warranties. We are not
            liable for any indirect or consequential damages.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground">5. Changes</h2>
          <p className="mt-2 text-sm text-foreground-secondary">
            We may update these terms from time to time. Continued use of the
            service constitutes acceptance of the updated terms.
          </p>
        </Card>
      </div>
    </div>
  );
}