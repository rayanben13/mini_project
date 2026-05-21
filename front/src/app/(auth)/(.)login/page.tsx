"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import LoginForm from "../login/loginForm";

export default function LoginModalPage() {
  const router = useRouter();

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    >
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md">
        {/* Accessibility title */}
        <DialogTitle className="sr-only">Login</DialogTitle>

        <LoginForm />
      </DialogContent>
    </Dialog>
  );
}
