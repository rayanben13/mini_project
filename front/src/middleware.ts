import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // 1. الحصول على التوكن من الـ Cookies
  const token = request.cookies.get("accessToken")?.value;

  const { pathname } = request.nextUrl;

  // 2. تحديد المسارات المحمية والمسارات الخاصة بالضيوف
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isDashboardPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/onboarding");

  // 3. المنطق: إذا كان يحاول دخول لوحة التحكم وهو ليس مسجل دخول
  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. المنطق: إذا كان مسجل دخول ويحاول العودة لصفحة Login أو Register
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// 5. تحديد المسارات التي سيتم تشغيل الميدل وير عليها
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
    "/login",
    "/register",
  ],
};
