import { Helmet } from "react-helmet-async";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { SignInForm } from "@/components/auth/sign-in-form";

export function SignInPage() {
  return (
    <AuthPageLayout>
      <Helmet>
        <title>Sign In | APM Syn</title>
        <meta name="description" content="Sign in to your APM Syn account." />
      </Helmet>
      <SignInForm />
    </AuthPageLayout>
  );
}