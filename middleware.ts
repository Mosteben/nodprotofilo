import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const LOGIN_PATH = "/admin/login";

/** Redirect while keeping any refreshed auth cookies. */
function redirectTo(url: URL, sessionResponse: NextResponse) {
  const redirect = NextResponse.redirect(url);
  sessionResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname === LOGIN_PATH) {
    return user ? redirectTo(new URL("/admin", request.url), response) : response;
  }

  if (!user) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", pathname);
    return redirectTo(loginUrl, response);
  }

  // Admin rights (profiles.is_admin) are checked in the dashboard layout and by RLS.
  return response;
}

export const config = {
  // Only the admin area needs a session; public pages stay static and cookie-free.
  matcher: ["/admin/:path*"],
};
