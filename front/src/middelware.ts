import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const role = request.cookies.get("role")?.value;

  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/" ||
    pathname.startsWith("/verify-email");

  const isAdminRoute = pathname.startsWith("/admin");

  const isUserRoute =
    pathname.startsWith("/dashboard") 

  // ❌ not logged in
  if ((isAdminRoute || isUserRoute) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ❌ logged user visiting auth pages
  if (isAuthPage && token) {
    const target = role === "admin" ? "/admin" : "/dashboard";

    if (pathname !== target) {
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // ❌ user trying admin
  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ❌ admin trying user pages
  if (isUserRoute && role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

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