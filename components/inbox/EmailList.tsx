import type { EmailListItem } from "@/lib/email-query";
import { groupByDay } from "@/lib/format";
import { EmailListRow, type EmailListRowAction } from "./EmailListRow";

export function EmailList({
  emails,
  direction = "INBOUND",
  query,
  action,
  grouped = true,
}: {
  emails: EmailListItem[];
  direction?: "INBOUND" | "OUTBOUND";
  query?: string;
  action?: EmailListRowAction;
  grouped?: boolean;
}) {
  const groups = grouped
    ? groupByDay(emails, (email) => email.receivedAt)
    : [{ label: "", items: emails }];

  return (
    <div className="flex flex-col gap-4.5">
      {groups.map((group) => (
        <div key={group.label || "flat"} className="flex flex-col gap-3">
          {group.label && (
            <div className="text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
              {group.label}
            </div>
          )}
          <div className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-riov-xl border border-border bg-surface">
            {group.items.map((email) => (
              <EmailListRow
                key={email.id}
                email={email}
                direction={direction}
                query={query}
                action={action}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
