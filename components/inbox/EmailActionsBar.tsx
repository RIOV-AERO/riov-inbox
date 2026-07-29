"use client";

import Link from "next/link";
import { ArrowLeft, MailOpen, Mail, Archive, ArchiveRestore, Trash2, RotateCcw } from "lucide-react";
import {
  markReadAction,
  archiveEmailAction,
  unarchiveEmailAction,
  trashEmailAction,
  restoreEmailAction,
} from "@/app/(app)/email-actions";

function ActionButton({
  icon: Icon,
  label,
  formAction,
  danger,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  formAction: () => Promise<void>;
  danger?: boolean;
}) {
  return (
    <form action={formAction}>
      <button
        type="submit"
        className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13.5px] font-semibold transition-colors ${
          danger
            ? "border-danger-border bg-danger-tint text-danger hover:border-danger"
            : "border-border bg-surface text-ink-secondary hover:border-border-strong"
        }`}
      >
        <Icon size={15} strokeWidth={1.7} />
        {label}
      </button>
    </form>
  );
}

export function EmailActionsBar({
  emailId,
  backHref,
  isRead,
  isArchived,
  isTrashed,
  showReadToggle,
}: {
  emailId: string;
  backHref: string;
  isRead: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  showReadToggle: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-border bg-surface px-5 py-3.5 md:px-7">
      <Link
        href={backHref}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-[13.5px] font-semibold text-ink-secondary hover:border-border-strong"
      >
        <ArrowLeft size={15} strokeWidth={1.8} />
        Voltar
      </Link>
      <div className="h-6 w-px bg-border-subtle" />

      {isTrashed ? (
        <ActionButton icon={RotateCcw} label="Restaurar" formAction={restoreEmailAction.bind(null, emailId)} />
      ) : (
        <>
          {showReadToggle && (
            <ActionButton
              icon={isRead ? Mail : MailOpen}
              label={isRead ? "Marcar como não lido" : "Marcar como lido"}
              formAction={markReadAction.bind(null, emailId, !isRead)}
            />
          )}
          {isArchived ? (
            <ActionButton
              icon={ArchiveRestore}
              label="Mover p/ entrada"
              formAction={unarchiveEmailAction.bind(null, emailId)}
            />
          ) : (
            <ActionButton icon={Archive} label="Arquivar" formAction={archiveEmailAction.bind(null, emailId)} />
          )}
          <ActionButton icon={Trash2} label="Excluir" danger formAction={trashEmailAction.bind(null, emailId)} />
        </>
      )}
    </div>
  );
}
