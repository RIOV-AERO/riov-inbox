import { cache } from "react";
import { Prisma } from "@/lib/generated/prisma/client/client";
import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth/session";
import {
  buildUserEmailScope,
  getInboundOrOutboundUserScope,
} from "@/lib/user-emails";

export const getLabels = cache(async () => {
  return prisma.label.findMany({ orderBy: { name: "asc" } });
});

export const getSidebarCounts = cache(async (user?: CurrentUser | null) => {
  const userScope = user ? await buildUserEmailScope(user) : null;
  const userGeneralScope = user
    ? await getInboundOrOutboundUserScope(user)
    : null;

  const inboxScope: Prisma.EmailWhereInput = {
    direction: "INBOUND",
    archived: false,
    deletedAt: null,
    ...(userScope ? { AND: [userScope] } : {}),
  };

  const archivedScope: Prisma.EmailWhereInput = {
    archived: true,
    deletedAt: null,
    ...(userGeneralScope ? { AND: [userGeneralScope] } : {}),
  };

  const [inbox, unread, archived] = await Promise.all([
    prisma.email.count({ where: inboxScope }),
    prisma.email.count({ where: { ...inboxScope, read: false } }),
    prisma.email.count({ where: archivedScope }),
  ]);

  return { inbox, unread, archived };
});

export interface EmailFilters {
  q?: string;
  filter?: string;
  label?: string;
}

/** Merges the folder-specific scope (inbox/sent/archived/trash) with the
 * shared search bar + filter chip query params and optional user scope. */
export function buildEmailWhere(
  scope: Prisma.EmailWhereInput,
  filters: EmailFilters,
  userScope?: Prisma.EmailWhereInput | null,
): Prisma.EmailWhereInput {
  const where: Prisma.EmailWhereInput = { ...scope };

  if (filters.filter === "unread") where.read = false;
  if (filters.filter === "attachments") where.attachments = { some: {} };
  if (filters.label) where.labels = { some: { slug: filters.label } };

  if (filters.q) {
    where.OR = [
      { subject: { contains: filters.q, mode: "insensitive" } },
      { from: { contains: filters.q, mode: "insensitive" } },
      { text: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  if (userScope) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      userScope,
    ];
  }

  return where;
}

export const EMAIL_LIST_SELECT = {
  id: true,
  from: true,
  to: true,
  subject: true,
  text: true,
  read: true,
  archived: true,
  deletedAt: true,
  receivedAt: true,
  labels: { select: { id: true, slug: true, name: true, color: true } },
  _count: { select: { attachments: true } },
} satisfies Prisma.EmailSelect;

export type EmailListItem = Prisma.EmailGetPayload<{
  select: typeof EMAIL_LIST_SELECT;
}>;
