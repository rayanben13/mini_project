"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useAuthStore from "../../Store/AuthStore";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) router.push("/profile");
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
