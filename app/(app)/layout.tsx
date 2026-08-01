import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getLabels } from "@/lib/email-query";
import { AppProviders } from "@/components/providers/AppProviders";
import { Sidebar } from "@/components/layout/Sidebar";

export const dynamic = "force-dynamic";

async function loadSidebarData() {
  const inboxScope = {
    direction: "INBOUND" as const,
    archived: false,
    deletedAt: null,
  };

  const [inbox, unread, archived, labels] = await Promise.all([
    prisma.email.count({ where: inboxScope }),
    prisma.email.count({ where: { ...inboxScope, read: false } }),
    prisma.email.count({ where: { archived: true, deletedAt: null } }),
    getLabels(),
  ]);

  return { counts: { inbox, unread, archived }, labels };
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const { counts, labels } = await loadSidebarData();

  return (
    <AppProviders>
      <div className="flex min-h-screen">
        <Sidebar
          counts={counts}
          labels={labels}
          user={{ name: user.name, email: user.email }}
        />
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </AppProviders>
  );
}
