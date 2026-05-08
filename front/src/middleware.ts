import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const role = request.cookies.get("role")?.value;

  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/verify-email");

  const isAdminRoute = pathname.startsWith("/admin");
  const isUserRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/profile");

  // ❌ not logged in → block protected routes
  if ((isAdminRoute || isUserRoute) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ❌ logged in user goes away from auth pages
  if (isAuthPage && token) {
    const target = role === "admin" ? "/admin" : "/dashboard";

    if (pathname !== target) {
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // ❌ prevent user from admin
  if (isAdminRoute && role !== "admin") {
    if (pathname !== "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // ❌ optional: prevent admin staying in dashboard
  if (isUserRoute && role === "admin") {
    if (pathname !== "/admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}
// 5. تحديد المسارات التي سيتم تشغيل الميدل وير عليها
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/verify-email",
    "/",
  ],
};
