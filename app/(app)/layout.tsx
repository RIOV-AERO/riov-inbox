import { requireUser } from "@/lib/auth/session";
import { getLabels, getSidebarCounts } from "@/lib/email-query";
import { AppProviders } from "@/components/providers/AppProviders";
import { Sidebar } from "@/components/layout/Sidebar";

export const dynamic = "force-dynamic";

async function loadSidebarData() {
  const [counts, labels] = await Promise.all([getSidebarCounts(), getLabels()]);

  return { counts, labels };
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
      <div className="flex h-screen w-full overflow-hidden bg-page">
        <Sidebar
          counts={counts}
          labels={labels}
          user={{ name: user.name, email: user.email }}
        />
        <main className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
          {children}
        </main>
      </div>
    </AppProviders>
  );
}
