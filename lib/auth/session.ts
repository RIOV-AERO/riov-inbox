import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signSessionToken, verifySessionToken } from "./jwt";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "./constants";

export { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS };

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  density: "COMPACT" | "COMFORTABLE" | "SPACIOUS";
  loadExternalImages: boolean;
  desktopNotifications: boolean;
  signature: string | null;
}

/** Creates a DB-backed session for `userId` and sets the signed JWT cookie. */
export async function createSession(userId: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  // The refresh token hash column also doubles as a lookup key today, so we
  // store a random placeholder here — this project doesn't rotate refresh
  // tokens separately from the session record, but the column keeps the
  // schema ready for that without a migration.
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: crypto.randomUUID(),
      expiresAt,
    },
  });

  const token = await signSessionToken(
    { sub: user.id, sid: session.id, email: user.email, name: user.name },
    SESSION_MAX_AGE_SECONDS,
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Verifies the session cookie's signature *and* confirms the underlying
 * Session row still exists and hasn't expired — this is what makes logout /
 * revocation actually take effect before the JWT's own expiry.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const claims = await verifySessionToken(token);
  if (!claims) return null;

  const session = await prisma.session.findUnique({
    where: { id: claims.sid },
    select: {
      expiresAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          density: true,
          loadExternalImages: true,
          desktopNotifications: true,
          signature: true,
        },
      },
    },
  });

  if (!session || session.userId !== claims.sub) return null;
  if (session.expiresAt.getTime() < Date.now()) return null;

  return session.user;
}

/** Redirects to /login when there is no valid session. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Deletes the underlying Session row and clears the cookie. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const claims = await verifySessionToken(token);
    if (claims) {
      await prisma.session.delete({ where: { id: claims.sid } }).catch(() => {
        // already gone — fine, we're deleting the cookie regardless
      });
    }
  }

  cookieStore.delete(SESSION_COOKIE);
}
