import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { FileCode2, Paperclip } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  parseSender,
  initialFor,
  formatFullDateTime,
  formatRelative,
} from "@/lib/format";
import { avatarColorsFor } from "@/lib/avatar";
import { EmailActionsBar } from "@/components/inbox/EmailActionsBar";
import { AttachmentCard } from "@/components/inbox/AttachmentCard";
import { ReplyForwardBar } from "@/components/inbox/ReplyForwardBar";

export const dynamic = "force-dynamic";

export default async function EmailDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const email = await prisma.email.findUnique({
    where: { id },
    include: {
      attachments: {
        select: { id: true, filename: true, contentType: true, size: true },
      },
      labels: { select: { id: true, name: true, color: true } },
    },
  });

  if (!email) notFound();

  if (!email.read && email.direction === "INBOUND") {
    await prisma.email.update({ where: { id }, data: { read: true } });
    revalidatePath("/inbox");
  }

  const backHref = email.deletedAt
    ? "/trash"
    : email.archived
      ? "/archived"
      : email.direction === "OUTBOUND"
        ? "/sent"
        : "/inbox";

  const { name, email: senderEmail } = parseSender(email.from);
  const avatar = avatarColorsFor(email.from);

  return (
    <div className="flex flex-1 flex-col">
      <EmailActionsBar
        emailId={email.id}
        backHref={backHref}
        isRead={email.read}
        isArchived={email.archived}
        isTrashed={Boolean(email.deletedAt)}
        showReadToggle={email.direction === "INBOUND"}
      />

      <div className="mx-auto flex w-full max-w-210 flex-1 flex-col gap-5 px-5 py-7 md:px-7">
        <div className="flex flex-col gap-4 rounded-riov-xl border border-border bg-surface p-6">
          <h1 className="text-2xl leading-tight font-bold tracking-tight text-ink text-pretty">
            {email.subject}
          </h1>
          <div className="flex items-start gap-3.5">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-riov-lg text-base font-semibold"
              style={{ background: avatar.bg, color: avatar.fg }}
            >
              {initialFor(email.from)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[14.5px] font-semibold text-ink">
                  {name}
                </span>
                <span className="text-[13.5px] text-ink-muted">
                  &lt;{senderEmail}&gt;
                </span>
                {email.labels.map((label) => (
                  <span
                    key={label.id}
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    style={{
                      background: `${label.color}22`,
                      color: label.color,
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
              <div className="text-[13.5px] text-ink-secondary">
                para <span className="text-ink">{email.to}</span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
              <div className="text-[13.5px] font-semibold text-ink">
                {formatFullDateTime(email.receivedAt)}
              </div>
              <div className="text-[12.5px] text-ink-muted">
                {formatRelative(email.receivedAt)}
              </div>
            </div>
          </div>
        </div>

        {email.html ? (
          <div className="overflow-hidden rounded-riov-xl border border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border-subtle bg-[#FAFAF8] px-4.5 py-2.5">
              <FileCode2
                size={13}
                strokeWidth={1.7}
                className="text-ink-muted"
              />
              <span className="text-[11.5px] font-semibold tracking-wider text-ink-muted uppercase">
                Conteúdo HTML · exibido em sandbox
              </span>
            </div>
            <iframe
              srcDoc={email.html}
              sandbox=""
              title="Conteúdo do e-mail"
              className="h-140 w-full bg-white"
            />
          </div>
        ) : email.text ? (
          <div className="rounded-riov-xl border border-border bg-surface p-7">
            <pre className="max-w-[68ch] font-sans text-[15.5px] leading-relaxed break-words whitespace-pre-wrap text-[#26302B]">
              {email.text}
            </pre>
          </div>
        ) : (
          <div className="rounded-riov-xl border border-border bg-surface p-7 text-sm text-ink-muted">
            (sem conteúdo)
          </div>
        )}

        {email.attachments.length > 0 && (
          <div className="flex flex-col gap-3.5 rounded-riov-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <Paperclip
                size={15}
                strokeWidth={1.7}
                className="text-ink-secondary"
              />
              <span className="text-[14.5px] font-semibold text-ink">
                Anexos
              </span>
              <span className="rounded-full bg-frame px-2 py-0.5 text-[12px] font-semibold text-ink-secondary">
                {email.attachments.length}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {email.attachments.map((att) => (
                <AttachmentCard
                  key={att.id}
                  id={att.id}
                  filename={att.filename}
                  contentType={att.contentType}
                  size={att.size}
                />
              ))}
            </div>
          </div>
        )}

        {email.direction === "INBOUND" && (
          <ReplyForwardBar
            emailId={email.id}
            senderEmail={senderEmail}
            subject={email.subject}
          />
        )}
      </div>
    </div>
  );
}
