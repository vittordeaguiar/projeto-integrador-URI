import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log(session);

  if (
    !session &&
    req.nextUrl.pathname !== "/login" &&
    req.nextUrl.pathname !== "/" &&
    req.nextUrl.pathname !== "/novo-ticket" &&
    !req.nextUrl.pathname.startsWith("/images") &&
    !req.nextUrl.pathname.startsWith("/icons")
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session && req.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
