"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "./sidebar-context";

export function MobileMenuButton() {
  const { open } = useSidebar();
  return (
    <button
      type="button"
      onClick={open}
      className="flex size-9 shrink-0 items-center justify-center text-ink md:hidden"
      aria-label="Abrir menu"
    >
      <Menu size={20} strokeWidth={1.7} />
    </button>
  );
}
