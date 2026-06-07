import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "crm_session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE);
  const isAuth = session?.value === "authenticated";

  if (isAuth && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (!isAuth && !pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
