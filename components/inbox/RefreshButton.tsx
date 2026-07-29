"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      className="flex size-9.5 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink-secondary hover:border-border-strong"
      aria-label="Atualizar"
    >
      <RefreshCw
        size={16}
        strokeWidth={1.7}
        className={isPending ? "animate-spin" : ""}
      />
    </button>
  );
}
