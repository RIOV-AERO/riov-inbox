import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EMAIL_LIST_SELECT } from "@/lib/email-query";
import { restoreEmailAction } from "@/app/(app)/email-actions";
import { FolderHeader } from "@/components/layout/FolderHeader";
import { EmailList } from "@/components/inbox/EmailList";
import { EmptyState } from "@/components/inbox/EmptyState";

export const dynamic = "force-dynamic";

export default async function TrashPage() {
  const emails = await prisma.email.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { receivedAt: "desc" },
    take: 200,
    select: EMAIL_LIST_SELECT,
  });

  return (
    <div className="flex flex-1 flex-col">
      <FolderHeader title="Lixeira" meta="Itens somem após 30 dias" />
      <div className="flex-1 overflow-y-auto px-5 py-5 md:px-7">
        {emails.length === 0 ? (
          <EmptyState
            icon={Trash2}
            title="Lixeira vazia"
            description="Nada por aqui. E-mails excluídos ficam 30 dias antes de sumir de vez."
            tone="neutral"
          />
        ) : (
          <EmailList
            emails={emails}
            grouped={false}
            action={{ label: "Restaurar", action: restoreEmailAction }}
          />
        )}
      </div>
    </div>
  );
}
