import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/verify-email");

  const isDashboardPage =
    pathname.startsWith("/dashboard") || pathname.startsWith("/profile");

  const isHomePage = pathname === "/"; // ✅ أضف هذا

  // ❌ غير مسجل ويحاول dashboard
  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ❌ مسجل ويحاول auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ❌ مسجل ويحاول home "/"
  if (isHomePage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
// 5. تحديد المسارات التي سيتم تشغيل الميدل وير عليها
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
    "/verify-email",
    "/",
  ],
};
