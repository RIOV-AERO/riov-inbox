import Link from "next/link";
import ComposeForm from "./_components/ComposeForm";

export default function SendPage() {
  return (
    <main className="mx-auto max-w-2xl p-6 font-mono">
      <header className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-3">
        <h1 className="text-2xl font-bold">novo email</h1>
        <Link href="/inbox" className="text-xs text-zinc-400 hover:text-rio-green">
          ← inbox
        </Link>
      </header>
      <ComposeForm />
    </main>
  );
}
