"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import LoginForm from "@/app/(auth)/login/loginForm";
import SignupForm from "@/app/(auth)/signup/signupForm";
import ForgotPasswordForm from "@/app/(auth)/forgot-password/forgotPasswordForm";
import VerifyEmailForm from "@/app/(auth)/verify-email/verifyEmailForm";

interface AuthPageProps {
  initialTab: "login" | "signup" | "forgot-password" | "verify-email";
}

interface AuthState {
  tab: "login" | "signup" | "forgot-password" | "verify-email";
  email?: string;
  from?: string;
}

export default function AuthPage({ initialTab }: AuthPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setState] = useState<AuthState>({
    tab: initialTab,
    email: searchParams.get("email") || undefined,
    from: searchParams.get("from") || undefined,
  });

  // Sync state with props and search parameters if they change
  useEffect(() => {
    setState({
      tab: initialTab,
      email: searchParams.get("email") || undefined,
      from: searchParams.get("from") || undefined,
    });
  }, [initialTab, searchParams]);

  const handleSwitch = (
    tab: "login" | "signup" | "forgot-password" | "verify-email",
    email?: string,
    from?: string
  ) => {
    setState({ tab, email, from });

    // Sync URL path dynamically, appending parameters for verify-email if needed
    let path = `/${tab}`;
    if (tab === "verify-email" && email) {
      path += `?email=${encodeURIComponent(email)}`;
      if (from) {
        path += `&from=${from}`;
      }
    }

    // Update history smoothly
    window.history.pushState(null, "", path);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Premium Ambient Background Shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/5 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/5 pointer-events-none" />

      {/* Brand logo at the top */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <span className="text-2xl font-black bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
          Study Share
        </span>
      </div>

      {/* Centered Form Wrapper */}
      <div className="w-full max-w-md relative z-10">
        <div key={state.tab} className="animate-in fade-in zoom-in-95 duration-300 ease-out">
          {state.tab === "login" ? (
            <LoginForm 
              onSwitchToSignup={() => handleSwitch("signup")} 
              onSwitchToForgotPassword={() => handleSwitch("forgot-password")}
              onSwitchToVerifyEmail={(email, from) => handleSwitch("verify-email", email, from)}
            />
          ) : state.tab === "signup" ? (
            <SignupForm 
              onSwitchToLogin={() => handleSwitch("login")} 
              onSwitchToVerifyEmail={(email, from) => handleSwitch("verify-email", email, from)}
            />
          ) : state.tab === "forgot-password" ? (
            <ForgotPasswordForm onSwitchToLogin={() => handleSwitch("login")} />
          ) : (
            <VerifyEmailForm 
              email={state.email || ""} 
              from={state.from} 
              onVerificationSuccess={() => {
                router.push("/onboarding");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
