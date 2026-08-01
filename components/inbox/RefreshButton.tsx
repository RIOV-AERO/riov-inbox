"use client";

import { RefreshCw } from "lucide-react";
import { useAutoRefresh } from "@/components/providers/auto-refresh-context";

export function RefreshButton() {
  const { refresh, isRefreshing } = useAutoRefresh();

  return (
    <button
      type="button"
      onClick={refresh}
      className="flex size-9.5 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink-secondary hover:border-border-strong"
      aria-label="Atualizar"
    >
      <RefreshCw
        size={16}
        strokeWidth={1.7}
        className={isRefreshing ? "animate-spin" : ""}
      />
    </button>
  );
}
