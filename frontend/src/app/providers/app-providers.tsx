import type { PropsWithChildren } from "react";

import { ClerkProvider } from "@/app/providers/clerk-provider";
import { QueryProvider } from "@/app/providers/query-provider";
import { ToastProvider } from "@/components/ui/toast";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ClerkProvider>
      <QueryProvider>
        <ToastProvider>{children}</ToastProvider>
      </QueryProvider>
    </ClerkProvider>
  );
}
