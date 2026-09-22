import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const isProtected = request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/account");
  if (isProtected && !request.cookies.has("ys_session")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*", "/account/:path*"] };
