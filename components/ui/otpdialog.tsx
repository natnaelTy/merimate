"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type OTPDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  otpLength?: number;
  isSubmitting?: boolean;
  error?: string | null;
  onVerify: (code: string) => void | Promise<void>;
  onResend: () => void | Promise<void>;
};

export default function OTPDialog({
  open,
  onOpenChange,
  email,
  otpLength = 6,
  isSubmitting = false,
  error,
  onVerify,
  onResend,
}: OTPDialogProps) {
  const length = Math.max(4, otpLength);
  const [otp, setOtp] = useState<string[]>(() => Array.from({ length }, () => ""));
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (!open) return;
    setOtp(Array.from({ length }, () => ""));
    setMessage("");
    setTimeLeft(60);
  }, [open, length]);

  useEffect(() => {
    if (!open) return;
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [open, timeLeft]);

  const canResend = timeLeft <= 0;

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const updated = [...otp];
      updated[index] = value;
      setOtp(updated);
      if (value && index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const otpCode = useMemo(() => otp.join(""), [otp]);

  const handleVerify = async () => {
    if (otp.some((d) => d === "")) {
      setMessage(`Please enter the complete ${length}-digit code.`);
      return;
    }

    setMessage("");
    await onVerify(otpCode);
  };

  const handleResend = async () => {
    setMessage("");
    await onResend();
    setOtp(Array.from({ length }, () => ""));
    setTimeLeft(60);
    document.getElementById("otp-0")?.focus();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm !rounded-xl p-6">
        <DialogHeader className="mb-4 text-center">
          <DialogTitle className="text-lg font-semibold">
            OTP Verification
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            Enter the {length}-digit code sent to{" "}
            <strong>{email || "your email"}</strong>.
          </DialogDescription>
        </DialogHeader>

        <p className="mb-4 text-center text-xs text-muted-foreground">
          Step 1 of 1: Verify your account
        </p>

        <div className="mb-4 flex justify-center gap-3">
          {otp.map((digit, idx) => (
            <Input
              key={idx}
              id={`otp-${idx}`}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              className="h-14 w-12 rounded-md border border-muted-foreground text-center text-lg font-medium focus:border-primary focus:ring-1 focus:ring-primary"
              maxLength={1}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {error ? (
          <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {!canResend ? (
          <p className="mb-2 text-center text-xs text-muted-foreground">
            You can resend OTP in <strong>{formatTime(timeLeft)}</strong>
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={handleVerify} disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify OTP"}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={!canResend || isSubmitting}
          >
            {canResend ? "Send Again" : "Resend OTP"}
            {!canResend ? (
              <span className="ml-2 text-xs text-muted-foreground">
                {formatTime(timeLeft)}
              </span>
            ) : null}
          </Button>
        </div>

        {message ? (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {message}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
