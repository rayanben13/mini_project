"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoginForm from "@/app/(auth)/login/loginForm";
import SignupForm from "@/app/(auth)/signup/signupForm";
import ForgotPasswordForm from "@/app/(auth)/forgot-password/forgotPasswordForm";

interface AuthModalProps {
  initialTab: "login" | "signup" | "forgot-password";
}

export default function AuthModal({ initialTab }: AuthModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot-password">(initialTab);

  // Sync state with prop if it changes externally
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleSwitch = (tab: "login" | "signup" | "forgot-password") => {
    setActiveTab(tab);
    // Use replaceState instead of pushState to prevent adding multiple entries to the history stack.
    // This guarantees that when the user closes the modal (router.back()), they exit the modal
    // completely in a single click, returning exactly to the page they were browsing!
    window.history.replaceState(null, "", `/${tab}`);
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          router.back();
        }
      }}
    >
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md animate-in fade-in duration-200">
        {/* Accessibility titles */}
        <DialogTitle className="sr-only">
          {activeTab === "login" ? "Login" : activeTab === "signup" ? "Sign Up" : "Forgot Password"}
        </DialogTitle>

        {/* Smooth animation wrapper when switching forms */}
        <div key={activeTab} className="animate-in fade-in zoom-in-95 duration-300 ease-out">
          {activeTab === "login" ? (
            <LoginForm 
              onSwitchToSignup={() => handleSwitch("signup")} 
              onSwitchToForgotPassword={() => handleSwitch("forgot-password")}
            />
          ) : activeTab === "signup" ? (
            <SignupForm onSwitchToLogin={() => handleSwitch("login")} />
          ) : (
            <ForgotPasswordForm onSwitchToLogin={() => handleSwitch("login")} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
