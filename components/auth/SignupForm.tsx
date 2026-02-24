"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClientSupabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import OTPDialog from "@/components/ui/otpdialog";

type Step = "details" | "otp";

export default function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);

  const register = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();
    if (!trimmedEmail) {
      setError("Enter your email to continue.");
      return;
    }
    if (!trimmedName) {
      setError("Enter your full name to continue.");
      return;
    }
    if (!password.trim()) {
      setError("Enter a password to continue.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const supabase = createClientSupabase();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: trimmedName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      toast.error(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    if (!data.user) {
      const message = "Unable to create your account.";
      setError(message);
      toast.error(message);
      setIsSubmitting(false);
      return;
    }

    toast.success("Account created", {
      description: "Check your email for the verification code.",
    });
    setStep("otp");
    setIsOtpOpen(true);
    setIsSubmitting(false);
  };

  const verifyOtp = async (token: string) => {
    const trimmedEmail = email.trim();
    if (!token) {
      setError("Enter the verification code.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const supabase = createClientSupabase();
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: trimmedEmail,
      token,
      type: "signup",
    });

    if (verifyError) {
      setError(verifyError.message);
      toast.error(verifyError.message);
      setIsSubmitting(false);
      return;
    }

    let activeUser = data.user ?? null;

    if (!data.session) {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

      if (signInError) {
        const message = signInError.message || "Account verified. Please sign in.";
        setError(message);
        toast.error(message);
        setIsSubmitting(false);
        return;
      }

      activeUser = signInData.user ?? activeUser;
    }

    if (activeUser?.id) {
      const { error: profileError } = await supabase
        .from("users")
        .upsert(
          { id: activeUser.id, email: activeUser.email ?? trimmedEmail },
          { onConflict: "id" }
        );

      if (profileError) {
        toast.error("Account verified, but profile setup failed.");
      }
    }

    toast.success("Account verified");
    router.push("/dashboard");
  };

  const resendOtp = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter your email to continue.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const supabase = createClientSupabase();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: trimmedEmail,
    });

    if (resendError) {
      setError(resendError.message);
      toast.error(resendError.message);
      setIsSubmitting(false);
      return;
    }

    toast.success("Verification code resent");
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {error && step === "details" ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {step === "details" ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void register();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@gmail.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create account"}
          </Button>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>We sent a code to {email}.</p>
            <button
              type="button"
              className="text-xs font-medium text-foreground"
              onClick={() => {
                setStep("details");
                setIsOtpOpen(false);
                setError(null);
              }}
            >
              Use a different email
            </button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setIsOtpOpen(true)}
          >
            Enter verification code
          </Button>
          <OTPDialog
            open={isOtpOpen}
            onOpenChange={setIsOtpOpen}
            email={email}
            isSubmitting={isSubmitting}
            error={error}
            onVerify={verifyOtp}
            onResend={resendOtp}
          />
        </div>
      )}
    </div>
  );
}
