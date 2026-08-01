import { cache } from "react";
import { Prisma } from "@/lib/generated/prisma/client/client";
import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth/session";

/** Parses EMPLOYEE_EMAILS from environment variables. */
export function getEmployeeEmailsFromEnv(): string[] {
  const raw = process.env.EMPLOYEE_EMAILS || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Helper to extract target tokens (e.g. full email and local handle before '@') */
function extractTokens(address: string): string[] {
  const clean = address.trim().toLowerCase();
  if (!clean) return [];
  const parts = clean.split("@");
  if (parts.length > 1 && parts[0]) {
    return [clean, parts[0]];
  }
  return [clean];
}

/**
 * Checks if a candidate "From" address corresponds to another employee's private email.
 */
export async function isOtherEmployeePrivateEmail(
  rawFromAddress: string,
  currentUserEmail: string,
): Promise<{ isPrivate: boolean; matchedEmail?: string }> {
  const cleanUserEmail = currentUserEmail.trim().toLowerCase();

  const match = rawFromAddress.match(/<([^>]+)>/);
  const rawTarget = match ? match[1] : rawFromAddress;
  const addressToTest = rawTarget.trim().toLowerCase();

  const testTokens = extractTokens(addressToTest);

  const dbUsers = await prisma.user.findMany({ select: { email: true } });
  const otherEmployeeEmails = Array.from(
    new Set([
      ...getEmployeeEmailsFromEnv(),
      ...dbUsers.map((u) => u.email.trim().toLowerCase()),
    ]),
  ).filter((e) => e !== cleanUserEmail);

  for (const empEmail of otherEmployeeEmails) {
    const empTokens = extractTokens(empEmail);
    for (const token of testTokens) {
      if (empTokens.includes(token)) {
        return { isPrivate: true, matchedEmail: empEmail };
      }
    }
  }

  return { isPrivate: false };
}

/**
 * Builds the Prisma EmailWhereInput visibility scope for the given user.
 * Memoized per request via React cache.
 *
 * Rules:
 * 1. User sees emails matching their own email or any registered alias in registeredEmails.
 * 2. Private employee emails (from EMPLOYEE_EMAILS env or DB users) belong exclusively to those employees.
 * 3. If receiveUnregisteredEmails is true, user also sees emails NOT addressed to any other employee's private email.
 */
export const buildUserEmailScope = cache(
  async (user: CurrentUser): Promise<Prisma.EmailWhereInput> => {
    const cleanUserEmail = user.email.trim().toLowerCase();

    // 1. Collect all DB user emails and environment employee emails
    const dbUsers = await prisma.user.findMany({ select: { email: true } });
    const allEmployeeEmails = Array.from(
      new Set([
        ...getEmployeeEmailsFromEnv(),
        ...dbUsers.map((u) => u.email.trim().toLowerCase()),
      ]),
    );

    // 2. Other employees' private targets (strictly all employee emails except current user's email)
    const otherEmployeeEmails = allEmployeeEmails.filter(
      (e) => e !== cleanUserEmail,
    );
    const otherEmployeeTargets = Array.from(
      new Set(otherEmployeeEmails.flatMap((addr) => extractTokens(addr))),
    );
    const otherEmployeeTargetSet = new Set(otherEmployeeTargets);

    // 3. User's allowed targets: user's primary email + registeredEmails filtered to exclude other employees' private targets
    const safeRegisteredEmails = (user.registeredEmails || []).filter(
      (addr) => {
        const tokens = extractTokens(addr);
        return !tokens.some((t) => otherEmployeeTargetSet.has(t));
      },
    );

    const userAddresses = [user.email, ...safeRegisteredEmails];
    const userTargets = Array.from(
      new Set(userAddresses.flatMap((addr) => extractTokens(addr))),
    );

    // 4. Construct direct match conditions for user's allowed targets
    const directMatchConditions: Prisma.EmailWhereInput[] = userTargets.map(
      (target) => ({
        to: { contains: target, mode: "insensitive" as const },
      }),
    );

    const directScope: Prisma.EmailWhereInput =
      directMatchConditions.length > 0 ? { OR: directMatchConditions } : {};

    if (!user.receiveUnregisteredEmails || otherEmployeeTargets.length === 0) {
      return directScope;
    }

    // 5. Unregistered / catch-all condition
    const unregisteredCondition: Prisma.EmailWhereInput = {
      AND: otherEmployeeTargets.map((target) => ({
        to: { not: { contains: target, mode: "insensitive" as const } },
      })),
    };

    return {
      OR: [...directMatchConditions, unregisteredCondition],
    };
  },
);

/**
 * Merges user visibility rules with direction checks.
 * OUTBOUND emails are visible, while INBOUND emails must satisfy the user scope.
 */
export async function getInboundOrOutboundUserScope(
  user: CurrentUser,
): Promise<Prisma.EmailWhereInput> {
  const userScope = await buildUserEmailScope(user);

  return {
    OR: [{ direction: "OUTBOUND" }, { direction: "INBOUND", AND: [userScope] }],
  };
}
