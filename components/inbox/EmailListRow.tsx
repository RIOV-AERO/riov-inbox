import Link from "next/link";
import { Paperclip } from "lucide-react";
import type { EmailListItem } from "@/lib/email-query";
import { initialFor, listTimestamp, parseSender } from "@/lib/format";
import { avatarColorsFor } from "@/lib/avatar";
import { Highlight } from "./Highlight";

export interface EmailListRowAction {
  label: string;
  action: (emailId: string) => Promise<void>;
}

export function EmailListRow({
  email,
  direction = "INBOUND",
  query,
  action,
}: {
  email: EmailListItem;
  direction?: "INBOUND" | "OUTBOUND";
  query?: string;
  action?: EmailListRowAction;
}) {
  const isOutbound = direction === "OUTBOUND";
  const { name } = parseSender(isOutbound ? email.to : email.from);
  const displayName = isOutbound
    ? `Para ${email.to.split(",")[0].trim()}`
    : name;
  const avatar = avatarColorsFor(isOutbound ? email.to : email.from);
  const unread = !isOutbound && !email.read;

  return (
    <div
      className={`flex items-start gap-3.5 border-l-0.75 px-5 py-4 ${
        unread ? "border-accent bg-[#FCFEFD]" : "border-transparent"
      }`}
    >
      <Link
        href={`/inbox/${email.id}`}
        className="flex min-w-0 flex-1 items-start gap-3.5"
      >
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-riov-md text-sm font-semibold"
          style={{ background: avatar.bg, color: avatar.fg }}
        >
          {initialFor(isOutbound ? email.to : email.from)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span
              className={`truncate text-sm ${unread ? "font-semibold text-ink" : "font-medium text-ink-secondary"}`}
            >
              {displayName}
            </span>
            {unread && (
              <span className="size-1.5 shrink-0 rounded-full bg-accent" />
            )}
          </div>
          <div
            className={`truncate text-[14.5px] ${unread ? "font-semibold text-ink" : "font-medium text-ink"}`}
          >
            <Highlight text={email.subject} query={query} />
          </div>
          {email.text && (
            <div
              className={`truncate text-[13.5px] ${unread ? "text-ink-secondary" : "text-ink-muted"}`}
            >
              {email.text}
            </div>
          )}
        </div>
      </Link>

      <div className="flex shrink-0 flex-col items-end gap-2 pt-0.5">
        <span
          className={`text-[12.5px] font-semibold ${unread ? "text-accent-deep" : "text-ink-muted"}`}
        >
          {listTimestamp(email.receivedAt)}
        </span>
        {email._count.attachments > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-frame px-2.25 py-1 text-[11.5px] font-semibold text-ink-secondary">
            <Paperclip size={12} strokeWidth={1.8} />
            {email._count.attachments}
          </span>
        )}
        {action && (
          <form action={action.action.bind(null, email.id)}>
            <button
              type="submit"
              className="rounded-full border border-border px-2.75 py-1.5 text-[12px] font-semibold text-ink-secondary hover:border-border-strong"
            >
              {action.label}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
