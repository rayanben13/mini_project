"use client";

import { Button } from "@/components/ui/button";
import { useProfileDropdownData } from "@/hooks/useUserInformation";

import useAuthStore from "@/Store/AuthStore";
import DarkModeStore from "@/Store/darkModSroe";

import {
  LogOut,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import { useRouter } from "next/navigation";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import SearchBar from "./SearchBar";
import { MobileSidebar } from "./sideBar/MobileSidebar";

export default function Header() {

  const router = useRouter();

  const {
    user,
    logout,
    initAuth,
    isAuthenticated,
    isHydrated,
  } = useAuthStore();

  const {
    Mod,
    HandlDarkMode,
  } = DarkModeStore();

  const {
    data: extraInfo,
    isFetching,
  } = useProfileDropdownData();

  const [open, setOpen] = useState(false);

  const [mobileSearchOpen, setMobileSearchOpen] =
    useState(false);

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  // Init auth
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Close dropdown outside
  useEffect(() => {

    const handleClickOutside = (
      e: MouseEvent
    ) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          e.target as Node
        )
      ) {
        setOpen(false);
      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

  }, []);

  // Escape close
  useEffect(() => {

    const handleEsc = (
      e: KeyboardEvent
    ) => {

      if (e.key === "Escape") {
        setOpen(false);
        setMobileSearchOpen(false);
      }

    };

    document.addEventListener(
      "keydown",
      handleEsc
    );

    return () =>
      document.removeEventListener(
        "keydown",
        handleEsc
      );

  }, []);

  // Logout
  const handleLogout = () => {

    setOpen(false);

    localStorage.removeItem("token");

    logout();

    router.push("/login");

  };

  // Merge user info
  const info = extraInfo?.profileData;

  const displayUser = {
    ...user,
    ...info,
  };

  // Loading skeleton
  if (!isHydrated) {

    return (

      <header className="sticky top-0 z-50 border-b bg-white dark:bg-gray-900 h-16">

        <div className="max-w-7xl mx-auto flex justify-between items-center h-full px-4">

          <div className="flex items-center gap-3">

            <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />

            <div className="hidden sm:block h-9 w-48 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />

          </div>

          <div className="flex items-center gap-2">

            <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />

            <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />

          </div>

        </div>

      </header>

    );

  }

  return (

    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-slate-800">

      {/* Main Header */}
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between gap-3">

        {/* LEFT */}
        <div className="flex items-center gap-3 flex-1 min-w-0">

          {/* Mobile Sidebar */}
          {isAuthenticated && (
            <MobileSidebar />
          )}

          {/* Logo */}
          {!isAuthenticated && (

            <Link
              href="/"
              className="font-bold text-lg sm:text-xl shrink-0"
            >
              AuthSystem
            </Link>

          )}

          {/* Desktop Search */}
          {isAuthenticated && (

            <div className="hidden md:block w-full max-w-md">

              <SearchBar />

            </div>

          )}

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Mobile Search Button */}
          {isAuthenticated && (

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() =>
                setMobileSearchOpen(
                  !mobileSearchOpen
                )
              }
            >

              {mobileSearchOpen ? (

                <X className="w-5 h-5" />

              ) : (

                <Search className="w-5 h-5" />

              )}

            </Button>

          )}

          {/* Dark Mode */}
          <Button
            variant="ghost"
            size="icon"
            onClick={HandlDarkMode}
          >

            {Mod ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}

          </Button>

          {/* Authenticated */}
          {isAuthenticated ? (

            <div
              className="relative"
              ref={dropdownRef}
            >

              {/* Avatar */}
              <button
                onClick={() =>
                  setOpen(!open)
                }
                className="rounded-full cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
              >

                {displayUser?.img_user ? (

                  <Image
                    src={displayUser.img_user}
                    alt="avatar"
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover"
                  />

                ) : (

                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm relative">

                    {displayUser?.username
                      ?.charAt(0)
                      .toUpperCase()}

                    {isFetching && (

                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse border-2 border-white dark:border-gray-900" />

                    )}

                  </div>

                )}

              </button>

              {/* Dropdown */}
              {open && (

                <div className="
                  absolute right-0 mt-2 z-50
                  w-56
                  bg-white dark:bg-gray-800
                  border border-slate-200 dark:border-slate-700
                  rounded-2xl shadow-xl
                  p-1.5
                ">

                  {/* User Info */}
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700">

                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">

                      {displayUser?.fullname ||
                        displayUser?.username}

                    </p>

                    <p className="text-xs text-gray-400 truncate mt-0.5">

                      {displayUser?.email || ""}

                    </p>

                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="
                      mt-1
                      w-full flex items-center gap-2.5
                      px-3 py-2
                      text-sm text-red-500
                      hover:bg-red-50
                      dark:hover:bg-red-900/20
                      rounded-xl
                      transition-colors
                    "
                  >

                    <LogOut className="w-4 h-4" />

                    Logout

                  </button>

                </div>

              )}

            </div>

          ) : (

            /* Guest */
            <div className="flex items-center gap-2">

              <Link href="/login">

                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex"
                >
                  Login
                </Button>

              </Link>

              <Link href="/signup">

                <Button
                  size="sm"
                  className="rounded-xl"
                >
                  Sign Up
                </Button>

              </Link>

            </div>

          )}

        </div>

      </div>

      {/* Mobile Search */}
      {isAuthenticated &&
        mobileSearchOpen && (

          <div className="md:hidden px-4 pb-3">

            <SearchBar
              mobile
              onClose={() =>
                setMobileSearchOpen(
                  false
                )
              }
            />

          </div>

        )}

    </header>

  );

}