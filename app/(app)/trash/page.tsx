import { Suspense } from "react";
import Link from "next/link";
import { Trash2, SearchX, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  buildEmailWhere,
  EMAIL_LIST_SELECT,
  getLabels,
} from "@/lib/email-query";
import { restoreEmailAction } from "@/app/(app)/email-actions";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/inbox/SearchBar";
import { FilterChips } from "@/components/inbox/FilterChips";
import { RefreshButton } from "@/components/inbox/RefreshButton";
import { EmailList } from "@/components/inbox/EmailList";
import { EmptyState } from "@/components/inbox/EmptyState";

export const dynamic = "force-dynamic";

interface FolderSearchParams {
  q?: string;
  filter?: string;
  label?: string;
}

const TRASH_SCOPE = { deletedAt: { not: null } };

async function TrashFilterChipsSection() {
  const [unreadCount, labels] = await Promise.all([
    prisma.email.count({ where: { ...TRASH_SCOPE, read: false } }),
    getLabels(),
  ]);

  return <FilterChips unreadCount={unreadCount} labels={labels} />;
}

async function TrashEmailListSection({
  params,
}: {
  params: FolderSearchParams;
}) {
  const where = buildEmailWhere(TRASH_SCOPE, params);
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
              ? `Sem resultados para "${params.q}" na lixeira.`
              : "Nenhum e-mail na lixeira corresponde a este filtro."
          }
          tone="neutral"
          action={
            <Link
              href="/trash"
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
        icon={Trash2}
        title="Lixeira vazia"
        description="Nada por aqui. E-mails excluídos ficam 30 dias antes de sumir de vez."
        tone="neutral"
      />
    );
  }

  return (
    <EmailList
      emails={emails}
      query={params.q}
      grouped={!params.q}
      action={{ label: "Restaurar", action: restoreEmailAction }}
    />
  );
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

export default async function TrashPage({
  searchParams,
}: {
  searchParams: Promise<FolderSearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <PageHeader title="Lixeira" />

      <div className="flex shrink-0 flex-col gap-4 border-b border-border bg-surface px-5 py-4 md:px-7">
        <div className="flex items-center gap-4">
          <SearchBar placeholder="Buscar na lixeira…" />
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <RefreshButton />
            <Link
              href="/settings"
              className="flex size-9.5 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink-secondary hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Configurações"
            >
              <SlidersHorizontal size={16} strokeWidth={1.7} />
            </Link>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="h-8 w-64 animate-pulse rounded-full bg-frame" />
          }
        >
          <TrashFilterChipsSection />
        </Suspense>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 md:px-7 min-h-0">
        <Suspense fallback={<ListSkeleton />}>
          <TrashEmailListSection params={params} />
        </Suspense>
      </div>
    </div>
  );
}
