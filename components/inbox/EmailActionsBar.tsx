"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  ArrowLeft,
  MailOpen,
  Mail,
  Archive,
  ArchiveRestore,
  Trash2,
  RotateCcw,
} from "lucide-react";
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
  action,
  navigateBack,
  backHref,
  danger,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  action: () => Promise<void>;
  navigateBack?: boolean;
  backHref?: string;
  danger?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await action();
          if (navigateBack && backHref) {
            router.push(backHref);
          }
        });
      }}
      className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13.5px] font-semibold transition-all disabled:opacity-50 ${
        danger
          ? "border-danger-border bg-danger-tint text-danger hover:border-danger"
          : "border-border bg-surface text-ink-secondary hover:border-border-strong"
      }`}
    >
      {isPending ? (
        <span className="size-3.5 animate-riov-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Icon size={15} strokeWidth={1.7} />
      )}
      {label}
    </button>
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
        prefetch={true}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-[13.5px] font-semibold text-ink-secondary hover:border-border-strong"
      >
        <ArrowLeft size={15} strokeWidth={1.8} />
        Voltar
      </Link>
      <div className="h-6 w-px bg-border-subtle" />

      {isTrashed ? (
        <ActionButton
          icon={RotateCcw}
          label="Restaurar"
          action={() => restoreEmailAction(emailId)}
          navigateBack
          backHref="/inbox"
        />
      ) : (
        <>
          {showReadToggle && (
            <ActionButton
              icon={isRead ? Mail : MailOpen}
              label={isRead ? "Marcar como não lido" : "Marcar como lido"}
              action={() => markReadAction(emailId, !isRead)}
            />
          )}
          {isArchived ? (
            <ActionButton
              icon={ArchiveRestore}
              label="Mover p/ entrada"
              action={() => unarchiveEmailAction(emailId)}
              navigateBack
              backHref="/inbox"
            />
          ) : (
            <ActionButton
              icon={Archive}
              label="Arquivar"
              action={() => archiveEmailAction(emailId)}
              navigateBack
              backHref={backHref}
            />
          )}
          <ActionButton
            icon={Trash2}
            label="Excluir"
            action={() => trashEmailAction(emailId)}
            navigateBack
            backHref={backHref}
            danger
          />
        </>
      )}
    </div>
  );
}
