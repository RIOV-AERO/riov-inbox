import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";
import { SESSION_COOKIE } from "@/lib/auth/constants";

// Fast, stateless check: valid signature + not expired. This does NOT hit
// the database, so a revoked-but-not-yet-expired session can still pass
// here — getCurrentUser() (used by the authenticated layout) does the
// authoritative DB-backed check and is what actually enforces logout.
const PUBLIC_PREFIXES = ["/api/webhooks", "/api/health"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const claims = token ? await verifySessionToken(token) : null;

  if (pathname === "/login") {
    if (claims) {
      return NextResponse.redirect(new URL("/inbox", request.url));
    }
    return NextResponse.next();
  }

  if (!claims) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png).*)"],
};
