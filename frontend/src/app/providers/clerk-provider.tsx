import { ClerkProvider as BaseClerkProvider } from "@clerk/clerk-react";
import type { PropsWithChildren } from "react";

import { env } from "@/config/env";

export function ClerkProvider({ children }: PropsWithChildren) {
  return (
    <BaseClerkProvider publishableKey={env.clerkPublishableKey}>
      {children}
    </BaseClerkProvider>
  );
}
