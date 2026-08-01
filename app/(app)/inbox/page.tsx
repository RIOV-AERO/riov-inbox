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

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<InboxSearchParams>;
}) {
  const params = await searchParams;
  const scope = {
    direction: "INBOUND" as const,
    archived: false,
    deletedAt: null,
  };
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
          ) : (
            <EmptyState
              icon={InboxIcon}
              title="Nenhum e-mail recebido ainda."
              description={`Assim que algo chegar em ${FROM_ADDRESS}, aparece nesta tela.`}
              action={<ComposeCta label="Escrever o primeiro" />}
            />
          )
        ) : (
          <EmailList emails={emails} query={params.q} grouped={!params.q} />
        )}
      </div>
    </div>
  );
}
