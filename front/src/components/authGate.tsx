"use client";

import { useFullUserData } from "@/hooks/useUserInformation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGate({ children }) {
  const router = useRouter();
  const { data: user, isLoading } = useFullUserData();

  useEffect(() => {
    if (isLoading) return;
    if (!user?.role) return;

    const path = window.location.pathname;

    if (user.role === "admin" && path !== "/admin") {
      router.replace("/admin");
    }

    if (user.role === "user" && path !== "/dashboard") {
      router.replace("/dashboard");
    }
  }, [user, isLoading]);

  return children;
}