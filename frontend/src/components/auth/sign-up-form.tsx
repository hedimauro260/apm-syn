import { useState, type FormEvent } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Mail, MailCheck, User, UserPlus } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { getClerkErrorMessage, isValidEmail } from "@/components/auth/clerk-errors";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type Step = "details" | "verify";

export function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (!isLoaded || !signUp || !setActive) {
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
    setStep(next);
  };

  const startSession = async (sessionId: string | null) => {
    if (sessionId) {
      await setActive({ session: sessionId });
    }
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const result = await signUp.create({
        firstName: name.trim(),
        emailAddress: email.trim(),
        password,
      });

      if (result.status === "complete") {
        await startSession(result.createdSessionId ?? signUp.createdSessionId);
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      const target = email.trim();
      goTo("verify");
      setInfo(`We sent a verification code to ${target}. It expires shortly, so enter it soon.`);
    } catch (err) {
      setError(getClerkErrorMessage(err, "We couldn't create your account."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!code.trim()) {
      setError("Enter the verification code we sent you.");
      return;
    }

    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: code.trim() });

      if (result.status === "complete") {
        await startSession(result.createdSessionId ?? signUp.createdSessionId);
        return;
      }

      setError("We couldn't verify this code. Please try again.");
    } catch (err) {
      setError(getClerkErrorMessage(err, "We couldn't verify this code."));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setInfo(`A new verification code was sent to ${email.trim()}.`);
    } catch (err) {
      setError(getClerkErrorMessage(err, "We couldn't resend the code."));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard
      icon={step === "details" ? UserPlus : MailCheck}
      title={step === "details" ? "Create your account" : "Verify your email"}
      subtitle={
        step === "details"
          ? "Start tracking every microtask dollar in one place."
          : "We just need to confirm this email is really yours."
      }
      footer={
        <span className="text-foreground-secondary">
          Already have an account?{" "}
          <Link to="/sign-in" className="font-semibold text-primary hover:text-primary-hover">
            Sign in
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

        {step === "details" && (
          <form onSubmit={handleCreate} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="signup-name">Name</Label>
              <div className="relative">
                <Input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  className="h-11 pl-10"
                />
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Input
                  id="signup-email"
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
              <Label htmlFor="signup-password">Password</Label>
              <PasswordInput
                id="signup-password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="h-11"
                value={password}
                onChange={event => setPassword(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-confirm-password">Confirm password</Label>
              <PasswordInput
                id="signup-confirm-password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                className="h-11"
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
              />
            </div>

            <Button type="submit" loading={loading} className="h-11 w-full rounded-lg text-base">
              Create account <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="text-center text-xs text-foreground-muted">
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={handleVerify} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="signup-code">Verification code</Label>
              <Input
                id="signup-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit code"
                value={code}
                onChange={event => setCode(event.target.value)}
                className="h-11 text-center text-lg tracking-[0.3em]"
              />
            </div>

            <Button type="submit" loading={loading} className="h-11 w-full rounded-lg text-base">
              Verify email <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => goTo("details")}
                className="flex items-center gap-1.5 font-medium text-foreground-secondary transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Edit email
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="font-medium text-primary transition-colors hover:text-primary-hover disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AuthCard>
  );
}