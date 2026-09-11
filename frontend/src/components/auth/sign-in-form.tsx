import { useState, type FormEvent } from "react";
import { useSignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { getClerkErrorMessage, isValidEmail } from "@/components/auth/clerk-errors";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type Step = "credentials" | "recovery" | "reset" | "totp";

export function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [resetFactorId, setResetFactorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isLoaded || !signIn || !setActive) {
    return (
      <div className="flex h-56 w-full max-w-md items-center justify-center rounded-2xl border border-border bg-surface">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  const goTo = (next: Step) => {
    setError(null);
    setInfo(null);
    setLoading(false);
    setResetFactorId(null);
    setStep(next);
  };

  const startSession = async (sessionId: string | null) => {
    if (sessionId) {
      await setActive({ session: sessionId });
    }
  };

  const handleCredentials = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email.trim(), password });

      if (result.status === "complete") {
        await startSession(result.createdSessionId);
        return;
      }

      if (result.status === "needs_second_factor") {
        const strategies = result.supportedSecondFactors?.map(factor => factor.strategy) ?? [];
        if (strategies.includes("totp")) {
          goTo("totp");
          setInfo(
            "Two-factor authentication is enabled on your account. Enter the code from your authenticator app."
          );
          return;
        }
      }

      setError("We couldn't sign you in. Please check your credentials and try again.");
    } catch (err) {
      setError(getClerkErrorMessage(err, "Invalid email address or password."));
    } finally {
      setLoading(false);
    }
  };

  const handleSendRecovery = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!isValidEmail(email)) {
      setError("Enter the email address associated with your account.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email.trim() });
      const resetFactor = (
        result.supportedFirstFactors ?? []
      ).find(factor => factor.strategy === "reset_password_email_code") as
        | { strategy: "reset_password_email_code"; emailAddressId: string }
        | undefined;

      if (!resetFactor) {
        setError("Password reset by email is not available for your account.");
        return;
      }

      setResetFactorId(resetFactor.emailAddressId);
      await signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: resetFactor.emailAddressId,
      });
      goTo("reset");
      setInfo(`We sent a reset code to ${email.trim()}. Enter it together with your new password.`);
    } catch (err) {
      setError(getClerkErrorMessage(err, "We couldn't start the password reset."));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!recoveryCode) {
      setError("Enter the reset code you received by email.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: recoveryCode.trim(),
        password: newPassword,
      });

      if (result.status === "complete") {
        await startSession(result.createdSessionId);
        return;
      }

      setError("We couldn't reset your password. Please check the code and try again.");
    } catch (err) {
      setError(getClerkErrorMessage(err, "We couldn't reset your password."));
    } finally {
      setLoading(false);
    }
  };

  const handleTotp = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!totpCode) {
      setError("Enter the code from your authenticator app.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "totp",
        code: totpCode.trim(),
      });

      if (result.status === "complete") {
        await startSession(result.createdSessionId);
        return;
      }

      setError("That code isn't valid. Try again or go back.");
    } catch (err) {
      setError(getClerkErrorMessage(err, "We couldn't verify the code."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      icon={step === "credentials" ? KeyRound : step === "totp" ? ShieldCheck : Mail}
      title={
        step === "credentials"
          ? "Welcome back"
          : step === "totp"
            ? "Two-factor authentication"
            : "Reset your password"
      }
      subtitle={
        step === "credentials"
          ? "Sign in to your API Syn account to continue."
          : "Follow the steps below to regain access to your account."
      }
      footer={
        <span className="text-foreground-secondary">
          Don't have an account?{" "}
          <Link to="/sign-up" className="font-semibold text-primary hover:text-primary-hover">
            Create one
          </Link>
        </span>
      }
    >
      <div className="space-y-5">
        {error && (
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {info && (
          <Alert variant="info">
            <AlertDescription>{info}</AlertDescription>
          </Alert>
        )}

        {step === "credentials" && (
          <form onSubmit={handleCredentials} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="h-11 pl-10"
                />
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => goTo("recovery")}
                  className="text-xs font-medium text-primary transition-colors hover:text-primary-hover"
                >
                  Forgot password?
                </button>
              </div>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                placeholder="Your password"
                className="h-11"
                value={password}
                onChange={event => setPassword(event.target.value)}
              />
            </div>

            <Button type="submit" loading={loading} className="h-11 w-full rounded-lg text-base">
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {step === "recovery" && (
          <form onSubmit={handleSendRecovery} className="space-y-5" noValidate>
            <p className="text-sm text-foreground-secondary">
              Enter the email address associated with your account and we'll send you a one-time
              code to reset your password.
            </p>

            <div className="space-y-2">
              <Label htmlFor="recovery-email">Email</Label>
              <div className="relative">
                <Input
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="h-11 pl-10"
                />
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
              </div>
            </div>

            <Button type="submit" loading={loading} className="h-11 w-full rounded-lg text-base">
              Send reset code <ArrowRight className="h-4 w-4" />
            </Button>

            <button
              type="button"
              onClick={() => goTo("credentials")}
              className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="reset-code">Verification code</Label>
              <Input
                id="reset-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit code"
                value={recoveryCode}
                onChange={event => setRecoveryCode(event.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="h-11"
                value={newPassword}
                onChange={event => setNewPassword(event.target.value)}
              />
            </div>

            <Button type="submit" loading={loading} className="h-11 w-full rounded-lg text-base">
              Reset password <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => goTo("recovery")}
                className="flex items-center gap-1.5 font-medium text-foreground-secondary transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setInfo(null);
                  if (!resetFactorId) {
                    setStep("recovery");
                    return;
                  }
                  setLoading(true);
                  signIn
                    .prepareFirstFactor({
                      strategy: "reset_password_email_code",
                      emailAddressId: resetFactorId,
                    })
                    .then(() => {
                      setInfo(`A new code was sent to ${email.trim()}.`);
                    })
                    .catch(err => setError(getClerkErrorMessage(err, "We couldn't resend the code.")))
                    .finally(() => setLoading(false));
                }}
                className="font-medium text-primary transition-colors hover:text-primary-hover"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        {step === "totp" && (
          <form onSubmit={handleTotp} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="totp-code">Authenticator code</Label>
              <Input
                id="totp-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit code"
                value={totpCode}
                onChange={event => setTotpCode(event.target.value)}
                className="h-11 text-center text-lg tracking-[0.3em]"
              />
            </div>

            <Button type="submit" loading={loading} className="h-11 w-full rounded-lg text-base">
              Verify <ArrowRight className="h-4 w-4" />
            </Button>

            <button
              type="button"
              onClick={() => goTo("credentials")}
              className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </button>
          </form>
        )}
      </div>
    </AuthCard>
  );
}