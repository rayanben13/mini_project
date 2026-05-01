"use client";

import { Button } from "@/components/ui/button";
import { useProfileDropdownData } from "@/hooks/useUserInformation";
import useAuthStore from "@/Store/AuthStore";
import DarkModeStore from "@/Store/darkModSroe";
import { Moon, Search, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MobileSidebar } from "./MobileSidebar";
import { Input } from "./ui/input";

export default function Header() {
  const router = useRouter();
  const { user, logout, initAuth, isAuthenticated, isHydrated } = useAuthStore();
  const { Mod, HandlDarkMode } = DarkModeStore();
  const { data: extraInfo, isFetching } = useProfileDropdownData();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { initAuth(); }, [initAuth]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    localStorage.removeItem("token")
    router.push("/login");
    logout();
    window.location.reload();
  };


  const info = extraInfo?.profileData;

  const displayUser = {
    ...user,
    ...info
  };
  console.log("dataaa", displayUser)

  // --- Render ---

  if (!isHydrated) {
    return ( /* ... Skeleton Code ... */
      <header className="border-b bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-4">
          <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-4">

        <div className="flex items-center gap-3 w-full max-w-md">
          {isAuthenticated && <MobileSidebar />}
          {!isAuthenticated ? (
            <Link href="/" className="font-bold text-xl shrink-0">
              AuthSystem
            </Link>
          ) : (
            <div className="relative w-full transition-all duration-300">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search anything..."
                className="pl-9 bg-gray-50 dark:bg-gray-800 border-none focus-visible:ring-1"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={HandlDarkMode}>
            {Mod ? <Moon /> : <Sun />}
          </Button>

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>

              {/* Avatar */}
              <div onClick={() => setOpen(!open)} className="cursor-pointer">
                {displayUser?.img_user ? (
                  <Image
                    src={displayUser.img_user}
                    alt="avatar"
                    width={36}
                    height={36}
                    className="rounded-full border"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold relative">
                    {displayUser?.username?.charAt(0).toUpperCase()}
                    {isFetching && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </div>
                )}
              </div>

              {/* Dropdown */}
              {open && (
                <div className="absolute right-0 mt-2 z-50 w-48 bg-white dark:bg-gray-800 border rounded-xl shadow-lg p-2 animate-in fade-in">
                  <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 border-b">
                    {displayUser?.fullname || displayUser?.username}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/login"><Button variant="ghost">Login</Button></Link>
              <Link href="/signup"><Button>Sign Up</Button></Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}