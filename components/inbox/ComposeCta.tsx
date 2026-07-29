"use client";

import { Plus } from "lucide-react";
import { useCompose } from "../compose/compose-context";

export function ComposeCta({ label }: { label: string }) {
  const { openCompose } = useCompose();
  return (
    <button
      type="button"
      onClick={() => openCompose()}
      className="mt-1 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-riov-cta transition-colors hover:bg-accent-hover"
    >
      <Plus size={15} strokeWidth={2.2} />
      {label}
    </button>
  );
}
