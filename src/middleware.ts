import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const authCookie = req.cookies
    .getAll()
    .find(
      (cookie) =>
        cookie.name.includes("supabase") ||
        cookie.name.includes("sb-") ||
        cookie.name.includes("auth-token"),
    );

  console.log("Auth cookie found:", authCookie?.name);

  if (req.nextUrl.pathname === "/dashboard") {
    console.log("Allowing access to dashboard");
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
