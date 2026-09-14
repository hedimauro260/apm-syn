import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <Helmet>
        <title>Page Not Found | APM Syn</title>
        <meta name="description" content="Page not found." />
      </Helmet>
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-foreground-secondary mb-8">Page not found.</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover transition-colors"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
