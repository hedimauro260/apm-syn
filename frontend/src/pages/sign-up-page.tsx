import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { SignUpForm } from "@/components/auth/sign-up-form";

export function SignUpPage() {
  return (
    <AuthPageLayout>
      <SignUpForm />
    </AuthPageLayout>
  );
}