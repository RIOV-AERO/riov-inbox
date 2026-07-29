// No "server-only" / Prisma imports here — this file is shared with
// middleware.ts, which needs to stay lightweight (no DB connection per
// request just to decide whether to redirect to /login).
export const SESSION_COOKIE = "riov_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
