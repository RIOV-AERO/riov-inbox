import { Suspense } from "react";
import Link from "next/link";
import { Inbox as InboxIcon, SearchX, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildEmailWhere, EMAIL_LIST_SELECT, getLabels } from "@/lib/email-query";
import { FROM_ADDRESS } from "@/lib/resend";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/inbox/SearchBar";
import { FilterChips } from "@/components/inbox/FilterChips";
import { RefreshButton } from "@/components/inbox/RefreshButton";
import { EmailList } from "@/components/inbox/EmailList";
import { EmptyState } from "@/components/inbox/EmptyState";
import { ComposeCta } from "@/components/inbox/ComposeCta";

export const dynamic = "force-dynamic";

interface InboxSearchParams {
  q?: string;
  filter?: string;
  label?: string;
}

const INBOX_SCOPE = {
  direction: "INBOUND" as const,
  archived: false,
  deletedAt: null,
};

async function InboxFilterChipsSection({ params }: { params: InboxSearchParams }) {
  const [unreadCount, labels] = await Promise.all([
    prisma.email.count({ where: { ...INBOX_SCOPE, read: false } }),
    getLabels(),
  ]);

  return <FilterChips unreadCount={unreadCount} labels={labels} />;
}

async function InboxEmailListSection({ params }: { params: InboxSearchParams }) {
  const where = buildEmailWhere(INBOX_SCOPE, params);
  const emails = await prisma.email.findMany({
    where,
    orderBy: { receivedAt: "desc" },
    take: 200,
    select: EMAIL_LIST_SELECT,
  });

  const isFiltered = Boolean(params.q || params.filter || params.label);

  if (emails.length === 0) {
    if (isFiltered) {
      return (
        <EmptyState
          icon={SearchX}
          title="Nada encontrado"
          description={
            params.q
              ? `Sem resultados para "${params.q}". Tente outro termo ou limpe os filtros.`
              : "Nenhum e-mail corresponde a este filtro."
          }
          tone="neutral"
          action={
            <Link
              href="/inbox"
              className="mt-1 rounded-full border border-accent-tint-border bg-accent-tint px-4 py-2 text-[13.5px] font-semibold text-accent-hover"
            >
              Limpar filtros
            </Link>
          }
        />
      );
    }

    return (
      <EmptyState
        icon={InboxIcon}
        title="Nenhum e-mail recebido ainda."
        description={`Assim que algo chegar em ${FROM_ADDRESS}, aparece nesta tela.`}
        action={<ComposeCta label="Escrever o primeiro" />}
      />
    );
  }

  return <EmailList emails={emails} query={params.q} grouped={!params.q} />;
}

function ListSkeleton() {
  return (
    <div className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-riov-xl border border-border bg-surface">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3.5 px-5 py-4">
          <div className="size-9 shrink-0 animate-pulse rounded-riov-md bg-frame" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-2.25 w-40 animate-pulse rounded-1.25 bg-frame" />
            <div className="h-2.75 w-72 animate-pulse rounded-1.25 bg-border-subtle" />
          </div>
          <div className="h-2.25 w-9 shrink-0 animate-pulse rounded-1.25 bg-frame" />
        </div>
      ))}
    </div>
  );
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<InboxSearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Caixa de Entrada" />

      <div className="flex flex-col gap-4 border-b border-border bg-surface px-5 py-4 md:px-7">
        <div className="flex items-center gap-4">
          <SearchBar />
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <RefreshButton />
            <Link
              href="/settings"
              className="flex size-9.5 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink-secondary hover:border-border-strong"
              aria-label="Configurações"
            >
              <SlidersHorizontal size={16} strokeWidth={1.7} />
            </Link>
          </div>
        </div>
        <Suspense fallback={<div className="h-8 w-64 animate-pulse rounded-full bg-frame" />}>
          <InboxFilterChipsSection params={params} />
        </Suspense>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 md:px-7">
        <Suspense fallback={<ListSkeleton />}>
          <InboxEmailListSection params={params} />
        </Suspense>
      </div>
    </div>
  );
}
