"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/Store/AuthStore";
import DarkModeStore from "@/Store/darkModSroe";
import { Moon, Sun } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false); // نغير الاسم ليكون أدق
  const router = useRouter();
  const { Mod, HandlDarkMode } = DarkModeStore();

  useEffect(() => {
    // هذه الدالة تراقب Zustand حتى ينتهي من استعادة البيانات
    const unsubHydrate = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // تأكيد إضافي في حال كان قد انتهى بالفعل
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => unsubHydrate();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // أثناء التحميل أو قبل استرجاع البيانات، نعرض هيكل الهيدر فقط
  if (!isHydrated) {
    return (
      <header className="border-b bg-white dark:bg-gray-900 h-16 transition-colors">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-4">
          <div className="font-bold text-xl opacity-50">AuthSystem</div>
        </div>
      </header>
    );
  }

  const DynamicDropdown = dynamic(
    () =>
      import("@/components/ui/dropdown-menu").then((mod) => ({
        default: ({ user, logout, router }) => (
          <mod.DropdownMenu>
            <mod.DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full h-8 w-8">
                {console.log("User in Dropdown:", user)} {/* Debug log */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </mod.DropdownMenuTrigger>
            <mod.DropdownMenuContent
              align="end"
              className="w-52 bg-white dark:bg-gray-900"
            >
              <div className="px-3 py-2 text-sm text-gray-500 border-b">
                {user?.email}
              </div>
              <mod.DropdownMenuItem onClick={() => router.push("/profile")}>
                Profile
              </mod.DropdownMenuItem>
              <mod.DropdownMenuItem onClick={logout} className="text-red-500">
                Logout
              </mod.DropdownMenuItem>
            </mod.DropdownMenuContent>
          </mod.DropdownMenu>
        ),
      })),
    {
      ssr: false,
      loading: () => (
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
      ), // Skeleton بسيط
    },
  );

  return (
    <header className="border-b bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-xl text-gray-900 dark:text-white"
        >
          AuthSystem
        </Link>

        <div className="flex items-center gap-3">
          {/* 🌙 Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={HandlDarkMode}
            className="rounded-full"
          >
            {Mod ? (
              <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500" />
            )}
          </Button>

          {/* User */}
          {isAuthenticated && user ? (
            <DynamicDropdown
              user={user}
              logout={handleLogout}
              router={router}
            />
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
