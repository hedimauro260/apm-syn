import { Link } from "react-router-dom";

export function AppPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">APM SYN App</h1>
      <p className="text-foreground-secondary">Frontend architecture is ready.</p>
      <Link
        to="/"
        className="inline-block px-4 py-2 bg-surface border border-border rounded-lg text-sm hover:bg-surface-elevated transition-colors"
      >
        Back to Home
      </Link>
    </section>
  );
}
