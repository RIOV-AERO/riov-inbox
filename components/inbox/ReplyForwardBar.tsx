"use client";

import { Reply, Forward } from "lucide-react";
import { useCompose } from "../compose/compose-context";

export function ReplyForwardBar({
  emailId,
  senderEmail,
  subject,
}: {
  emailId: string;
  senderEmail: string;
  subject: string;
}) {
  const { openCompose } = useCompose();

  return (
    <div className="flex gap-2.5">
      <button
        type="button"
        onClick={() =>
          openCompose({
            to: senderEmail,
            subject: subject.toLowerCase().startsWith("re:") ? subject : `Re: ${subject}`,
            replyToEmailId: emailId,
          })
        }
        className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink/90"
      >
        <Reply size={15} strokeWidth={1.8} />
        Responder
      </button>
      <button
        type="button"
        onClick={() =>
          openCompose({
            subject: subject.toLowerCase().startsWith("fwd:") ? subject : `Fwd: ${subject}`,
            body: `\n\n---------- Mensagem encaminhada ----------\n`,
            replyToEmailId: emailId,
          })
        }
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-ink-secondary hover:border-border-strong"
      >
        <Forward size={15} strokeWidth={1.8} />
        Encaminhar
      </button>
    </div>
  );
}
