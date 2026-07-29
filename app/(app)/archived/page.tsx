import { Archive } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EMAIL_LIST_SELECT } from "@/lib/email-query";
import { unarchiveEmailAction } from "@/app/(app)/email-actions";
import { FolderHeader } from "@/components/layout/FolderHeader";
import { EmailList } from "@/components/inbox/EmailList";
import { EmptyState } from "@/components/inbox/EmptyState";

export const dynamic = "force-dynamic";

export default async function ArchivedPage() {
  const emails = await prisma.email.findMany({
    where: { archived: true, deletedAt: null },
    orderBy: { receivedAt: "desc" },
    take: 200,
    select: EMAIL_LIST_SELECT,
  });

  return (
    <div className="flex flex-1 flex-col">
      <FolderHeader
        title="Arquivados"
        meta={`${emails.length} conversa${emails.length === 1 ? "" : "s"}`}
      />
      <div className="flex-1 overflow-y-auto px-5 py-5 md:px-7">
        {emails.length === 0 ? (
          <EmptyState
            icon={Archive}
            title="Nada arquivado."
            description="Conversas que você arquivar saem da caixa de entrada e aparecem aqui."
            tone="neutral"
          />
        ) : (
          <EmailList
            emails={emails}
            grouped={false}
            action={{ label: "Mover p/ entrada", action: unarchiveEmailAction }}
          />
        )}
      </div>
    </div>
  );
}
