"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClientSupabase } from "@/lib/supabase/client";
import { toast } from "sonner";

type Step = "details" | "otp";

export default function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(false);
  };

  const verifyOtp = async () => {
    const trimmedEmail = email.trim();
    const token = otp.trim();
    if (!token) {
      setError("Enter the verification code.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const supabase = createClientSupabase();
    const { error: verifyError } = await supabase.auth.verifyOtp({
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

    toast.success("Account verified");
    router.push("/dashboard");
  };

  return (
    <div className="space-y-4">
      {error ? (
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
              placeholder="Merimate Studio"
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
              placeholder="you@studio.com"
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
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void verifyOtp();
          }}
        >
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>We sent a code to {email}.</p>
            <button
              type="button"
              className="text-xs font-medium text-foreground"
              onClick={() => {
                setStep("details");
                setOtp("");
                setError(null);
              }}
            >
              Use a different email
            </button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="otp">Verification code</Label>
            <Input
              id="otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify & continue"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => void register()}
              disabled={isSubmitting}
            >
              Resend code
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
