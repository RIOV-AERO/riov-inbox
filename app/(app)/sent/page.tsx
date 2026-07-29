import { Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EMAIL_LIST_SELECT } from "@/lib/email-query";
import { FolderHeader } from "@/components/layout/FolderHeader";
import { EmailList } from "@/components/inbox/EmailList";
import { EmptyState } from "@/components/inbox/EmptyState";

export const dynamic = "force-dynamic";

export default async function SentPage() {
  const emails = await prisma.email.findMany({
    where: { direction: "OUTBOUND", deletedAt: null },
    orderBy: { receivedAt: "desc" },
    take: 200,
    select: EMAIL_LIST_SELECT,
  });

  return (
    <div className="flex flex-1 flex-col">
      <FolderHeader
        title="Enviados"
        meta={`${emails.length} e-mail${emails.length === 1 ? "" : "s"}`}
      />
      <div className="flex-1 overflow-y-auto px-5 py-5 md:px-7">
        {emails.length === 0 ? (
          <EmptyState
            icon={Send}
            title="Nenhum e-mail enviado ainda."
            description="Mensagens que você enviar pela RIOV aparecem aqui."
          />
        ) : (
          <EmailList emails={emails} direction="OUTBOUND" />
        )}
      </div>
    </div>
  );
}
