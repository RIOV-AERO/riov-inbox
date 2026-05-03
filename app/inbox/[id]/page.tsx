import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function EmailDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const email = await prisma.email.findUnique({ where: { id } });
  if (!email) notFound();

  if (!email.read) {
    await prisma.email.update({ where: { id }, data: { read: true } });
    revalidatePath("/inbox");
  }

  return (
    <main className="mx-auto max-w-5xl p-6 font-mono">
      <header className="mb-6 flex items-start justify-between border-b border-zinc-800 pb-3">
        <h1 className="mr-6 text-xl font-bold leading-tight">
          {email.subject}
        </h1>
        <Link
          href="/inbox"
          className="shrink-0 text-xs text-zinc-400 hover:text-rio-green"
        >
          ← inbox
        </Link>
      </header>

      <div className="mb-6 space-y-1.5 text-sm">
        <div className="flex gap-3">
          <span className="w-10 shrink-0 text-zinc-500">de</span>
          <span className="text-zinc-300">{email.from}</span>
        </div>
        <div className="flex gap-3">
          <span className="w-10 shrink-0 text-zinc-500">para</span>
          <span className="text-zinc-300">{email.to}</span>
        </div>
        <div className="flex gap-3">
          <span className="w-10 shrink-0 text-zinc-500">data</span>
          <span className="text-zinc-300">{formatDate(email.receivedAt)}</span>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-6">
        {email.html ? (
          <iframe
            srcDoc={email.html}
            sandbox=""
            className="h-[680px] w-full rounded border border-zinc-800 bg-white"
            title="conteúdo do email"
          />
        ) : email.text ? (
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
            {email.text}
          </pre>
        ) : (
          <p className="text-sm text-zinc-500">(sem conteúdo)</p>
        )}
      </div>
    </main>
  );
}
