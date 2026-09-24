import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ADMIN_LOGIN = "/admin/login";
const ACCOUNT_PUBLIC = ["/account/login", "/account/register"];

/** Redirect while keeping any refreshed auth cookies. */
function redirectTo(url: URL, sessionResponse: NextResponse) {
  const redirect = NextResponse.redirect(url);
  sessionResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

function loginRedirect(request: NextRequest, loginPath: string, response: NextResponse) {
  const url = new URL(loginPath, request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  return redirectTo(url, response);
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Visitor accounts
  if (pathname.startsWith("/account")) {
    if (ACCOUNT_PUBLIC.includes(pathname)) {
      return user ? redirectTo(new URL("/account", request.url), response) : response;
    }
    return user ? response : loginRedirect(request, "/account/login", response);
  }

  // Admin area
  if (pathname === ADMIN_LOGIN) {
    return user ? redirectTo(new URL("/admin", request.url), response) : response;
  }
  if (!user) return loginRedirect(request, ADMIN_LOGIN, response);

  // Admin rights (profiles.is_admin) are checked in the dashboard layout and by RLS.
  return response;
}

export const config = {
  // Only pages that need a session run the middleware; public pages stay static and cookie-free.
  matcher: ["/admin/:path*", "/account/:path*"],
};
