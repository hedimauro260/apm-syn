import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { HeaderLogo } from "@/components/layout/Header/header-logo";

export function AuthPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground font-sans selection:bg-primary/20 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-info/10 blur-[110px]" />
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-success/10 blur-[120px]" />
      </div>

      <div className="relative flex w-full max-w-md flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-5">
          <Link to="/" aria-label="APM Syn home" className="transition-opacity hover:opacity-80">
            <HeaderLogo />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-foreground-secondary shadow-sm transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}