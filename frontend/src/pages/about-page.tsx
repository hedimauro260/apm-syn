import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export function AboutPage() {
  return (
    <div className="p-4">
      <PageHeader title="About" subtitle="Learn more about this project." />

      <div className="mt-4 max-w-3xl space-y-4">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground">What is this?</h2>
          <p className="mt-2 text-sm text-foreground-secondary">
            A personal finance management tool focused on tracking transactions,
            organizing wallets, and setting savings goals.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground">Developed by</h2>
          <p className="mt-2 text-sm text-foreground-secondary">
            This project was developed by{" "}
            <span className="font-medium text-foreground">Kubo Labs</span>, a
            startup focused on digital solutions.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground">Our mission</h2>
          <p className="mt-2 text-sm text-foreground-secondary">
            To provide simple, transparent, and practical tools for managing
            personal finances without complexity.
          </p>
        </Card>
      </div>
    </div>
  );
}