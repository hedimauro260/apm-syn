import { SignUp } from "@clerk/clerk-react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { useClerkAppearance } from "@/components/auth/clerk-appearance";

export function SignUpPage() {
  const appearance = useClerkAppearance();

  return (
    <AuthPageShell>
      <SignUp appearance={appearance} />
    </AuthPageShell>
  );
}