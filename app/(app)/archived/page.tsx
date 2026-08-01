import Link from "next/link";
import { Archive, SearchX, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildEmailWhere, EMAIL_LIST_SELECT, getLabels } from "@/lib/email-query";
import { unarchiveEmailAction } from "@/app/(app)/email-actions";
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

export default async function ArchivedPage({
  searchParams,
}: {
  searchParams: Promise<FolderSearchParams>;
}) {
  const params = await searchParams;
  const scope = { archived: true, deletedAt: null };
  const where = buildEmailWhere(scope, params);

  const [emails, unreadCount, labels] = await Promise.all([
    prisma.email.findMany({
      where,
      orderBy: { receivedAt: "desc" },
      take: 200,
      select: EMAIL_LIST_SELECT,
    }),
    prisma.email.count({ where: { ...scope, read: false } }),
    getLabels(),
  ]);

  const isFiltered = Boolean(params.q || params.filter || params.label);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Arquivados" />

      <div className="flex flex-col gap-4 border-b border-border bg-surface px-5 py-4 md:px-7">
        <div className="flex items-center gap-4">
          <SearchBar placeholder="Buscar arquivados…" />
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
        <FilterChips
          unreadCount={unreadCount}
          labels={labels}
          resultCount={params.q ? emails.length : undefined}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 md:px-7">
        {emails.length === 0 ? (
          isFiltered ? (
            <EmptyState
              icon={SearchX}
              title="Nada encontrado"
              description={
                params.q
                  ? `Sem resultados para "${params.q}" nos arquivados.`
                  : "Nenhum e-mail arquivado corresponde a este filtro."
              }
              tone="neutral"
              action={
                <Link
                  href="/archived"
                  className="mt-1 rounded-full border border-accent-tint-border bg-accent-tint px-4 py-2 text-[13.5px] font-semibold text-accent-hover"
                >
                  Limpar filtros
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={Archive}
              title="Nada arquivado."
              description="Conversas que você arquivar saem da caixa de entrada e aparecem aqui."
              tone="neutral"
            />
          )
        ) : (
          <EmailList
            emails={emails}
            query={params.q}
            grouped={!params.q}
            action={{ label: "Mover p/ entrada", action: unarchiveEmailAction }}
          />
        )}
      </div>
    </div>
  );
}
