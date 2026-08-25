import type { PropsWithChildren } from "react";

import { ClerkProvider } from "@/app/providers/clerk-provider";
import { QueryProvider } from "@/app/providers/query-provider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ClerkProvider>
      <QueryProvider>{children}</QueryProvider>
    </ClerkProvider>
  );
}
