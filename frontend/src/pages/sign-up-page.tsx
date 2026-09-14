import { Helmet } from "react-helmet-async";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { SignUpForm } from "@/components/auth/sign-up-form";

export function SignUpPage() {
  return (
    <AuthPageLayout>
      <Helmet>
        <title>Sign Up | APM Syn</title>
        <meta
          name="description"
          content="Create a free APM Syn account and start tracking your microtask earnings."
        />
      </Helmet>
      <SignUpForm />
    </AuthPageLayout>
  );
}