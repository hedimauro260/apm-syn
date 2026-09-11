import { SignIn } from "@clerk/clerk-react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { useClerkAppearance } from "@/components/auth/clerk-appearance";

export function SignInPage() {
  const appearance = useClerkAppearance();

  return (
    <AuthPageShell>
      <SignIn appearance={appearance} />
    </AuthPageShell>
  );
}