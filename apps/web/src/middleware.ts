import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Protect (app) and (onboarding) routes
  const protectedPaths = ["/dashboard", "/scanner", "/resumes", "/cold-email", "/keywords", "/tracker", "/profile", "/onboarding"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !isAuthenticated) {
    const signInUrl = new URL("/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect authenticated users away from signin
  if (pathname === "/signin" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
