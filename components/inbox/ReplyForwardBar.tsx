"use client";

import { Reply, Forward } from "lucide-react";
import { useCompose } from "../compose/compose-context";

export function ReplyForwardBar({
  emailId,
  senderEmail,
  subject,
  className = "",
}: {
  emailId: string;
  senderEmail: string;
  subject: string;
  className?: string;
}) {
  const { openCompose } = useCompose();

  return (
    <div className={`flex items-center gap-2.5 pt-2 shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() =>
          openCompose({
            to: senderEmail,
            subject: subject.toLowerCase().startsWith("re:")
              ? subject
              : `Re: ${subject}`,
            replyToEmailId: emailId,
          })
        }
        className="flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-transform active:scale-95 hover:bg-ink/90"
      >
        <Reply size={14} strokeWidth={1.8} />
        Responder
      </button>
      <button
        type="button"
        onClick={() =>
          openCompose({
            subject: subject.toLowerCase().startsWith("fwd:")
              ? subject
              : `Fwd: ${subject}`,
            body: `\n\n---------- Mensagem encaminhada ----------\n`,
            replyToEmailId: emailId,
          })
        }
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs sm:text-sm font-semibold text-ink-secondary shadow-sm transition-transform active:scale-95 hover:border-border-strong hover:bg-surface/80"
      >
        <Forward size={14} strokeWidth={1.8} />
        Encaminhar
      </button>
    </div>
  );
}
