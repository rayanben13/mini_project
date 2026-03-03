// src/components/Navbar.tsx

"use client";

// import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ShadCN
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Icons
import { BookOpen, Home, LogIn, Menu, UserPlus } from "lucide-react";

export default function Navbar() {
  //   const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  //   const handleLogout = () => {
  //     logout();
  //     router.push("/");
  //     setMobileOpen(false);
  //   };

  // الحروف الأولى من الاسم للأفاتار
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // ════════════════════════════
  // روابط التنقل
  // ════════════════════════════
  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    // ...(user ? [{ href: "/study-list", label: "Study List", icon: Star }] : []),
    // ...(user?.role === "admin"
    //   ? [{ href: "/admin", label: "Dashboard", icon: Shield }]
    //   : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ════════════ LOGO ════════════ */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="hidden text-xl font-bold text-gray-900 sm:block">
              Student<span className="text-blue-600">Files</span>
            </span>
          </Link>

          {/* ════════════ DESKTOP NAV LINKS ════════════ */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* ════════════ DESKTOP AUTH SECTION ════════════ */}
          <div className="hidden items-center gap-3 md:flex">
            {/* {loading ? (
              // Loading skeleton
              <div className="h-9 w-24 animate-pulse rounded-md bg-gray-200" />
            ) : user ? (
              // ═══ المستخدم مسجل ═══
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-sm font-semibold text-blue-600">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden flex-col items-start lg:flex">
                      <span className="text-sm font-medium text-gray-900">
                        {user.fullName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {user.role === "admin" ? "🛡️ Admin" : "🎓 Student"}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {user.fullName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/study-list")}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Study List
                  </DropdownMenuItem>

                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => router.push("/admin")}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => router.push("/admin/pending-files")}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Pending Files
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : ( */}

            {/* guest user */}
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </div>
            {/* )} */}
          </div>

          {/* ════════════ MOBILE MENU BUTTON ════════════ */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-80 p-0">
              <SheetHeader className="border-b p-4">
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  Student<span className="text-blue-600">Files</span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col p-4">
                {/* ═══ معلومات المستخدم (Mobile) ═══ */}
                {/* {user && (
                  <>
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-lg font-semibold text-blue-600">
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {user.fullName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {user.email}
                        </span>
                        <span className="mt-1 inline-flex w-fit items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {user.role === "admin" ? "🛡️ Admin" : "🎓 Student"}
                        </span>
                      </div>
                    </div>
                    <Separator className="my-4" />
                  </>
                )} */}

                {/* ═══ روابط التنقل (Mobile) ═══ */}
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-gray-600 hover:text-blue-600"
                        onClick={() => setMobileOpen(false)}
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* ═══ أزرار Auth (Mobile) ═══ */}
                {/* {user ? (
                  <div className="flex flex-col gap-1">
                    <Link href="/profile">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3"
                        onClick={() => setMobileOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        Profile
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </Button>
                  </div>
                ) : ( */}
                <div className="flex flex-col gap-2">
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => setMobileOpen(false)}
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button
                      className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                      onClick={() => setMobileOpen(false)}
                    >
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </Button>
                  </Link>
                </div>
                {/* )} */}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
