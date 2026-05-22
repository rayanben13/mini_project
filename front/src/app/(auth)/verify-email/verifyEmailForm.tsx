"use client";

import useAuthStore from "@/Store/AuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

interface VerifyEmailFormProps {
  email: string;
  from?: string;
  onVerificationSuccess?: () => void;
}

export default function VerifyEmailForm({
  email,
  from,
  onVerificationSuccess,
}: VerifyEmailFormProps) {
  const router = useRouter();
  const { verifyEmail, resendVerificationCode } = useAuthStore();

  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Prevent duplicate resend triggering in development React StrictMode
  const sentRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    if (!email) return toast.error("Invalid email");
    if (!code) return toast.error("Enter the code");

    setLoading(true);
    const result = await verifyEmail({ email, code });
    setLoading(false);

    if (result.success) {
      toast.success("Email verified!");
      if (onVerificationSuccess) {
        onVerificationSuccess();
      } else {
        router.push("/onboarding");
      }
    } else {
      toast.error(result.message || "Verification failed");
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setResending(true);
    const result = await resendVerificationCode({ email });
    setResending(false);

    if (result.success) {
      setCooldown(60);
      toast.success("Code sent!");
    } else {
      toast.error(result.message || "Failed to resend code");
    }
  };

  useEffect(() => {
    if (email && from === "login" && !sentRef.current) {
      sentRef.current = true;
      const sessionKey = `sent_code_${email}`;
      const alreadySentInSession = sessionStorage.getItem(sessionKey);

      if (!alreadySentInSession) {
        handleResend();
        sessionStorage.setItem(sessionKey, "true");
      } else {
        toast.success(
          "Code already sent for this email. Please check your inbox.",
        );
      }
    }
  }, [email, from]);

  return (
    <Card className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Verify Email
        </CardTitle>

        <CardDescription className="text-gray-500 dark:text-gray-400">
          We sent a code to: <strong className="text-slate-900 dark:text-white">{email}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="dark:bg-gray-900 dark:border-gray-700 h-11 rounded-xl text-center font-bold tracking-widest text-lg"
        />

        <Button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-11 font-medium"
        >
          {loading ? "Verifying..." : "Verify"}
        </Button>

        <Button
          variant="outline"
          disabled={cooldown > 0 || resending}
          onClick={handleResend}
          className="w-full rounded-xl h-11"
        >
          {resending
            ? "Sending..."
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend Code"}
        </Button>
      </CardContent>
    </Card>
  );
}
