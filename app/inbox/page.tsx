import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function parseFrom(from: string): string {
  const match = from.match(/^(.+?)\s*<.+>$/);
  if (match) return match[1].trim();
  return from;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function InboxPage() {
  const emails = await prisma.email.findMany({
    orderBy: { receivedAt: "desc" },
    take: 200,
  });

  const unreadCount = emails.filter((e) => !e.read).length;

  return (
    <main className="mx-auto max-w-5xl p-6 font-mono">
      <header className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">inbox</h1>
          {unreadCount > 0 && (
            <span className="rounded bg-rio-green/20 px-2 py-0.5 text-xs text-rio-green">
              {unreadCount} não lido{unreadCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">riov</span>
          <Link
            href="/send"
            className="rounded border border-zinc-700 px-3 py-1 text-xs hover:border-rio-green hover:text-rio-green"
          >
            + novo
          </Link>
        </div>
      </header>

      {/* webhook status — links to /api/health for full detail */}
      <a
        href="/api/health"
        target="_blank"
        rel="noreferrer"
        className="mb-5 flex w-fit items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-rio-green" />
        webhook ativo · inbox.riov.com.br/api/webhooks/resend
      </a>

      {emails.length === 0 ? (
        <p className="text-sm text-zinc-500">nenhum email recebido ainda.</p>
      ) : (
        <div className="flex flex-col">
          {emails.map((email) => (
            <Link
              key={email.id}
              href={`/inbox/${email.id}`}
              className="flex items-center gap-4 border-b border-zinc-900 px-2 py-3 hover:bg-zinc-900/40"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-rio-green"
                style={{ visibility: email.read ? "hidden" : "visible" }}
              />
              <span
                className={`w-44 shrink-0 truncate text-sm ${
                  email.read ? "text-zinc-500" : "font-medium text-zinc-100"
                }`}
              >
                {parseFrom(email.from)}
              </span>
              <span
                className={`flex-1 truncate text-sm ${
                  email.read ? "text-zinc-500" : "text-zinc-300"
                }`}
              >
                {email.subject}
              </span>
              <span className="shrink-0 text-xs text-zinc-600">
                {formatDate(email.receivedAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
