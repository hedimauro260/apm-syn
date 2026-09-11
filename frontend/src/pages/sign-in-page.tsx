import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { SignInForm } from "@/components/auth/sign-in-form";

export function SignInPage() {
  return (
    <AuthPageLayout>
      <SignInForm />
    </AuthPageLayout>
  );
}