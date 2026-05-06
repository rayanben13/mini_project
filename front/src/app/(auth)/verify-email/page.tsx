"use client";

import useAuthStore from "@/Store/AuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email");
  const from = searchParams.get("from");

  const { verifyEmail, resendVerificationCode } = useAuthStore();

  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // 2. تحديث الـ useEffect لاستعادة الوقت عند التحميل (Reload)
  // useEffect(() => {
  //   const savedExpiry = localStorage.getItem("cooldown_expiry");

  //   if (savedExpiry) {
  //     const remaining = Math.ceil((parseInt(savedExpiry) - Date.now()) / 1000);
  //     if (remaining > 0) {
  //       setCooldown(remaining);
  //     } else {
  //       localStorage.removeItem("cooldown_expiry");
  //     }
  //   }
  // }, []);

  // 3. مؤقت العد التنازلي العادي (الذي تملكه بالفعل)
  useEffect(() => {
    if (cooldown <= 0) {
      localStorage.removeItem("cooldown_expiry");
      return;
    }

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
    console.log("Verification result:", result); // Debug log

    setLoading(false);

    if (result.success) {
      toast.success("Email verified!");
      router.push("/onboarding");
    } else {
      toast.error(result.message);
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
      toast.error(result.message);
    }
  };

  useEffect(() => {
    if (email && from === "login") {
      // تحقق مما إذا كنا قد أرسلنا الكود لهذا البريد في هذه الجلسة (حتى مع Reload)
      const sessionKey = `sent_code_${email}`;
      const alreadySentInSession = sessionStorage.getItem(sessionKey);

      if (!alreadySentInSession) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        handleResend();
        // تخزين الحالة في جلسة المتصفح
        sessionStorage.setItem(sessionKey, "true");
      } else {
        toast.success(
          "Code already sent for this email. Please check your inbox.",
        );
      }
    }
  }, [email, from]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="p-6 border rounded-lg w-96 space-y-4 bg-white dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Verify Email
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          We sent a code to: <strong>{email}</strong>
        </p>

        <Input
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="dark:bg-gray-900 dark:border-gray-700"
        />

        <Button onClick={handleVerify} disabled={loading} className="w-full">
          {loading ? "Verifying..." : "Verify"}
        </Button>

        <Button
          variant="outline"
          disabled={cooldown > 0 || resending}
          onClick={handleResend}
          className="w-full"
        >
          {resending
            ? "Sending..."
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend Code"}
        </Button>
      </div>
    </div>
  );
}
