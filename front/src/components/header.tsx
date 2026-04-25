"use client";

import { Button } from "@/components/ui/button";
import useAuthStore from "@/Store/AuthStore";
import DarkModeStore from "@/Store/darkModSroe";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const { user, isAuthenticated, logout, initAuth } = useAuthStore();
  const { Mod, HandlDarkMode } = DarkModeStore();

  // ✅ مهم جداً: init auth بعد mount
  useEffect(() => {
    initAuth();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="border-b bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-4">
        
        {/* Logo */}
        <Link href="/" className="font-bold text-xl">
          AuthSystem
        </Link>

        <div className="flex items-center gap-3">

          {/* Dark Mode */}
          <Button variant="ghost" size="icon" onClick={HandlDarkMode}>
            {Mod ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500" />
            )}
          </Button>

          {/* Auth UI */}
          {user?.token ? (
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}